const GITHUB_REPO = 'XVCHub/wow';
const GITHUB_BRANCH = 'main';

export async function onRequest(context) {
  const url = new URL(context.request.url);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === '/') {
    return new Response(getHomePage(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  if (pathname === '/👅') {
    return await listImages();
  }

  if (pathname.startsWith('/👅/')) {
    const filename = pathname.replace('/👅/', '');
    return await fetchFromGitHub('images', filename);
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
              name === baseName + '.webp' || name === baseName + '.svg') {
            foundFile = file.name;
            break;
          }
          
          const versionMatch = name.match(new RegExp('^' + baseName + 'v([0-9]+)\\.(lua|txt|js|py|png|jpg|jpeg|gif|webp|svg)

async function listImages() {
  try {
    const apiUrl = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/images';
    const response = await fetch(apiUrl, { 
      headers: { 'User-Agent': 'Cloudflare-Worker' } 
    });

    if (!response.ok) {
      return new Response('Images folder not found', { status: 404 });
    }

    const files = await response.json();
    const imageFiles = files
      .filter(function(f) { return f.type === 'file'; })
      .filter(function(f) { return f.name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i); });

    let imageCards = '';
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const imgUrl = 'https://raw.githubusercontent.com/' + GITHUB_REPO + '/' + GITHUB_BRANCH + '/images/' + file.name;
      imageCards += '<div class="image-card">';
      imageCards += '<img src="' + imgUrl + '" alt="' + file.name + '">';
      imageCards += '<div class="image-info">';
      imageCards += '<div class="image-name">' + file.name + '</div>';
      imageCards += '<a href="/👅/' + file.name + '" class="image-link">View full image</a>';
      imageCards += '</div>';
      imageCards += '</div>';
    }

    const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Images Gallery</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#0d1117;color:#c9d1d9;padding:20px;}.header{max-width:1200px;margin:0 auto 30px;}h1{color:#58a6ff;margin-bottom:10px;}.back-link{color:#58a6ff;text-decoration:none;}.back-link:hover{text-decoration:underline;}.gallery{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px;}.image-card{background:#161b22;border:1px solid #30363d;border-radius:8px;overflow:hidden;transition:transform 0.2s;}.image-card:hover{transform:translateY(-4px);border-color:#58a6ff;}.image-card img{width:100%;height:200px;object-fit:cover;background:#0d1117;}.image-info{padding:15px;}.image-name{color:#58a6ff;font-weight:500;margin-bottom:8px;word-break:break-all;}.image-link{color:#8b949e;text-decoration:none;font-size:13px;}.image-link:hover{color:#58a6ff;}</style></head><body><div class="header"><h1>Images Gallery</h1><a href="/" class="back-link">Back to home</a></div><div class="gallery">' + imageCards + '</div></body></html>';

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (error) {
    return new Response('Error loading images: ' + error.message, {
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

function getHomePage() {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Discord Invite</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px;}.container{background:white;padding:50px 40px;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;max-width:500px;width:100%;} h1{color:#5865F2;margin-bottom:30px;font-size:2.5em;}.invite-link{background:#f3f4f6;padding:15px;border-radius:10px;margin:20px 0;font-family:Courier New,monospace;color:#333;font-size:1.1em;word-break:break-all;}.btn{background:#5865F2;color:white;border:none;padding:15px 40px;font-size:1.1em;border-radius:10px;cursor:pointer;transition:all 0.3s ease;margin:10px;text-decoration:none;display:inline-block;}.btn:hover{background:#4752c4;transform:translateY(-2px);box-shadow:0 5px 15px rgba(88,101,242,0.4);}.success{display:none;color:#10b981;margin-top:15px;font-weight:bold;}.success.show{display:block;}</style></head><body><div class="container"><h1>Discord Invite</h1><p style="color:#666;margin-bottom:20px;">Click to copy invite link</p><div class="invite-link">discord.gg/rTw5M8dRXN</div><button class="btn" onclick="copyInvite()">Copy Invite</button><a href="https://discord.gg/rTw5M8dRXN" target="_blank" class="btn" style="background:#57F287;">Join Discord</a><p class="success" id="successMsg">Copied to clipboard!</p></div><script>function copyInvite(){navigator.clipboard.writeText("discord.gg/rTw5M8dRXN").then(function(){document.getElementById("successMsg").classList.add("show");setTimeout(function(){document.getElementById("successMsg").classList.remove("show");},2000);});}</script></body></html>';
}));
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

async function listImages() {
  try {
    const apiUrl = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/images';
    const response = await fetch(apiUrl, { 
      headers: { 'User-Agent': 'Cloudflare-Worker' } 
    });

    if (!response.ok) {
      return new Response('Images folder not found', { status: 404 });
    }

    const files = await response.json();
    const imageFiles = files
      .filter(function(f) { return f.type === 'file'; })
      .filter(function(f) { return f.name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i); });

    let imageCards = '';
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const imgUrl = 'https://raw.githubusercontent.com/' + GITHUB_REPO + '/' + GITHUB_BRANCH + '/images/' + file.name;
      imageCards += '<div class="image-card">';
      imageCards += '<img src="' + imgUrl + '" alt="' + file.name + '">';
      imageCards += '<div class="image-info">';
      imageCards += '<div class="image-name">' + file.name + '</div>';
      imageCards += '<a href="/👅/' + file.name + '" class="image-link">View full image</a>';
      imageCards += '</div>';
      imageCards += '</div>';
    }

    const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Images Gallery</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#0d1117;color:#c9d1d9;padding:20px;}.header{max-width:1200px;margin:0 auto 30px;}h1{color:#58a6ff;margin-bottom:10px;}.back-link{color:#58a6ff;text-decoration:none;}.back-link:hover{text-decoration:underline;}.gallery{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px;}.image-card{background:#161b22;border:1px solid #30363d;border-radius:8px;overflow:hidden;transition:transform 0.2s;}.image-card:hover{transform:translateY(-4px);border-color:#58a6ff;}.image-card img{width:100%;height:200px;object-fit:cover;background:#0d1117;}.image-info{padding:15px;}.image-name{color:#58a6ff;font-weight:500;margin-bottom:8px;word-break:break-all;}.image-link{color:#8b949e;text-decoration:none;font-size:13px;}.image-link:hover{color:#58a6ff;}</style></head><body><div class="header"><h1>Images Gallery</h1><a href="/" class="back-link">Back to home</a></div><div class="gallery">' + imageCards + '</div></body></html>';

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (error) {
    return new Response('Error loading images: ' + error.message, {
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

function getHomePage() {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Discord Invite</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px;}.container{background:white;padding:50px 40px;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;max-width:500px;width:100%;} h1{color:#5865F2;margin-bottom:30px;font-size:2.5em;}.invite-link{background:#f3f4f6;padding:15px;border-radius:10px;margin:20px 0;font-family:Courier New,monospace;color:#333;font-size:1.1em;word-break:break-all;}.btn{background:#5865F2;color:white;border:none;padding:15px 40px;font-size:1.1em;border-radius:10px;cursor:pointer;transition:all 0.3s ease;margin:10px;text-decoration:none;display:inline-block;}.btn:hover{background:#4752c4;transform:translateY(-2px);box-shadow:0 5px 15px rgba(88,101,242,0.4);}.success{display:none;color:#10b981;margin-top:15px;font-weight:bold;}.success.show{display:block;}</style></head><body><div class="container"><h1>Discord Invite</h1><p style="color:#666;margin-bottom:20px;">Click to copy invite link</p><div class="invite-link">discord.gg/rTw5M8dRXN</div><button class="btn" onclick="copyInvite()">Copy Invite</button><a href="https://discord.gg/rTw5M8dRXN" target="_blank" class="btn" style="background:#57F287;">Join Discord</a><p class="success" id="successMsg">Copied to clipboard!</p></div><script>function copyInvite(){navigator.clipboard.writeText("discord.gg/rTw5M8dRXN").then(function(){document.getElementById("successMsg").classList.add("show");setTimeout(function(){document.getElementById("successMsg").classList.remove("show");},2000);});}</script></body></html>';
}
