const GITHUB_REPO = 'XVCHub/wow';
const GITHUB_BRANCH = 'main';

const FOLDER_ROUTES = {
  '👅': 'images',
  'cracks': 'cracks',
  'libs/kick': 'libs/kick',
  'docs/kicklib': 'docs/kicklib'
};

export async function onRequest(context) {
  const url = new URL(context.request.url);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === '/') {
    return new Response(getHomePage(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  if (pathname === '/docs/kicklib') {
    return new Response(getKickLibDocs(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  for (const [route, folder] of Object.entries(FOLDER_ROUTES)) {
    if (pathname === '/' + route) {
      return await listFiles(folder, route);
    }
    
    if (pathname.startsWith('/' + route + '/')) {
      const filename = pathname.replace('/' + route + '/', '');
      return await fetchFromGitHub(folder, filename);
    }
  }

  if (pathname !== '/') {
    const filename = pathname.substring(1);
    return await fetchFromGitHub('scripts', filename);
  }

  return new Response('404 - Not Found', { 
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

async function fetchFromGitHub(folder, filename) {
  try {
    let actualFilename = filename;
    
    if (!filename.includes('.')) {
      const apiUrl = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + folder;
      const filesResponse = await fetch(apiUrl, { 
        headers: { 
          'User-Agent': 'Cloudflare-Worker',
          'Accept': 'application/vnd.github.v3+json'
        } 
      });
      
      if (filesResponse.ok) {
        const files = await filesResponse.json();
        const baseName = filename.toLowerCase();
        
        let foundFile = null;
        let highestVersion = 0;
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type !== 'file') continue;
          
          const name = file.name.toLowerCase();
          
          if (name === baseName + '.lua' || name === baseName + '.txt' || 
              name === baseName + '.js' || name === baseName + '.py' ||
              name === baseName + '.png' || name === baseName + '.jpg' || 
              name === baseName + '.jpeg' || name === baseName + '.gif' ||
              name === baseName + '.webp' || name === baseName + '.svg' ||
              name === baseName + '.exe' || name === baseName + '.dll' ||
              name === baseName + '.zip' || name === baseName + '.rar') {
            foundFile = file.name;
            break;
          }
          
          const versionMatch = name.match(
            new RegExp('^' + baseName + 'v([0-9]+)\\.(lua|txt|js|py|png|jpg|jpeg|gif|webp|svg|exe|dll|zip|rar)$')
          );
          
          if (versionMatch) {
            const versionNum = parseInt(versionMatch[1]);
            if (versionNum > highestVersion) {
              highestVersion = versionNum;
              foundFile = file.name;
            }
          }
        }
        
        if (foundFile) {
          actualFilename = foundFile;
        }
      }
    }

    const rawUrl = 'https://raw.githubusercontent.com/' + GITHUB_REPO + '/' + GITHUB_BRANCH + '/' + folder + '/' + actualFilename;
    const response = await fetch(rawUrl);

    if (!response.ok) {
      return new Response('File not found: ' + folder + '/' + actualFilename, { 
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    const isImage = actualFilename.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i);
    const isBinary = actualFilename.match(/\.(exe|dll|zip|rar)$/i);

    if (isImage) {
      const contentType = getImageContentType(actualFilename);
      const imageBlob = await response.blob();
      return new Response(imageBlob, {
        headers: { 
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400'
        }
      });
    }

    if (isBinary) {
      const contentType = getBinaryContentType(actualFilename);
      const binaryBlob = await response.blob();
      return new Response(binaryBlob, {
        headers: { 
          'Content-Type': contentType,
          'Content-Disposition': 'attachment; filename="' + actualFilename + '"',
          'Cache-Control': 'public, max-age=86400'
        }
      });
    }

    const content = await response.text();
    return new Response(content, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });

  } catch (error) {
    return new Response('Error fetching file: ' + error.message, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

async function listFiles(folder, route) {
  try {
    const apiUrl = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + folder;
    const response = await fetch(apiUrl, { 
      headers: { 'User-Agent': 'Cloudflare-Worker' } 
    });

    if (!response.ok) {
      return new Response(folder + ' folder not found', { status: 404 });
    }

    const files = await response.json();
    const fileList = files.filter(function(f) { return f.type === 'file'; });

    const isImageFolder = folder === 'images';
    let cards = '';

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileUrl = 'https://raw.githubusercontent.com/' + GITHUB_REPO + '/' + GITHUB_BRANCH + '/' + folder + '/' + file.name;
      
      if (isImageFolder && file.name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) {
        cards += '<div class="image-card">';
        cards += '<img src="' + fileUrl + '" alt="' + file.name + '">';
        cards += '<div class="image-info">';
        cards += '<div class="image-name">' + file.name + '</div>';
        cards += '<a href="/' + route + '/' + file.name + '" class="image-link">View full image</a>';
        cards += '</div>';
        cards += '</div>';
      } else {
        cards += '<div class="file-card">';
        cards += '<div class="file-icon">📄</div>';
        cards += '<div class="file-info">';
        cards += '<div class="file-name">' + file.name + '</div>';
        cards += '<a href="/' + route + '/' + file.name + '" class="file-link">Download</a>';
        cards += '</div>';
        cards += '</div>';
      }
    }

    const title = folder.charAt(0).toUpperCase() + folder.slice(1) + ' Gallery';
    const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' + title + '</title><link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAADy0lEQVR4nO2WS0hUYRTHf2M6lqZhD8tKSyN6kFZEQUG0iYyWEbWoaBERRJuIoCKKNkEv2hQF0aZVUBAtIqhFGxFaBEVBQS8qoqKgJXrYI7PU+cU/nAvD3DszdzozC/3hcDnf+b7v/z/n+873QQwxxBBDDP8TKvU+oMeBcWASUA0MAZ1AC3AZaARqgJ+FIq8GpoX4O4E2oBjYIbNVgDOW4xfgIzAb+FYI8m/AVgkfBwYDCp4BPgEXBY5jBJgLfMk3+VdgcwD5BkkdayjAD+A1cBbYKOcYO6OI2bpbMX5IOc4Gg6GYCw4g/wAsCCj4NxFqBRYBpZLvJnBKxJYCt4DbGtsl40xgrp7pAY7oed+Bq8AO5a+RvleApXHyTqBcAs2RZs8Ak3Vi3QJuKl4m+ZPA7pjE7wCLJfs4UKbYOhE5DkwR+V6gOoZ/HLhL27BfRNqjvO/2Jvy25C+MyVrVy4M+S2kOINIi4l3AsAjYqP1kld9Sng9Yqfh7gRUx8veUo0vE20TgUwD5tpC39U/EbEEb4Q2RfCfkZ5RjtdK9l1n3gE0BzzdJb6LGfEUtIrNd5O1mM3AKgaFqDiNfIeJPFesMEBjnSjCq+VcapnxJ+Zoljj39p8DKgOftkk4fSqMqwG5+x0WyXaTd0uuLIl+iyzn
