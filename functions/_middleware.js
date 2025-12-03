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
    const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' + title + '</title><link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAADy0lEQVR4nO2WS0hUYRTHf2M6lqZhD8tKSyN6kFZEQUG0iYyWEbWoaBERRJuIoCKKNkEv2hQF0aZVUBAtIqhFGxFaBEVBQS8qoqKgJXrYI7PU+cU/nAvD3DszdzozC/3hcDnf+b7v/z/n+873QQwxxBBDDP8TKvU+oMeBcWASUA0MAZ1AC3AZaARqgJ+FIq8GpoX4O4E2oBjYIbNVgDOW4xfgIzAb+FYI8m/AVgkfBwYDCp4BPgEXBY5jBJgLfMk3+VdgcwD5BkkdayjAD+A1cBbYKOcYO6OI2bpbMX5IOc4Gg6GYCw4g/wAsCCj4NxFqBRYBpZLvJnBKxJYCt4DbGtsl40xgrp7pAY7oed+Bq8AO5a+RvleApXHyTqBcAs2RZs8Ak3Vi3QJuKl4m+ZPA7pjE7wCLJfs4UKbYOhE5DkwR+V6gOoZ/HLhL27BfRNqjvO/2Jvy25C+MyVrVy4M+S2kOINIi4l3AsAjYqP1kld9Sng9Yqfh7gRUx8veUo0vE20TgUwD5tpC39U/EbEEb4Q2RfCfkZ5RjtdK9l1n3gE0BzzdJb6LGfEUtIrNd5O1mM3AKgaFqDiNfIeJPFesMEBjnSjCq+VcapnxJ+Zoljj39p8DKgOftkk4fSqMqwG5+x0WyXaTd0uuLIl+iyznl14nA7gDy1cCviORfuMjXu8h/DCA/XW0kJ6+5kgf5ToEt3k0/kv8G7Asgv0fOYDsfKPaBlGKX9LsDiM/UqjV0DaOqkq0gVijGmgDyC1Tt2kjPu+Wnlb82gPwmXUDjfDZii4FfWTohL1p3e8jtVxU7L2e4pkYy2iC/Q+T7o5B3K+aygIpfrDjbgD/l3O0RBWfpKnYHeenk5Pmu6lF3x8ifD3iBbQG2xSS/yGW+xqVzT0f6dhxz7wiwPSb5SpHqUm5ffPJTXb7FbYof3e8BwyI0BziSBeF0vv0GaE8hr2sJKPiPqtB+rV0xjssW5gSw35UgXV/wANiTh+DrQzEt+RgD1uRB+M4gjUd1pTY+ZF0xqv9CHl8cGvPxv5AvoRh3svg2shEeq+YSRA1wH1iTB+GVLq3r+lB+x1zEK0P+VtT5n6T0u0J+3rF/RP+RlH5tyC/U7ZdJd1f/sZR+e8gvlv5ZSn9WyK8x/c5QzOMhf1zoNwd8FKVJF/TmCPmV/5i8Ta7L+vwq1TDKk+ry/zjuC/1yrxGHXZX1cH8u6p8T1Y/2qRZU6h/vRv1o36v/QWKIIYYY/if8Be1FexdwvkEQAAAAAElFTkSuQmCC"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#0d1117;color:#c9d1d9;padding:20px;}.header{max-width:1200px;margin:0 auto 30px;}h1{color:#58a6ff;margin-bottom:10px;}.back-link{color:#58a6ff;text-decoration:none;}.back-link:hover{text-decoration:underline;}.gallery{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px;}.image-card,.file-card{background:#161b22;border:1px solid #30363d;border-radius:8px;overflow:hidden;transition:transform 0.2s;}.image-card:hover,.file-card:hover{transform:translateY(-4px);border-color:#58a6ff;}.image-card img{width:100%;height:200px;object-fit:cover;background:#0d1117;}.file-card{display:flex;align-items:center;padding:20px;}.file-icon{font-size:48px;margin-right:20px;}.image-info,.file-info{padding:15px;}.file-info{flex:1;}.image-name,.file-name{color:#58a6ff;font-weight:500;margin-bottom:8px;word-break:break-all;}.image-link,.file-link{color:#8b949e;text-decoration:none;font-size:13px;}.image-link:hover,.file-link:hover{color:#58a6ff;}</style></head><body><div class="header"><h1>' + title + '</h1><a href="/" class="back-link">back to home</a></div><div class="gallery">' + cards + '</div></body></html>';

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (error) {
    return new Response('Error loading files: ' + error.message, {
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

function getKickLibDocs() {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>kick library - documentation</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',\'Noto Sans\',Helvetica,Arial,sans-serif;background:#0d1117;color:#e6edf3;line-height:1.6;}.container{max-width:1200px;margin:0 auto;padding:40px 20px;}header{border-bottom:1px solid #21262d;padding-bottom:30px;margin-bottom:40px;}h1{font-size:2rem;font-weight:600;margin-bottom:8px;color:#e6edf3;}.subtitle{color:#7d8590;font-size:1rem;}section{margin-bottom:50px;}h2{font-size:1.5rem;font-weight:600;color:#e6edf3;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #21262d;}.description{color:#7d8590;margin-bottom:20px;font-size:0.95rem;}.code-wrapper{background:#161b22;border:1px solid #30363d;border-radius:6px;margin:16px 0;overflow:hidden;}.code-header{background:#0d1117;padding:12px 16px;border-bottom:1px solid #30363d;display:flex;justify-content:space-between;align-items:center;}.language{color:#7d8590;font-size:0.85rem;font-family:ui-monospace,SFMono-Regular,\'SF Mono\',Menlo,Consolas,\'Liberation Mono\',monospace;}.copy-btn{background:transparent;border:1px solid #30363d;color:#7d8590;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:0.85rem;transition:all 0.2s;}.copy-btn:hover{background:#30363d;border-color:#7d8590;}.copy-btn.copied{color:#3fb950;border-color:#3fb950;}pre{padding:16px;overflow-x:auto;margin:0;}code{font-family:ui-monospace,SFMono-Regular,\'SF Mono\',Menlo,Consolas,\'Liberation Mono\',monospace;font-size:0.875rem;line-height:1.6;color:#e6edf3;}.keyword{color:#ff7b72;}.string{color:#a5d6ff;}.function{color:#d2a8ff;}.comment{color:#8b949e;}.property{color:#79c0ff;}.punctuation{color:#e6edf3;}.info-box{background:#161b22;border:1px solid #30363d;border-left:3px solid #58a6ff;padding:16px;border-radius:6px;margin:20px 0;}.info-box-title{color:#58a6ff;font-weight:600;margin-bottom:8px;font-size:0.95rem;}.info-box-content{color:#7d8590;font-size:0.9rem;}.info-box-content strong{color:#e6edf3;}footer{border-top:1px solid #21262d;padding-top:30px;margin-top:60px;color:#7d8590;font-size:0.9rem;}.credits-title{font-weight:600;color:#e6edf3;margin-bottom:8px;}a{color:#58a6ff;text-decoration:none;}a:hover{text-decoration:underline;}@media (max-width:768px){.container{padding:20px 16px;}h1{font-size:1.75rem;}h2{font-size:1.25rem;}}</style></head><body><div class="container"><header><h1>kick library</h1><p class="subtitle">a powerful kick screen library for roblox</p></header><section><h2>booting the library</h2><p class="description">load the library using the following code snippet</p><div class="code-wrapper"><div class="code-header"><span class="language">lua</span><button class="copy-btn" onclick="copyCode(this, \'code1\')">copy</button></div><pre><code id="code1"><span class="function">loadstring</span><span class="punctuation">(</span><span class="property">game</span><span class="punctuation">:</span><span class="function">HttpGet</span><span class="punctuation">(</span><span class="string">"https://egirlswow.pages.dev/libs/kick/source.lua"</span><span class="punctuation">))()</span></code></pre></div></section><section><h2>configure the settings</h2><p class="description">customize the kick screen appearance and behavior</p><div class="code-wrapper"><div class="code-header"><span class="language">lua</span><button class="copy-btn" onclick="copyCode(this, \'code2\')">copy</button></div><pre><code id="code2"><span class="function">getgenv</span><span class="punctuation">().</span><span class="property">Config</span> <span class="punctuation">=</span> <span class="punctuation">{</span>\n    <span class="property">title</span> <span class="punctuation">=</span> <span class="string">"Disconnected"</span><span class="punctuation">,</span>\n    <span class="property">message</span> <span class="punctuation">=</span> <span class="string">"You have been kicked from this experience."</span><span class="punctuation">,</span>\n    <span class="property">type</span> <span class="punctuation">=</span> <span class="string">"1"</span><span class="punctuation">,</span> <span class="comment">-- types: 1 = only leave button, 2 = leave and reconnect buttons</span>\n    <span class="property">button1</span> <span class="punctuation">=</span> <span class="string">"Leave"</span><span class="punctuation">,</span>\n    <span class="property">button2</span> <span class="punctuation">=</span> <span class="string">"Reconnect"</span>\n<span class="punctuation">}</span></code></pre></div><div class="info-box"><div class="info-box-title">configuration options</div><div class="info-box-content"><strong>type "1":</strong> displays only the leave button<br><strong>type "2":</strong> displays both leave and reconnect buttons</div></div></section><section><h2>button callbacks</h2><p class="description">define what happens when buttons are clicked</p><div class="code-wrapper"><div class="code-header"><span class="language">lua</span><button class="copy-btn" onclick="copyCode(this, \'code3\')">copy</button></div><pre><code id="code3"><span class="function">getgenv</span><span class="punctuation">().</span><span class="property">Callbacks</span> <span class="punctuation">=</span> <span class="punctuation">{</span>\n    <span class="property">button1_callback</span> <span class="punctuation">=</span> <span class="keyword">function</span><span class="punctuation">()</span>\n        <span class="property">game</span><span class="punctuation">:</span><span class="function">Shutdown</span><span class="punctuation">()</span> <span class="comment">-- leave</span>\n    <span class="keyword">end</span><span class="punctuation">,</span>\n    <span class="property">button2_callback</span> <span class="punctuation">=</span> <span class="keyword">function</span><span class="punctuation">()</span>\n        <span class="property">game</span><span class="punctuation">:</span><span class="function">GetService</span><span class="punctuation">(</span><span class="string">"TeleportService"</span><span class="punctuation">):</span><span class="function">Teleport</span><span class="punctuation">(</span><span class="property">game</span><span class="punctuation">.</span><span class="property">PlaceId</span><span class="punctuation">)</span> <span class="comment">-- reconnect</span>\n    <span class="keyword">end</span>\n<span class="punctuation">}</span></code></pre></div></section><footer><div class="credits-title">credits</div><p>library created by <a href="https://github.com/EnesXVC" target="_blank">EnesXVC</a></p></footer></div><script>function copyCode(button, codeId){const codeElement = document.getElementById(codeId);const code = codeElement.innerText;navigator.clipboard.writeText(code).then(() => {button.textContent = \'copied!\';button.classList.add(\'copied\');setTimeout(() => {button.textContent = \'copy\';button.classList.remove(\'copied\');}, 2000);});}</script></body></html>';
}

function getHomePage() {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>discord invite</title><link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAADy0lEQVR4nO2WS0hUYRTHf2M6lqZhD8tKSyN6kFZEQUG0iYyWEbWoaBERRJuIoCKKNkEv2hQF0aZVUBAtIqhFGxFaBEVBQS8qoqKgJXrYI7PU+cU/nAvD3DszdzozC/3hcDnf+b7v/z/n+873QQwxxBBDDP8TKvU+oMeBcWASUA0MAZ1AC3AZaARqgJ+FIq8GpoX4O4E2oBjYIbNVgDOW4xfgIzAb+FYI8m/AVgkfBwYDCp4BPgEXBY5jBJgLfMk3+VdgcwD5BkkdayjAD+A1cBbYKOcYO6OI2bpbMX5IOc4Gg6GYCw4g/wAsCCj4NxFqBRYBpZLvJnBKxJYCt4DbGtsl40xgrp7pAY7oed+Bq8AO5a+RvleApXHyTqBcAs2RZs8Ak3Vi3QJuKl4m+ZPA7pjE7wCLJfs4UKbYOhE5DkwR+V6gOoZ/HLhL27BfRNqjvO/2Jvy25C+MyVrVy4M+S2kOINIi4l3AsAjYqP1kld9Sng9Yqfh7gRUx8veUo0vE20TgUwD5tpC39U/EbEEb4Q2RfCfkZ5RjtdK9l1n3gE0BzzdJb6LGfEUtIrNd5O1mM3AKgaFqDiNfIeJPFesMEBjnSjCq+VcapnxJ+Zoljj39p8DKgOftkk4fSqMqwG5+x0WyXaTd0uuLIl+iyznl14nA7gDy1cCviORfuMjXu8h/DCA/XW0kJ6+5kgf5ToEt3k0/kv8G7Asgv0fOYDsfKPaBlGKX9LsDiM/UqjV0DaOqkq0gVijGmgDyC1Tt2kjPu+Wnlb82gPwmXUDjfDZii4FfWTohL1p3e8jtVxU7L2e4pkYy2iC/Q+T7o5B3K+aygIpfrDjbgD/l3O0RBWfpKnYHeenk5Pmu6lF3x8ifD3iBbQG2xSS/yGW+xqVzT0f6dhxz7wiwPSb5SpHqUm5ffPJTXb7FbYof3e8BwyI0BziSBeF0vv0GaE8hr2sJKPiPqtB+rV0xjssW5gSw35UgXV/wANiTh+DrQzEt+RgD1uRB+M4gjUd1pTY+ZF0xqv9CHl8cGvPxv5AvoRh3svg2shEeq+YSRA1wH1iTB+GVLq3r+lB+x1zEK0P+VtT5n6T0u0J+3rF/RP+RlH5tyC/U7ZdJd1f/sZR+e8gvlv5ZSn9WyK8x/c5QzOMhf1zoNwd8FKVJF/TmCPmV/5i8Ta7L+vwq1TDKk+ry/zjuC/1yrxGHXZX1cH8u6p8T1Y/2qRZU6h/vRv1o36v/QWKIIYYY/if8Be1FexdwvkEQAAAAAElFTkSuQmCC"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px;}.container{background:white;padding:60px 50px;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;max-width:600px;width:100%;} h1{color:#5865F2;margin-bottom:30px;font-size:2.5em;}.invite-link{background:#f3f4f6;padding:15px;border-radius:10px;margin:20px 0;font-family:Courier New,monospace;color:#333;font-size:1.1em;word-break:break-all;}.btn{background:#5865F2;color:white;border:none;padding:15px 40px
