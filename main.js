const { app, BrowserWindow, dialog, Menu, shell, clipboard, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

let mainWindow = null;
let serverInfo = null;
let dataRoot = null;
let videoDir = null;

function ensureDirs() {
  if (!dataRoot) {
    dataRoot = path.join(app.getPath('userData'), 'syncplay-data');
  }
  if (!fs.existsSync(dataRoot)) {
    fs.mkdirSync(dataRoot, { recursive: true });
  }
  if (!videoDir) {
    videoDir = path.join(dataRoot, 'video');
  }
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }
}

function getEnvPath() {
  ensureDirs();
  return path.join(dataRoot, '.env');
}

function handleEditEnv() {
  ensureDirs();
  const envPath = getEnvPath();

  let content = 'OMDB_API_KEY=\nGIPHY_API_KEY=\nPORT=3001\n';

  try {
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf8');
    } else {
      fs.writeFileSync(envPath, content, 'utf8');
    }
  } catch (_) {}

  const parsed = { OMDB_API_KEY: '', GIPHY_API_KEY: '', PORT: '3001' };
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1);
    if (Object.prototype.hasOwnProperty.call(parsed, key)) {
      parsed[key] = val;
    }
  });

  const editorWin = new BrowserWindow({
    width: 520,
    height: 360,
    resizable: true,
    minimizable: false,
    maximizable: false,
    parent: mainWindow || undefined,
    modal: true,
    autoHideMenuBar: true,
    show: false,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false
    }
  });

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Settings</title>
<style>
  html, body { margin:0; padding:0; height:100%; }
  body {
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    background:#0f172a;
    color:#e5e7eb;
    display:flex;
    flex-direction:column;
  }
  main {
    flex:1 1 auto;
    padding:10px 14px;
    display:flex;
    flex-direction:column;
    gap:10px;
    box-sizing:border-box;
  }
  .hint {
    font-size:11px;
    color:#9ca3af;
  }
  .field {
    display:flex;
    flex-direction:column;
    gap:4px;
    font-size:13px;
  }
  .field span {
    color:#cbd5f5;
  }
  .field input {
    width:100%;
    border-radius:8px;
    border:1px solid #253045;
    background:#020617;
    color:#e5e7eb;
    padding:8px 10px;
    font-size:13px;
    box-sizing:border-box;
  }
  .field input:focus {
    outline:none;
    border-color:#3b82f6;
    box-shadow:0 0 0 1px rgba(59,130,246,0.6);
  }
  .field .hint-inline {
    font-size:11px;
    color:#9ca3af;
  }
  .link-btn {
    background:transparent;
    border:0;
    color:#5b9cff;
    cursor:pointer;
    padding:0 0 0 4px;
    font-size:11px;
    text-decoration:underline;
  }
  .link-btn:hover {
    color:#93c5ff;
  }
  footer {
    padding:8px 14px 10px;
    border-top:1px solid #1f2937;
    display:flex;
    align-items:center;
    gap:8px;
  }
  button {
    border-radius:8px;
    border:1px solid #1d4ed8;
    background:#1d4ed8;
    color:#fff;
    padding:6px 12px;
    cursor:pointer;
    font-size:13px;
  }
  button.secondary {
    background:#111827;
    border-color:#374151;
  }
  .status {
    font-size:11px;
    color:#9ca3af;
    margin-left:8px;
  }
</style>
</head>
<body>
  <main>
    <div class="hint">
      Edit your API keys and settings below. The app will restart after saving.
    </div>
    <div class="field">
      <span>OMDB API Key</span>
      <input id="omdbInput" type="text" autocomplete="off" />
      <div class="hint-inline">
        Don’t have a key?
        <button type="button" id="omdbCreateLink" class="link-btn">Click here to create one</button>
      </div>
    </div>
    <div class="field">
      <span>GIPHY API Key</span>
      <input id="giphyInput" type="text" autocomplete="off" />
      <div class="hint-inline">
        Don’t have a key?
        <button type="button" id="giphyCreateLink" class="link-btn">Click here to create one</button>
      </div>
    </div>
    <div class="field">
      <span>Port</span>
      <input id="portInput" type="number" min="1" max="65535" />
    </div>
  </main>
  <footer>
    <button id="saveBtn">Save and Restart</button>
    <button id="closeBtn" class="secondary">Close</button>
    <span id="status" class="status"></span>
  </footer>
  <script>
    const fs = require('fs');
    const { ipcRenderer, shell } = require('electron');
    const envPath = ${JSON.stringify(envPath)};
    const initial = ${JSON.stringify(parsed)};

    const omdbInput = document.getElementById('omdbInput');
    const giphyInput = document.getElementById('giphyInput');
    const portInput = document.getElementById('portInput');
    const statusEl = document.getElementById('status');

    omdbInput.value = initial.OMDB_API_KEY || '';
    giphyInput.value = initial.GIPHY_API_KEY || '';
    portInput.value = initial.PORT || '3001';

    const omdbLinkBtn = document.getElementById('omdbCreateLink');
    if (omdbLinkBtn) {
      omdbLinkBtn.onclick = () => {
        shell.openExternal('https://www.omdbapi.com/apikey.aspx');
      };
    }

    const giphyLinkBtn = document.getElementById('giphyCreateLink');
    if (giphyLinkBtn) {
      giphyLinkBtn.onclick = () => {
        shell.openExternal('https://developers.giphy.com/dashboard/');
      };
    }

    async function validateKeys(omdbKey, giphyKey) {
      const invalid = [];
      const warnings = [];

      async function checkOmdb() {
        if (!omdbKey) return;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 5000);
        try {
          const url = 'https://www.omdbapi.com/?apikey=' + encodeURIComponent(omdbKey) + '&t=Inception';
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(id);
          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
              invalid.push('OMDB API key appears invalid.');
            } else {
              warnings.push('Could not verify OMDB key (HTTP ' + res.status + ').');
            }
            return;
          }
          let json = null;
          try { json = await res.json(); } catch (_) {}
          if (json && json.Response === 'False' && /invalid api key/i.test(json.Error || '')) {
            invalid.push('OMDB API key appears invalid.');
          }
        } catch (e) {
          warnings.push('Could not verify OMDB key (network error).');
        }
      }

      async function checkGiphy() {
        if (!giphyKey) return;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 5000);
        try {
          const url = 'https://api.giphy.com/v1/gifs/random?api_key=' +
            encodeURIComponent(giphyKey) + '&tag=hi&rating=g';
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(id);
          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
              invalid.push('GIPHY API key appears invalid.');
            } else {
              warnings.push('Could not verify GIPHY key (HTTP ' + res.status + ').');
            }
            return;
          }
        } catch (e) {
          warnings.push('Could not verify GIPHY key (network error).');
        }
      }

      await Promise.all([checkOmdb(), checkGiphy()]);
      return { invalid, warnings };
    }

    document.getElementById('saveBtn').onclick = async () => {
      const omdbKey = omdbInput.value || '';
      const giphyKey = giphyInput.value || '';
      let port = parseInt(portInput.value, 10);
      if (!Number.isFinite(port) || port <= 0 || port > 65535) {
        port = 3001;
      }

      const lines = [
        'OMDB_API_KEY=' + omdbKey,
        'GIPHY_API_KEY=' + giphyKey,
        'PORT=' + String(port)
      ].join('\\n') + '\\n';

      try {
        fs.writeFileSync(envPath, lines, 'utf8');
      } catch (e) {
        statusEl.textContent = 'Error saving file: ' + (e && e.message ? e.message : String(e));
        statusEl.style.color = '#fb7185';
        return;
      }

      statusEl.textContent = 'Checking keys...';
      statusEl.style.color = '#9ca3af';

      const { invalid, warnings } = await validateKeys(omdbKey.trim(), giphyKey.trim());

      if (invalid.length) {
        if (invalid.length === 2) {
          statusEl.textContent = 'Both API key appears invalid.';
        } else {
          statusEl.textContent = invalid.join(' ');
        }
        statusEl.style.color = '#fb7185';
        return;
      }

      if (warnings.length) {
        statusEl.textContent = 'Saved. Restarting (could not fully verify keys).';
      } else {
        statusEl.textContent = 'Saved. Restarting...';
      }
      statusEl.style.color = '#4ade80';
      ipcRenderer.send('env-saved-restart');
    };

    document.getElementById('closeBtn').onclick = () => {
      window.close();
    };
  </script>
</body>
</html>`;

  editorWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  editorWin.once('ready-to-show', () => {
    editorWin.show();
  });
}

const VIDEO_EXTS = ['.mp4', '.mkv', '.webm', '.avi'];
const SUB_EXTS = ['.srt', '.vtt'];

function hasExt(name, exts) {
  return exts.includes(path.extname(name).toLowerCase());
}

function clearFiles(dir, exts) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    if (hasExt(f, exts)) {
      try {
        fs.unlinkSync(path.join(dir, f));
      } catch (_) {}
    }
  }
}

async function handleChooseVideo() {
  ensureDirs();
  const res = await dialog.showOpenDialog({
    title: 'Choose video file',
    properties: ['openFile'],
    filters: [
      { name: 'Video', extensions: ['mp4', 'mkv', 'webm', 'avi'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (res.canceled || !res.filePaths || !res.filePaths[0]) return;

  const src = res.filePaths[0];
  const basename = path.basename(src);
  const ext = path.extname(basename).toLowerCase();
  if (!VIDEO_EXTS.includes(ext)) {
    dialog.showErrorBox('Invalid video', 'Please choose a .mp4, .mkv, .webm, or .avi file.');
    return;
  }

  try {
    clearFiles(videoDir, VIDEO_EXTS);
    const dest = path.join(videoDir, basename);
    fs.copyFileSync(src, dest);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.reloadIgnoringCache();
    }
  } catch (err) {
    dialog.showErrorBox(
      'Video error',
      `Could not copy video:\n\n${err && err.message ? err.message : String(err)}`
    );
  }
}

async function handleChooseSubtitle() {
  ensureDirs();
  const res = await dialog.showOpenDialog({
    title: 'Choose subtitle file',
    properties: ['openFile'],
    filters: [
      { name: 'Subtitles', extensions: ['srt', 'vtt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (res.canceled || !res.filePaths || !res.filePaths[0]) return;

  const src = res.filePaths[0];
  const basename = path.basename(src);
  const ext = path.extname(basename).toLowerCase();
  if (!SUB_EXTS.includes(ext)) {
    dialog.showErrorBox('Invalid subtitle', 'Please choose a .srt or .vtt file.');
    return;
  }

  try {
    clearFiles(videoDir, SUB_EXTS);
    let dest = path.join(videoDir, basename);
    fs.copyFileSync(src, dest);

    const videoFiles = fs
      .readdirSync(videoDir)
      .filter((f) => hasExt(f, VIDEO_EXTS));
    if (videoFiles.length === 1) {
      const videoBase = path.basename(videoFiles[0], path.extname(videoFiles[0]));
      const target = path.join(videoDir, `${videoBase}${ext}`);
      if (target !== dest) {
        try {
          fs.renameSync(dest, target);
          dest = target;
        } catch (_) {}
      }
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.reloadIgnoringCache();
    }
  } catch (err) {
    dialog.showErrorBox(
      'Subtitle error',
      `Could not copy subtitle:\n\n${err && err.message ? err.message : String(err)}`
    );
  }
}

function handleInvitePartner() {
  if (!serverInfo) {
    dialog.showErrorBox('Invite Partner', 'Server is not running yet. Please try again in a moment.');
    return;
  }

  const ip = serverInfo.ip || 'localhost';
  const port = serverInfo.port || 3001;
  const lanUrl = `http://${ip}:${port}`;
  const localhostUrl = `http://localhost:${port}`;

  const inviteWin = new BrowserWindow({
    width: 460,
    height: 280,
    resizable: false,
    minimizable: false,
    maximizable: false,
    parent: mainWindow || undefined,
    modal: true,
    autoHideMenuBar: true,
    show: false,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false
    }
  });

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Invite Partner</title>
<style>
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
  }
  body {
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    background:#0f172a;
    color:#e5e7eb;
    overflow: hidden;
  }
  .wrap {
    padding:16px;
    display:flex;
    flex-direction:column;
    gap:10px;
    height:100%;
    box-sizing:border-box;
  }
  h1 { margin:0 0 4px; font-size:18px; }
  .url-box {
    font-size:13px;
    background:#020617;
    padding:8px 10px;
    border-radius:8px;
    word-break:break-all;
    border:1px solid #1f2937;
  }
  .hint { font-size:12px; color:#9ca3af; }
  .buttons {
    margin-top:6px;
    display:flex;
    gap:8px;
    flex-wrap:wrap;
    align-items:center;
  }
  button {
    border-radius:8px;
    border:1px solid #1d4ed8;
    background:#1d4ed8;
    color:#fff;
    padding:6px 10px;
    cursor:pointer;
    font-size:13px;
  }
  button.secondary {
    background:#020617;
    border-color:#374151;
    color:#e7e7eb;
  }
  button.close {
    margin-left:auto;
    background:#111827;
    border-color:#374151;
  }
</style>
</head>
<body>
  <div class="wrap">
    <div class="hint">Share this Wi‑Fi URL with your partner:</div>
    <div class="url-box" id="lanUrl">${lanUrl}</div>
    <div class="hint">If that does not work, try this on your own device:</div>
    <div class="url-box" id="localhostUrl">${localhostUrl}</div>
    <div class="buttons">
      <button id="copyLan">Copy Share Link</button>
      <button id="copyLocal" class="secondary">Copy Local URL</button>
      <button id="closeBtn" class="close">Close</button>
    </div>
  </div>
  <script>
    const { clipboard } = require('electron');

    function wireCopyButton(btnId, urlId) {
      const btn = document.getElementById(btnId);
      const el = document.getElementById(urlId);
      if (!btn || !el) return;
      let timer = null;
      const original = btn.textContent;
      btn.onclick = () => {
        const text = el.textContent.trim();
        clipboard.writeText(text);
        btn.textContent = 'Copied';
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          btn.textContent = original;
        }, 1200);
      };
    }

    wireCopyButton('copyLan', 'lanUrl');
    wireCopyButton('copyLocal', 'localhostUrl');

    document.getElementById('closeBtn').onclick = () => {
      window.close();
    };
  </script>
</body>
</html>`;

  inviteWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  inviteWin.once('ready-to-show', () => {
    inviteWin.show();
  });
}

function compareVersions(a, b) {
  const pa = String(a).replace(/^v/i, '').split('.').map(x => parseInt(x, 10) || 0);
  const pb = String(b).replace(/^v/i, '').split('.').map(x => parseInt(x, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const va = pa[i] || 0;
    const vb = pb[i] || 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

function handleCheckForUpdates() {
  const currentVersion = app.getVersion();
  const owner = 'folliejester';
  const repo = 'SyncPlay';

  const options = {
    hostname: 'api.github.com',
    path: `/repos/${owner}/${repo}/releases/latest`,
    headers: {
      'User-Agent': 'SyncPlay-Updater',
      'Accept': 'application/vnd.github+json'
    }
  };

  const req = https.get(options, (res) => {
    if (res.statusCode !== 200) {
      dialog.showErrorBox('Check for Updates', `Update check failed (HTTP ${res.statusCode}).`);
      res.resume();
      return;
    }
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      let json;
      try {
        json = JSON.parse(body);
      } catch (e) {
        dialog.showErrorBox('Check for Updates', 'Could not parse update information from GitHub.');
        return;
      }

      const latestTagRaw = json.tag_name || json.name || '';
      const latestTag = latestTagRaw.replace(/^v/i, '');
      if (!latestTag) {
        dialog.showErrorBox('Check for Updates', 'Latest version tag not found on GitHub.');
        return;
      }

      const cmp = compareVersions(latestTag, currentVersion);
      if (cmp <= 0) {
        dialog.showMessageBox({
          type: 'info',
          title: 'Check for Updates',
          message: 'You are up to date.',
          detail: `Current version: ${currentVersion}\nLatest version: ${latestTagRaw}`
        });
        return;
      }

      const assets = Array.isArray(json.assets) ? json.assets : [];
      const platform = process.platform;
      let assetMatcher;
      if (platform === 'win32') {
        assetMatcher = /\.(exe|msi)$/i;
      } else if (platform === 'darwin') {
        assetMatcher = /\.(dmg|pkg|zip)$/i;
      } else {
        assetMatcher = /\.(AppImage|deb|rpm|tar\.gz)$/i;
      }

      let asset = assets.find(a => assetMatcher.test(a.name || '')) || assets[0];

      if (!asset || !asset.browser_download_url) {
        dialog.showMessageBox({
          type: 'info',
          title: 'Update available',
          message: 'A new version is available.',
          detail: `Current version: ${currentVersion}\nLatest version: ${latestTagRaw}\n\nNo platform-specific installer was found; open the releases page?`,
          buttons: ['Open Releases Page', 'Cancel'],
          defaultId: 0,
          cancelId: 1
        }).then(({ response }) => {
          if (response === 0) {
            shell.openExternal(json.html_url || `https://github.com/${owner}/${repo}/releases`);
          }
        });
        return;
      }

      dialog.showMessageBox({
        type: 'info',
        title: 'Update available',
        message: 'A new version of SyncPlay is available.',
        detail: `Current version: ${currentVersion}\nLatest version: ${latestTagRaw}\n\nClick "Download" to download the latest installer from GitHub:\n${asset.name}`,
        buttons: ['Download', 'Cancel'],
        defaultId: 0,
        cancelId: 1
      }).then(({ response }) => {
        if (response === 0) {
          shell.openExternal(asset.browser_download_url);
        }
      });
    });
  });

  req.on('error', (err) => {
    dialog.showErrorBox('Check for Updates', `Update check failed:\n\n${err && err.message ? err.message : String(err)}`);
  });
}

function handleAbout() {
  const version = app.getVersion();
  const detail = [
    `Version ${version}`,
    '',
    'SyncPlay lets two people watch a movie together in sync using a small local web server.',
    '',
    'Key features:',
    '• Local-first: your videos never leave your machine.',
    '• Simple, 2-person focused experience.',
    '• Works over local network or via tools like Tailscale.',
    '',
    'Data & privacy:',
    '• Stores config and temporary video/subtitle copies under your user profile:',
    `  ${dataRoot || '(folder created on first run)'}`,
    '• No accounts, no analytics, no cloud storage.',
    '',
    'Tech stack:',
    '• Desktop: Electron',
    '• Backend: Node.js (internal HTTP server)',
    '',
    'Avatar: x.com/emia_icons',
    'Project home: https://github.com/folliejester/SyncPlay'
  ].join('\n');

  dialog.showMessageBox({
    type: 'info',
    title: 'About SyncPlay',
    message: 'SyncPlay',
    detail,
    buttons: ['OK']
  });
}

function handleHelp() {
  const helpWin = new BrowserWindow({
    width: 580,
    height: 460,
    resizable: true,
    minimizable: false,
    maximizable: false,
    parent: mainWindow || undefined,
    modal: true,
    autoHideMenuBar: true,
    show: false,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false
    }
  });

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Help</title>
<style>
  html, body { margin:0; padding:0; height:100%; }
  body {
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    background:#020617;
    color:#e5e7eb;
    display:flex;
    flex-direction:column;
  }
  main {
    flex:1 1 auto;
    padding:10px 16px 12px;
    box-sizing:border-box;
    overflow-y:auto;
  }
  .hint {
    font-size:12px;
    color:#9ca3af;
    margin-bottom:8px;
  }
  .faq-item {
    border-radius:10px;
    border:1px solid #1f2937;
    background:#020617;
    margin-bottom:8px;
    overflow:hidden;
  }
  .faq-q {
    padding:8px 10px;
    font-size:13px;
    cursor:pointer;
    display:flex;
    align-items:center;
    justify-content:space-between;
  }
  .faq-q:hover {
    background:#0b1120;
  }
  .faq-q span.label {
    flex:1 1 auto;
    margin-right:8px;
  }
  .faq-q span.toggle {
    font-size:16px;
    color:#9ca3af;
  }
  .faq-a {
    padding:8px 10px 10px;
    font-size:12px;
    color:#cbd5f5;
    border-top:1px solid #111827;
    display:none;
  }
  footer {
    padding:8px 16px 10px;
    border-top:1px solid #1f2937;
    display:flex;
    justify-content:flex-end;
    gap:8px;
  }
  button {
    border-radius:8px;
    border:1px solid #374151;
    background:#111827;
    color:#e5e7eb;
    padding:6px 12px;
    cursor:pointer;
    font-size:13px;
  }
  button:hover {
    border-color:#4b5563;
  }
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size:11px;
    background:#020617;
    padding:1px 3px;
    border-radius:4px;
  }
  ul { margin:4px 0 4px 18px; padding:0; }
</style>
</head>
<body>
  <main>
    <div class="hint">Click a question to reveal the answer.</div>

    <div class="faq-item">
      <div class="faq-q">
        <span class="label">How do I select a video and subtitles?</span>
        <span class="toggle">+</span>
      </div>
      <div class="faq-a">
        Use the <strong>Select Video</strong> menu at the top:
        <ul>
          <li><strong>Choose Video</strong> – pick a movie file. It will be copied into SyncPlay.</li>
          <li><strong>Choose Subtitle</strong> – pick an <code>.srt</code> or <code>.vtt</code> file. It is placed next to the video automatically.</li>
        </ul>
        The page reloads so the new files are used.
      </div>
    </div>

    <div class="faq-item">
      <div class="faq-q">
        <span class="label">How do I invite my partner?</span>
        <span class="toggle">+</span>
      </div>
      <div class="faq-a">
        Click the <strong>Invite Partner</strong> menu. It shows:
        <ul>
          <li>A <strong>Share Link</strong> using your Wi‑Fi IP – send this to your partner on the same network.</li>
          <li>A <strong>Local URL</strong> – works on your own device.</li>
        </ul>
        Use the copy buttons so you don't have to type the links.
      </div>
    </div>

    <div class="faq-item">
      <div class="faq-q">
        <span class="label">Where are my video and subtitle files stored?</span>
        <span class="toggle">+</span>
      </div>
      <div class="faq-a">
        Files you choose are copied into SyncPlay's data folder inside your user profile
        (Electron <code>userData/syncplay-data/video</code>). Each user on the PC has their own folder.
      </div>
    </div>

    <div class="faq-item">
      <div class="faq-q">
        <span class="label">Why is the movie name and GIF not showing?</span>
        <span class="toggle">+</span>
      </div>
      <div class="faq-a">
        Open <strong>Menu → Settings</strong>:
        <ul>
          <li>Paste your OMDB and GIPHY keys.</li>
          <li>Optionally change the port (default <code>3001</code>).</li>
        </ul>
        Click <strong>Save and Restart</strong>. The app checks the keys quickly before restarting.
      </div>
    </div>

    <div class="faq-item">
      <div class="faq-q">
        <span class="label">Partner can't connect – what should we check?</span>
        <span class="toggle">+</span>
      </div>
      <div class="faq-a">
        Make sure:
        <ul>
          <li>Both devices are on the same Wi‑Fi / network.</li>
          <li>They use the exact link from <strong>Invite Partner</strong>.</li>
          <li>Firewall/antivirus allows the chosen port (default <code>3001</code>).</li>
        </ul>
        If the default port is blocked, SyncPlay will try the next free port automatically.
        <br><br>
        If you are <strong>not on the same network</strong>, you can use <strong>Tailscale</strong> (One time setup):
        <ul>
          <li>Install Tailscale on both devices (use the button below or visit <code>tailscale.com/download</code>).</li>
          <li>Open Tailscale on both devices and sign in with the same account and click connect.</li>
          <li>Restart SyncPlay on the host device.</li>
          <li>Copy and share the invite link from "Invite Partner".</li>
        </ul>
      </div>
    </div>

    <div class="faq-item">
      <div class="faq-q">
        <span class="label">Subtitles don't match – how do I fix timing?</span>
        <span class="toggle">+</span>
      </div>
      <div class="faq-a">
        Use the subtitle offset controls under the video:
        <ul>
          <li>Buttons like <code>-200ms</code> / <code>+200ms</code> shift subtitles.</li>
          <li>Enable <strong>Broadcast</strong> to apply the same offset for both of you.</li>
        </ul>
      </div>
    </div>
  </main>
  <footer>
    <button id="installTailscaleBtn">Install Tailscale</button>
    <button id="closeBtn">Close</button>
  </footer>
  <script>
    const { shell } = require('electron');

    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      const q = item.querySelector('.faq-q');
      const a = item.querySelector('.faq-a');
      const toggle = item.querySelector('.toggle');
      q.onclick = () => {
        const isOpen = a.style.display === 'block';
        a.style.display = isOpen ? 'none' : 'block';
        toggle.textContent = isOpen ? '+' : '−';
      };
    });

    document.getElementById('closeBtn').onclick = () => {
      window.close();
    };

    const installBtn = document.getElementById('installTailscaleBtn');
    if (installBtn) {
      installBtn.onclick = () => {
        const p = process.platform;
        let url = 'https://tailscale.com/download';
        if (p === 'win32') {
          url = 'https://pkgs.tailscale.com/stable/tailscale-setup-latest.exe';
        } else if (p === 'darwin') {
          url = 'https://pkgs.tailscale.com/stable/Tailscale-latest.pkg';
        } else if (p === 'linux') {
          url = 'https://tailscale.com/download/linux';
        }
        shell.openExternal(url);
      };
    }
  </script>
</body>
</html>`;

  helpWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  helpWin.once('ready-to-show', () => {
    helpWin.show();
  });
}

function createMenu() {
  const template = [
    {
      label: 'Menu',
      submenu: [
        {
          label: 'Settings',
          click: () => { handleEditEnv(); }
        },
        { type: 'separator' },
        { role: 'quit', label: 'Exit' }
      ]
    },
    {
      label: 'Select Video',
      submenu: [
        {
          label: 'Choose Video',
          click: () => { handleChooseVideo(); }
        },
        {
          label: 'Choose Subtitle',
          click: () => { handleChooseSubtitle(); }
        }
      ]
    },
    {
      label: 'Invite Partner',
      click: () => { handleInvitePartner(); }
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'View Help',
          click: () => { handleHelp(); }
        },
        {
          label: 'Check for Updates',
          click: () => { handleCheckForUpdates(); }
        },
        {
          label: 'About',
          click: () => { handleAbout(); }
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createMainWindow() {
  if (!serverInfo) return;

  const iconPath = path.join(__dirname, 'public', 'logo.png');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    autoHideMenuBar: false,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  mainWindow.maximize();

  const url = `http://localhost:${serverInfo.port || 3001}/`;
  mainWindow.loadURL(url);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function boot() {
  ensureDirs();
  process.env.SYNCPLAY_DATA_ROOT = dataRoot;

  const { startServer } = require('./server');

  try {
    serverInfo = await startServer();
  } catch (err) {
    dialog.showErrorBox(
      'SyncPlay error',
      `Could not start the internal server:\n\n${err && err.message ? err.message : String(err)}`
    );
    app.quit();
    return;
  }

  createMenu();
  createMainWindow();
}

ipcMain.on('env-saved-restart', () => {
  app.relaunch();
  app.exit(0);
});

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(boot);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (!mainWindow && serverInfo) {
      createMainWindow();
    }
  });
}
