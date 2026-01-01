# Movie Sync (Self-hosted)

Two-person synchronized movie watch app over a private network (e.g., Tailscale). Single permanent shared room, equal permissions.

Requirements
- Node.js 18+ recommended.
- Place your files as:

```
movie-sync/
├── server.js
├── package.json
├── utils/
│   └── srtToVtt.js
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── avatar/          # png/jpg/jpeg (local avatars)
└── video/           # single movie (mp4/mkv/webm/avi) + optional matching .srt
```

Setup
1. Put at least one video file in ./video. The first one (alphabetically) is used.
2. Optional: Add a matching `.srt` file with the same basename, e.g., `movie.mkv` + `movie.srt`.
3. Put some avatar images in ./avatar (png/jpg/jpeg).

Install & Run
```
npm install
npm start
```
Open http://localhost:3000 in both browsers (or machines on your LAN/Tailscale).

Features
- Realtime play/pause/seek via Socket.io. Drift correction using an authoritative client (earliest join).
- Manual "Sync Now".
- Chat with avatars, typing indicator, local-time timestamps, optional notification beep.
- Subtitles: SRT → VTT conversion on-the-fly, toggle on/off, font size control, manual offset (local or broadcast).
- Range-enabled streaming endpoint for HTML5 video.

Notes
- Single shared room; no auth. Intended for private networks (e.g., Tailscale).
- Avatars and videos are served from project root (outside /public) via dedicated endpoints for privacy.
- If no subtitles exist, the app continues without CC.

Troubleshooting
- If video won't play over remote: ensure both devices can reach the server IP/port (Tailscale or LAN).
- For MKV/AVI, browser support varies. MP4/H.264 is most compatible.
- Large SRT files are converted in memory; cached by mtime until the file changes.