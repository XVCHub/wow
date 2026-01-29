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

  if (pathname === '/explorer' || pathname === '/explorer/') {
    return new Response(getExplorerPage(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  if (pathname === '/icon.png' || pathname === '/favicon.ico') {
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/icon.png`;
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

  const parts = pathname.split('/').filter(p => p);
  
  if (parts.length === 0) {
    return new Response('404', { status: 404 });
  }

  if (parts.length === 1) {
    const folderName = parts[0];
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${folderName}`;
    const response = await fetch(apiUrl, { 
      headers: { 'User-Agent': 'Cloudflare-Worker' } 
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return await listFiles(folderName, folderName);
      }
    }
    
    return await fetchFile(parts[0], '');
  }

  const folder = parts.slice(0, -1).join('/');
  const filename = parts[parts.length - 1];
  return await fetchFile(filename, folder);
}

async function fetchFile(filename, folder) {
  try {
    let actualFilename = filename;
    const fullPath = folder ? `${folder}/${filename}` : filename;
    
    if (!filename.includes('.')) {
      const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${folder || ''}`;
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
          
          if (name === `${baseName}.lua` || name === `${baseName}.txt` || 
              name === `${baseName}.js` || name === `${baseName}.py` ||
              name === `${baseName}.png` || name === `${baseName}.jpg` || 
              name === `${baseName}.jpeg` || name === `${baseName}.gif` ||
              name === `${baseName}.webp` || name === `${baseName}.svg` ||
              name === `${baseName}.exe` || name === `${baseName}.dll` ||
              name === `${baseName}.zip` || name === `${baseName}.rar`) {
            foundFile = file.name;
            break;
          }
          
          const versionMatch = name.match(
            new RegExp(`^${baseName}v([0-9]+)\\.(lua|txt|js|py|png|jpg|jpeg|gif|webp|svg|exe|dll|zip|rar)$`)
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

    const rawUrl = folder 
      ? `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${folder}/${actualFilename}`
      : `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${actualFilename}`;
    
    const response = await fetch(rawUrl);

    if (!response.ok) {
      return new Response(`file not found: ${fullPath}`, { 
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
          'Content-Disposition': `attachment; filename="${actualFilename}"`,
          'Cache-Control': 'public, max-age=86400'
        }
      });
    }

    const content = await response.text();
    return new Response(content, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });

  } catch (error) {
    return new Response(`error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

async function listFiles(folder, route) {
  try {
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${folder}`;
    const response = await fetch(apiUrl, { 
      headers: { 'User-Agent': 'Cloudflare-Worker' } 
    });

    if (!response.ok) {
      return new Response(`${folder} not found`, { status: 404 });
    }

    const files = await response.json();
    const fileList = files.filter(f => f.type === 'file');

    const isImageFolder = folder === 'images';
    let cards = '';

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${folder}/${file.name}`;
      
      if (isImageFolder && file.name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) {
        cards += `<div class="image-card">
          <img src="${fileUrl}" alt="${file.name}">
          <div class="image-info">
            <div class="image-name">${file.name}</div>
            <a href="/${route}/${file.name}" class="image-link">view full image</a>
          </div>
        </div>`;
      } else {
        cards += `<div class="file-card">
          <div class="file-icon">📄</div>
          <div class="file-info">
            <div class="file-name">${file.name}</div>
            <a href="/${route}/${file.name}" class="file-link">download</a>
          </div>
        </div>`;
      }
    }

    const title = folder.charAt(0).toUpperCase() + folder.slice(1) + ' gallery';
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><link rel="icon" type="image/png" href="/icon.png"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#0d1117;color:#c9d1d9;padding:20px;}.header{max-width:1200px;margin:0 auto 30px;}h1{color:#58a6ff;margin-bottom:10px;}.back-link{color:#58a6ff;text-decoration:none;}.back-link:hover{text-decoration:underline;}.gallery{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px;}.image-card,.file-card{background:#161b22;border:1px solid #30363d;border-radius:8px;overflow:hidden;transition:transform 0.2s;}.image-card:hover,.file-card:hover{transform:translateY(-4px);border-color:#58a6ff;}.image-card img{width:100%;height:200px;object-fit:cover;background:#0d1117;}.file-card{display:flex;align-items:center;padding:20px;}.file-icon{font-size:48px;margin-right:20px;}.image-info,.file-info{padding:15px;}.file-info{flex:1;}.image-name,.file-name{color:#58a6ff;font-weight:500;margin-bottom:8px;word-break:break-all;}.image-link,.file-link{color:#8b949e;text-decoration:none;font-size:13px;}.image-link:hover,.file-link:hover{color:#58a6ff;}</style></head><body><div class="header"><h1>${title}</h1><a href="/" class="back-link">back to home</a></div><div class="gallery">${cards}</div></body></html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (error) {
    return new Response(`error: ${error.message}`, {
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
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>discord invite</title><link rel="icon" type="image/png" href="/icon.png"><link rel="shortcut icon" type="image/png" href="/icon.png"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px;}.container{background:white;padding:60px 50px;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;max-width:600px;width:100%;} h1{color:#5865F2;margin-bottom:30px;font-size:2.5em;}.invite-link{background:#f3f4f6;padding:15px;border-radius:10px;margin:20px 0;font-family:Courier New,monospace;color:#333;font-size:1.1em;word-break:break-all;}.btn{background:#5865F2;color:white;border:none;padding:15px 40px;font-size:1.1em;border-radius:10px;cursor:pointer;transition:all 0.3s ease;margin:10px;text-decoration:none;display:inline-block;}.btn:hover{background:#4752c4;transform:translateY(-2px);box-shadow:0 5px 15px rgba(88,101,242,0.4);}.btn.explorer{background:#ff6b6b;}.btn.explorer:hover{background:#ee5a52;box-shadow:0 5px 15px rgba(255,107,107,0.4);}.success{display:none;color:#10b981;margin-top:15px;font-weight:bold;}.success.show{display:block;}</style></head><body><div class="container"><h1>discord invite</h1><p style="color:#666;margin-bottom:20px;">click to copy invite link</p><div class="invite-link">discord.gg/rTw5M8dRXN</div><button class="btn" onclick="copyInvite()">copy invite</button><a href="https://discord.gg/rTw5M8dRXN" target="_blank" class="btn" style="background:#57F287;">join discord</a><a href="/explorer/" class="btn explorer">explorer</a><p class="success" id="successMsg">copied to clipboard!</p></div><script>function copyInvite(){navigator.clipboard.writeText("discord.gg/rTw5M8dRXN").then(function(){document.getElementById("successMsg").classList.add("show");setTimeout(function(){document.getElementById("successMsg").classList.remove("show");},2000);});}</script></body></html>';
}

function getExplorerPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>25ms Explorer</title>
    <link rel="icon" type="image/png" href="/icon.png">
    <script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.37.1/min/vs/loader.js"></script>
    
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #121212;
            color: #e0e0e0;
            overflow-x: hidden;
        }
        .content-wrapper {
            opacity: 0;
            transform: translateY(50px);
            animation: slideUp 0.8s ease forwards;
        }
        @keyframes slideUp {
            0% {
                opacity: 0;
                transform: translateY(50px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes slideInRight {
            0% {
                opacity: 0;
                transform: translateX(30px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }
        @keyframes slideInLeft {
            0% {
                opacity: 0;
                transform: translateX(-30px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scaleIn {
            0% {
                opacity: 0;
                transform: scale(0.95);
            }
            100% {
                opacity: 1;
                transform: scale(1);
            }
        }
        @keyframes scaleOut {
            0% {
                opacity: 1;
                transform: scale(1);
            }
            100% {
                opacity: 0;
                transform: scale(0.95);
            }
        }
        h1 {
            color: #e0e0e0;
        }
        .breadcrumb {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            background-color: #1e1e1e;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .breadcrumb-item {
            display: flex;
            align-items: center;
            color: #80cbc4;
            text-decoration: none;
            transition: color 0.3s ease;
            margin-right: 10px;
        }
        .breadcrumb-item:not(:last-child)::after {
            content: '›';
            color: #666;
            margin-left: 10px;
            font-size: 1.2em;
        }
        .breadcrumb-item:hover {
            color: #ffffff;
        }
        .breadcrumb-item:hover::after {
            color: #666;
        }
        .breadcrumb-item.active {
            color: #ffffff;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 18px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 1px 25px 50px rgba(24, 133, 160, 0.637);
        }
        th, td {
            border: 1px solid #444;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #333;
        }
        tr {
            opacity: 0;
            animation: fadeIn 0.3s ease forwards;
        }
        tr:nth-child(even) {
            background-color: #1d1d1d;
        }
        tr:nth-child(odd) {
            background-color: #222;
        }
        tr:hover {
            background-color: #444;
        }
        a {
            text-decoration: none;
        }
        .directory-link {
            color: #80cbc4;
            transition: color 0.3s ease;
        }
        .directory-link:hover {
            color: #ffffff;
            text-decoration: underline;
        }
        .file-link {
            color: #ab6dd4;
            transition: color 0.3s ease;
        }
        .file-link:hover {
            color: #ffffff;
            text-decoration: underline;
        }
        #file-viewer {
            display: none;
            margin-top: 15px;
            padding: 10px;
            border: 1px solid #444;
            border-radius: 8px;
            background-color: #2c2c2c;
            animation: scaleIn 0.3s ease forwards;
            box-shadow: 1px 25px 50px rgba(24, 133, 160, 0.637);
        }
        .file-viewer-exit {
            animation: scaleOut 0.3s ease forwards !important;
        }
        #file-viewer pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            color: #e0e0e0;
        }
        #close-viewer {
            display: block;
            margin-bottom: 10px;
            color: #f44336;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        #close-viewer:hover {
            transform: scale(1.003);
        }
        #view-src,#copy-button {
            display: block;
            margin-bottom: 10px;
            color: #878787;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        #view-src:hover,#copy-button:hover {
            transform: scale(1.003);
        }
        .slide-in-right {
            animation: slideInRight 0.1s ease forwards;
        }
        .slide-in-left {
            animation: slideInLeft 0.1s ease forwards;
        }
        #editor {
            width: 100%;
            height: 500px;
        }
    </style>
</head>
<body>
    <div class="content-wrapper">
        <h1>Explorer › Made by 25ms</h1>
        <div id="breadcrumb" class="breadcrumb"></div>
        <div id="table-container">
            <table id="file-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
        <div id="file-viewer" style="display: none;">
            <span id="view-src">👁️ View Source</span>
            <span id="close-viewer">❌ Close</span>
            <span id="copy-button">🥵 Copy Script</span>
            <h2>Load this script!</h2>
            <div id="editor"></div>
        </div>
    </div>

    <script>
        const GITHUB_REPO = 'XVCHub/wow';
        const GITHUB_BRANCH = 'main';
        const HIDDEN_FOLDERS = ['functions'];
        
        let viewing = false;
        let currentfilepath = "";
        let directoryData = {};
        let currentPath = "";
        let isNavigatingForward = true;
        let editor;

        function loadMonaco() {
            return new Promise((resolve, reject) => {
                require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.37.1/min/vs' } });
                require(['vs/editor/editor.main'], function () {
                    resolve();
                }, function (error) {
                    reject(error);
                });
            });
        }

        async function initializeEditor() {
            try {
                await loadMonaco();
                editor = monaco.editor.create(document.getElementById('editor'), {
                    value: \`-- Your Lua code goes here\\nprint("Hello World!")\`,
                    language: 'lua',
                    theme: 'vs-dark',
                    readOnly: true,
                    wordWrap: true,
                    minimap: { enabled: false }
                });
            } catch (error) {
                console.error("Failed to load Monaco:", error);
            }
        }

        function getPathFromHash() {
            return window.location.hash.slice(1);
        }

        function updateHash(path) {
            window.location.hash = path ? path : '';
        }

        function isPathToFile(path, dirData) {
            if (!path) return false;
            
            const parts = path.split('/');
            let currentData = dirData;
            
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (!part) continue;
                if (!currentData.directories || !currentData.directories[part]) {
                    return false;
                }
                currentData = currentData.directories[part];
            }
            
            const lastPart = parts[parts.length - 1];
            return currentData.files && currentData.files.includes(lastPart);
        }

        function renderBreadcrumb(path) {
            const breadcrumbContainer = document.getElementById("breadcrumb");
            breadcrumbContainer.innerHTML = "";

            const rootLink = document.createElement("a");
            rootLink.href = "#";
            rootLink.textContent = "Home";
            rootLink.classList.add("breadcrumb-item");
            rootLink.onclick = (e) => {
                e.preventDefault();
                navigateTo("");
            };
            breadcrumbContainer.appendChild(rootLink);

            if (!path) return;

            const parts = path.split('/');
            let currentPathSegment = "";

            parts.forEach((part, index) => {
                currentPathSegment += (currentPathSegment ? '/' : '') + part;
                
                if (index === parts.length - 1) {
                    const activeSpan = document.createElement("span");
                    activeSpan.textContent = part;
                    activeSpan.classList.add("breadcrumb-item", "active");
                    breadcrumbContainer.appendChild(activeSpan);
                } else {
                    const link = document.createElement("a");
                    link.href = \`#\${currentPathSegment}\`;
                    link.textContent = part;
                    link.classList.add("breadcrumb-item");
                    link.onclick = (e) => {
                        navigateTo(currentPathSegment);
                    };
                    breadcrumbContainer.appendChild(link);
                }
            });
        }

        async function buildDirectoryStructure(path = '') {
            const apiUrl = \`https://api.github.com/repos/\${GITHUB_REPO}/contents/\${path}\`;
            const response = await fetch(apiUrl, {
                headers: { 'User-Agent': 'Cloudflare-Worker' }
            });
            
            if (!response.ok) {
                return { directories: {}, files: [] };
            }
            
            const items = await response.json();
            const structure = { directories: {}, files: [] };
            
            for (const item of items) {
                if (HIDDEN_FOLDERS.includes(item.name)) continue;
                
                if (item.type === 'dir') {
                    structure.directories[item.name] = await buildDirectoryStructure(\`\${path ? path + '/' : ''}\${item.name}\`);
                } else if (item.type === 'file') {
                    structure.files.push(item.name);
                }
            }
            
            return structure;
        }

        async function fetchDirectoryData() {
            try {
                directoryData = await buildDirectoryStructure();
                
                const initialPath = getPathFromHash();
                if (initialPath) {
                    currentPath = initialPath;
                    if (isPathToFile(initialPath, directoryData)) {
                        await initializeEditor();
                        viewFile(initialPath);
                    } else {
                        await initializeEditor();
                        renderTable(initialPath);
                    }
                } else {
                    await initializeEditor();
                    renderTable(currentPath);
                }
            } catch (error) {
                console.error("Error fetching directory data:", error);
            }
        }

        function renderTable(path) {
            const tableContainer = document.getElementById("table-container");
            const tableBody = document.querySelector("#file-table tbody");
            
            tableContainer.style.display = "block";
            tableBody.innerHTML = "";
            
            renderBreadcrumb(path);
            
            const getNestedData = (path) => {
                const parts = path.split('/');
                let currentData = directoryData;

                for (let part of parts) {
                    if (part) {
                        currentData = currentData.directories[part] || { directories: {}, files: [] };
                    }
                }

                return currentData;
            };

            const data = getNestedData(path);

            let delay = 0;
            Object.keys(data.directories).forEach(dir => {
                const row = document.createElement("tr");
                row.style.animationDelay = \`\${delay}ms\`;
                delay += 20;

                const nameCell = document.createElement("td");
                const typeCell = document.createElement("td");

                const newPath = path ? path + '/' + dir : dir;
                nameCell.innerHTML = \`<a href="#\${newPath}" onclick="navigateTo('\${newPath}', event)" class="directory-link">\${dir}</a>\`;
                typeCell.textContent = "directory";

                row.appendChild(nameCell);
                row.appendChild(typeCell);
                row.classList.add(isNavigatingForward ? 'slide-in-right' : 'slide-in-left');
                tableBody.appendChild(row);
            });

            data.files.forEach(file => {
                const row = document.createElement("tr");
                row.style.animationDelay = \`\${delay}ms\`;
                delay += 20;

                const nameCell = document.createElement("td");
                const typeCell = document.createElement("td");

                const newFilePath = path ? path + '/' + file : file;
                nameCell.innerHTML = \`<a href="#\${newFilePath}" onclick="viewFile('\${newFilePath}', event)" class="file-link">\${file}</a>\`;
                typeCell.textContent = "file";

                row.appendChild(nameCell);
                row.appendChild(typeCell);
                row.classList.add(isNavigatingForward ? 'slide-in-right' : 'slide-in-left');
                tableBody.appendChild(row);
            });
        }

        async function viewFile(filePath, event) {
            viewing = false;
            if (event) {
                event.preventDefault();
            }
            
            const tableContainer = document.getElementById("table-container");
            tableContainer.style.display = "none";

            const baseUrl = window.location.origin;
            const content = \`loadstring(game:HttpGet("\${baseUrl}/\${filePath}"))()\\n\`;
            document.getElementById("file-viewer").style.display = "block";
            editor.layout();
            editor.setValue(content);
            renderBreadcrumb(filePath);
            updateHash(filePath);

            currentfilepath = filePath;
        }

        function navigateTo(path, event) {
            if (event) {
                event.preventDefault();
            }
            if (path !== currentPath) {
                currentPath = path;
                if (isPathToFile(currentPath, directoryData)) {
                    viewFile(currentPath);
                } else {
                    renderTable(currentPath);
                    document.getElementById("file-viewer").style.display = "none";
                    updateHash(path);
                }
            }
        }

        document.getElementById("close-viewer").onclick = () => {
            document.getElementById("view-src").textContent = "👁️ View Source";
            viewing = false;
            const fileViewer = document.getElementById("file-viewer");
            fileViewer.classList.add('file-viewer-exit');
            setTimeout(() => {
                fileViewer.style.display = "none";
                fileViewer.classList.remove('file-viewer-exit');
                navigateTo(currentPath.split("/").slice(0, -1).join("/"));
            }, 300);
        };

        document.getElementById("copy-button").onclick = () => {
            navigator.clipboard.writeText(editor.getValue());
        };

        document.getElementById("view-src").onclick = () => {
            viewing = !viewing;
            const viewer = document.getElementById("view-src");
            const baseUrl = window.location.origin;

            if (viewing) {
                viewer.textContent = "🔐 View loadstring";
                editor.setValue("-- Fetching..");
                fetch(\`\${baseUrl}/\${currentfilepath}\`).then(a => a.text()).then(b => {
                    editor.setValue(b);
                });
            } else {
                editor.setValue(\`loadstring(game:HttpGet("\${baseUrl}/\${currentfilepath}"))()\\n\`);
                viewer.textContent = "👁️ View Source";
            }
        };

        window.addEventListener('hashchange', () => {
            const newPath = getPathFromHash();
            if (newPath !== currentPath) {
                currentPath = newPath;
                if (isPathToFile(currentPath, directoryData)) {
                    viewFile(currentPath);
                } else {
                    renderTable(currentPath);
                    document.getElementById("file-viewer").style.display = "none";
                }
            }
        });

        fetchDirectoryData();
    </script>
</body>
</html>`;
}
