# SyncPlay

Self‑hosted 2‑person synchronized movie watch app.

Your video never leaves your machine, SyncPlay runs a tiny local web server and a desktop app.

---

## Features

- 🎬 Synchronized playback for 2 people
- 🌐 Works over local network or via VPN tools like Tailscale
- 🧑‍🤝‍🧑 Avatars (art by [x.com/emia_icons](https://x.com/emia_icons))
- 💬 Chat with emoji & GIF (GIPHY) & reactions
- 📝 Subtitles with live offset controls & broadcast to partner
- 🔑 OMDB movie title/details
- 💻 Desktop app

---

## Install

1. Go to the latest SyncPlay release:  
   <https://github.com/folliejester/SyncPlay/releases/latest>
2. Under **Assets**, download the installer for your OS:
   - Windows: `.exe` or `.msi`
   - macOS: `.dmg` / `.pkg` / `.zip`
   - Linux: `.AppImage` / `.deb` / `.rpm` / `.tar.gz`
3. Run the installer.
4. Launch **SyncPlay** from your OS applications menu.

That’s it.

---

## First steps in the app

1. Open **Menu → Settings**:
   - Optionally add your **OMDB** and **GIPHY** API keys.
   - Optionally change the port (default `3001`).
   - Click **Save and Restart**.

2. Use **Select Video**:
   - **Choose Video** – pick a `.mp4`, `.mkv`, `.webm`, or `.avi`.
   - **Choose Subtitle** – optional `.srt` or `.vtt`.

3. Click **Invite Partner** in app:
   - Share the **Link** with your partner.

4. Join the room:
   - Pick a username and avatar.
   - Chat, react with emoji/GIFs, and watch together.

---

## Advanced: run from source (Optional)

For development or running without the packaged installer.

### Requirements

- Node.js (recent LTS recommended)
- npm

### Setup

```bash
git clone https://github.com/folliejester/SyncPlay.git
cd SyncPlay
npm install
```

### Desktop app (development)

```bash
npm run electron:dev
```

- Starts the internal server.
- Opens the Electron window.
- Menus: **Settings**, **Select Video**, **Invite Partner**, **Help**, **Check for Updates**, **About**.

### Server‑only mode (browser)

```bash
node server.js
```

- Open the printed URL (e.g. `http://localhost:3001`) in your browser.
- Share the LAN URL with your partner (same Wi‑Fi).
- For remote use, put it behind a VPN (e.g. [Tailscale](https://tailscale.com/download)) or your own tunneling/port‑forwarding.

---

## Project

- Repo: <https://github.com/folliejester/SyncPlay>  
- Avatar art: [x.com/emia_icons](https://x.com/emia_icons)  
- Love the project? Donate: <https://donate.rxo.me>
