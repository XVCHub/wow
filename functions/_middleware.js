const GITHUB_REPO = 'XVCHub/wow';
const GITHUB_BRANCH = 'main';

const FOLDER_ROUTES = {
  '👅': 'images',
  'cracks': 'cracks',
  'libs/kick': 'libs/kick',
  'libs/luarmorconsole': 'libs/luarmorconsole',
  'libs/uistealer': 'libs/uistealer',
  'libs/print': 'libs/print',
  'libs/': 'libs/',
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

  if (pathname === '/icon.png' || pathname === '/favicon.ico') {
    const rawUrl = 'https://raw.githubusercontent.com/' + GITHUB_REPO + '/' + GITHUB_BRANCH + '/icon.png';
    const response = await fetch(rawUrl);
    
    if (response.ok) {
      const imageBlob = await response.blob();
      return new Response(imageBlob, {
        headers: { 
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400'
        }
      });
    }
  }

  if (pathname.startsWith('/docs/')) {
    const docPath = pathname.substring(1);
    
    try {
      const indexUrl = 'https://raw.githubusercontent.com/' + GITHUB_REPO + '/' + GITHUB_BRANCH + '/' + docPath + '/index.html';
      const response = await fetch(indexUrl);
      
      if (response.ok) {
        const html = await response.text();
        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
    } catch (e) {
    }
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

  return new Response('404 - not found', { 
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
      return new Response('file not found: ' + folder + '/' + actualFilename, { 
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
    return new Response('error fetching file: ' + error.message, {
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
        cards += '<a href="/' + route + '/' + file.name + '" class="image-link">view full image</a>';
        cards += '</div>';
        cards += '</div>';
      } else {
        cards += '<div class="file-card">';
        cards += '<div class="file-icon">📄</div>';
        cards += '<div class="file-info">';
        cards += '<div class="file-name">' + file.name + '</div>';
        cards += '<a href="/' + route + '/' + file.name + '" class="file-link">download</a>';
        cards += '</div>';
        cards += '</div>';
      }
    }

    const title = folder.charAt(0).toUpperCase() + folder.slice(1) + ' gallery';
    const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' + title + '</title><link rel="icon" type="image/png" href="/icon.png"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#0d1117;color:#c9d1d9;padding:20px;}.header{max-width:1200px;margin:0 auto 30px;}h1{color:#58a6ff;margin-bottom:10px;}.back-link{color:#58a6ff;text-decoration:none;}.back-link:hover{text-decoration:underline;}.gallery{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px;}.image-card,.file-card{background:#161b22;border:1px solid #30363d;border-radius:8px;overflow:hidden;transition:transform 0.2s;}.image-card:hover,.file-card:hover{transform:translateY(-4px);border-color:#58a6ff;}.image-card img{width:100%;height:200px;object-fit:cover;background:#0d1117;}.file-card{display:flex;align-items:center;padding:20px;}.file-icon{font-size:48px;margin-right:20px;}.image-info,.file-info{padding:15px;}.file-info{flex:1;}.image-name,.file-name{color:#58a6ff;font-weight:500;margin-bottom:8px;word-break:break-all;}.image-link,.file-link{color:#8b949e;text-decoration:none;font-size:13px;}.image-link:hover,.file-link:hover{color:#58a6ff;}</style></head><body><div class="header"><h1>' + title + '</h1><a href="/" class="back-link">back to home</a></div><div class="gallery">' + cards + '</div></body></html>';

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (error) {
    return new Response('error loading files: ' + error.message, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

function getImageContentType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const types = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml'
  };
  return types[ext] || 'image/png';
}

function getBinaryContentType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const types = {
    'exe': 'application/x-msdownload',
    'dll': 'application/x-msdownload',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed'
  };
  return types[ext] || 'application/octet-stream';
}

function getHomePage() {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>discord invite</title><link rel="icon" type="image/png" href="/icon.png"><link rel="shortcut icon" type="image/png" href="/icon.png"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px;}.container{background:white;padding:60px 50px;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;max-width:600px;width:100%;} h1{color:#5865F2;margin-bottom:30px;font-size:2.5em;}.invite-link{background:#f3f4f6;padding:15px;border-radius:10px;margin:20px 0;font-family:Courier New,monospace;color:#333;font-size:1.1em;word-break:break-all;}.btn{background:#5865F2;color:white;border:none;padding:15px 40px;font-size:1.1em;border-radius:10px;cursor:pointer;transition:all 0.3s ease;margin:10px;text-decoration:none;display:inline-block;}.btn:hover{background:#4752c4;transform:translateY(-2px);box-shadow:0 5px 15px rgba(88,101,242,0.4);}.success{display:none;color:#10b981;margin-top:15px;font-weight:bold;}.success.show{display:block;}</style></head><body><div class="container"><h1>discord invite</h1><p style="color:#666;margin-bottom:20px;">click to copy invite link</p><div class="invite-link">discord.gg/rTw5M8dRXN</div><button class="btn" onclick="copyInvite()">copy invite</button><a href="https://discord.gg/rTw5M8dRXN" target="_blank" class="btn" style="background:#57F287;">join discord</a><p class="success" id="successMsg">copied to clipboard!</p></div><script>function copyInvite(){navigator.clipboard.writeText("discord.gg/rTw5M8dRXN").then(function(){document.getElementById("successMsg").classList.add("show");setTimeout(function(){document.getElementById("successMsg").classList.remove("show");},2000);});}</script></body></html>';
}
