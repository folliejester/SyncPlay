require('dotenv').config();

const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const { Server } = require('socket.io');
const mime = require('mime');
const srtToVtt = require('./utils/srtToVtt');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3001;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const VIDEO_DIR = path.join(ROOT, 'video');
const AVATAR_DIR = path.join(ROOT, 'avatar');
const SMS_SOUND = path.join(ROOT, 'newsms.mp3'); 

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

const VIDEO_EXTS = ['.mp4', '.mkv', '.webm', '.avi'];
const AVATAR_EXTS = ['.png', '.jpg', '.jpeg'];
const REACTION_EMOJIS = ['👍', '😂', '❤️'];

function cleanTitleFromFilename(rawName) {
  let name = rawName;

  name = name.replace(/\[[^\]]*]/g, ' ');

  name = name.replace(/\([^)]+\)$/g, ' ');

  name = name.replace(/[-_.]+/g, ' ');

  const patterns = [
    /\b(480p|720p|1080p|2160p|4k|x264|x265|h\.?264|h\.?265|hevc|hdr|dvdrip|brrip|bluray|web[- ]?dl|webrip|hdrip|hdtv|xvid)\b/gi,
    /\b(10bit|8bit|yts|yify|rarbg|evo|eztv|etrg|ganool|bdrip|nf|amzn|hmax)\b/gi,
    /\b(dual[- ]audio|multi[- ]subs?|dubbed|extended|unrated|proper|repack|readnfo)\b/gi,
    /\b(ac3|aac[2-7]?|dts[- ]?hd?|truehd|ddp?5\.1|7\.1)\b/gi,
    /-\s*[a-z0-9]+$/i 

  ];
  for (const re of patterns) name = name.replace(re, ' ');

  name = name.replace(/\s+/g, ' ').trim();
  return name;
}

function guessTitleAndYear(filePath) {
  const base = path.basename(filePath, path.extname(filePath));
  const cleaned = cleanTitleFromFilename(base);
  const yearMatch = cleaned.match(/\b(19|20)\d{2}\b/);
  let year = null;
  let title = cleaned;
  if (yearMatch) {
    year = yearMatch[0];
    title = cleaned.replace(yearMatch[0], '').replace(/\s+/g, ' ').trim();
  }

  title = title.replace(/\b[12]\b$/, '').trim();
  return { title, year };
}

function fetchOmdbJson(params) {
  if (!OMDB_API_KEY) return Promise.resolve(null);

  const all = Object.assign({ apikey: OMDB_API_KEY }, params || {});
  const qs = Object.keys(all)
    .filter((k) => all[k] != null && all[k] !== '')
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(String(all[k]))}`)
    .join('&');
  const url = `https://www.omdbapi.com/?${qs}`;

  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            console.error('[omdb] HTTP', res.statusCode, url);
            return resolve(null);
          }
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            console.error('[omdb] JSON parse error:', e.message || e);
            resolve(null);
          }
        });
      })
      .on('error', (err) => {
        console.error('[omdb] request error:', err.message || err);
        reject(err);
      });
  });
}

async function queryOmdb(title, year) {
  if (!title) return null;
  try {

    let json = await fetchOmdbJson({ t: title, ...(year ? { y: year } : {}) });
    if (json && json.Response === 'True') return json;

    if (year) {
      json = await fetchOmdbJson({ t: title });
      if (json && json.Response === 'True') return json;
    }

    json = await fetchOmdbJson({ s: title, ...(year ? { y: year } : {}) });
    if (json && json.Response === 'True' && Array.isArray(json.Search) && json.Search.length) {
      const first = json.Search[0];
      if (first.imdbID) {
        const full = await fetchOmdbJson({ i: first.imdbID });
        if (full && full.Response === 'True') return full;
      }
      return first;
    }

    if (year) {
      json = await fetchOmdbJson({ s: title });
      if (json && json.Response === 'True' && Array.isArray(json.Search) && json.Search.length) {
        const first = json.Search[0];
        if (first.imdbID) {
          const full = await fetchOmdbJson({ i: first.imdbID });
          if (full && full.Response === 'True') return full;
        }
        return first;
      }
    }
  } catch (e) {
    console.error('[omdb] error querying OMDB:', e.message || e);
  }
  return null;
}

let cachedMovieInfo = null;
let movieInfoPromise = null;

async function getMovieInfo() {
  if (cachedMovieInfo) return cachedMovieInfo;
  if (movieInfoPromise) return movieInfoPromise;

  const videoPath = getFirstVideoPath();
  if (!videoPath) {
    //console.log('[movieInfo] no video found in', VIDEO_DIR);
    return null;
  }

  const { title, year } = guessTitleAndYear(videoPath);
  //console.log('[movieInfo] guessed from filename:', { videoPath, title, year });

  movieInfoPromise = queryOmdb(title, year)
    .then((info) => {
      if (!info) {
        //console.log('[movieInfo] OMDB returned no match');
      } else {
        //console.log('[movieInfo] OMDB match:', info.Title || info.title, info.Year || info.year, info.imdbID);
      }
      cachedMovieInfo = info || null;
      return cachedMovieInfo;
    })
    .finally(() => {
      movieInfoPromise = null;
    });

  return movieInfoPromise;
}

const users = new Map(); 

const roomState = {
  isPlaying: false,
  currentTime: 0,
  lastActionTs: 0,
  authoritativeId: null,
  lastSnapshot: null 

};

const pendingSyncRequests = new Set(); 

const messageReactions = new Map();

app.use(express.json());

app.get('/roomStatus', (req, res) => {
  res.json({
    capacity: 2,
    count: users.size,
    roomFull: users.size >= 2
  });
});

app.get('/', (req, res) => {
  if (users.size >= 2) {
    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Room is full</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
       background:#050814;color:#e5e7eb;display:flex;align-items:center;
       justify-content:center;min-height:100vh;text-align:center;padding:16px;}
  .box{max-width:480px;background:#111827;border-radius:12px;
       border:1px solid #1f2937;padding:24px;box-shadow:0 10px 40px rgba(0,0,0,.6);}
  h1{margin:0 0 8px;font-size:1.4rem;}
  p{margin:0 0 4px;font-size:.95rem;color:#9ca3af;}
</style>
</head>
<body>
  <div class="box">
    <h1>Room is full</h1>
    <p>This watch room already has 2 people connected.</p>
    <p>Please try again later.</p>
  </div>
</body>
</html>`);
  } else {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  }
});

app.use(express.static(PUBLIC_DIR, { fallthrough: true }));

app.get('/favicon.ico', (req, res) => {
  const icon = path.join(PUBLIC_DIR, 'logo.png');
  if (fs.existsSync(icon)) {
    res.type('image/png').sendFile(icon);
  } else {
    res.status(404).end();
  }
});

app.get('/newsms.mp3', (req, res) => {
  if (fs.existsSync(SMS_SOUND)) {
    res.type('audio/mpeg').sendFile(SMS_SOUND);
  } else {
    res.status(404).end();
  }
});

app.get('/movieInfo', async (req, res) => {
  try {
    const info = await getMovieInfo();
    if (!info) {
      return res.json({ found: false });
    }
    res.json({
      found: true,
      title: info.Title || info.title || null,
      year: info.Year || info.year || null,
      imdbID: info.imdbID || null,

      poster: info.Poster || null,
      genre: info.Genre || null,
      plot: info.Plot || null,
      runtime: info.Runtime || null,
      rated: info.Rated || null,
      director: info.Director || null,
      actors: info.Actors || null
    });
  } catch (e) {
    console.error('[movieInfo] error:', e.message || e);
    res.json({ found: false });
  }
});

app.get('/gifs', (req, res) => {
  if (!GIPHY_API_KEY) {
    return res.status(500).json({ ok: false, error: 'GIPHY_API_KEY not configured' });
  }
  const q = (req.query.q || 'reaction').toString();
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(
    GIPHY_API_KEY
  )}&q=${encodeURIComponent(q)}&limit=24&rating=g&lang=en`;

  https
    .get(url, (gRes) => {
      let data = '';
      gRes.on('data', (chunk) => (data += chunk));
      gRes.on('end', () => {
        res
          .status(gRes.statusCode || 500)
          .type('application/json')
          .send(data);
      });
    })
    .on('error', (err) => {
      console.error('[giphy] request error:', err.message || err);
      res.status(500).json({ ok: false, error: 'Giphy request failed' });
    });
});

function listFiles(dir, exts) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => exts.includes(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));
}

function getFirstVideoPath() {
  const files = listFiles(VIDEO_DIR, VIDEO_EXTS);
  if (!files.length) return null;
  return path.join(VIDEO_DIR, files[0]);
}

function getMatchingSrt(videoPath) {

  if (!videoPath || !fs.existsSync(VIDEO_DIR)) return null;

  const base = path.basename(videoPath, path.extname(videoPath));
  const entries = fs.readdirSync(VIDEO_DIR);

  const subtitleExts = ['.vtt', '.srt'];
  const exactMatches = [];
  const prefixedMatches = [];

  for (const f of entries) {
    const ext = path.extname(f).toLowerCase();
    if (!subtitleExts.includes(ext)) continue;

    const nameWithoutExt = path.basename(f, ext);
    if (nameWithoutExt === base) {

      exactMatches.push(path.join(VIDEO_DIR, f));
    } else if (nameWithoutExt.startsWith(base)) {

      prefixedMatches.push(path.join(VIDEO_DIR, f));
    }
  }

  const pickPreferred = (arr) => {
    if (!arr.length) return null;

    arr.sort((a, b) => {
      const extA = path.extname(a).toLowerCase();
      const extB = path.extname(b).toLowerCase();
      if (extA === extB) return 0;
      return extA === '.vtt' ? -1 : 1;
    });
    return arr[0];
  };

  const bestExact = pickPreferred(exactMatches);
  if (bestExact) return bestExact;

  const bestPrefixed = pickPreferred(prefixedMatches);
  if (bestPrefixed) return bestPrefixed;

  const any = entries.find(f => subtitleExts.includes(path.extname(f).toLowerCase()));
  return any ? path.join(VIDEO_DIR, any) : null;
}

const vttCache = new Map(); 

app.get('/stream', (req, res) => {
  const videoPath = getFirstVideoPath();
  if (!videoPath) {
    res.status(404).send('No video file found in ./video');
    return;
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const contentType = mime.getType(path.extname(videoPath)) || 'application/octet-stream';

  const range = req.headers.range;
  if (!range) {
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': fileSize,
      'Accept-Ranges': 'bytes',
    });
    fs.createReadStream(videoPath).pipe(res);
    return;
  }

  const parts = range.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  if (isNaN(start) || isNaN(end) || start > end || end >= fileSize) {
    res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
    return;
  }

  const chunkSize = end - start + 1;
  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunkSize,
    'Content-Type': contentType
  });
  fs.createReadStream(videoPath, { start, end }).pipe(res);
});

app.get('/subtitle.vtt', (req, res) => {
  //console.log('[subtitle] Request for /subtitle.vtt');
  const videoPath = getFirstVideoPath();
  //console.log('[subtitle] Current video:', videoPath);
  const subtitlePath = getMatchingSrt(videoPath);

  if (!subtitlePath) {
    console.warn('[subtitle] No matching subtitle found for', videoPath, 'in', VIDEO_DIR);
    res.status(404).send('No matching subtitle');
    return;
  }

  //console.log('[subtitle] Using subtitle file:', subtitlePath);

  try {
    const stat = fs.statSync(subtitlePath);
    const cached = vttCache.get(subtitlePath);
    if (cached && cached.mtimeMs === stat.mtimeMs) {
      res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
      res.send(cached.vtt);
      return;
    }

    const ext = path.extname(subtitlePath).toLowerCase();
    let vtt;

    if (ext === '.vtt') {

      vtt = fs.readFileSync(subtitlePath, 'utf8');
    } else {

      const srtContent = fs.readFileSync(subtitlePath, 'utf8');
      vtt = srtToVtt(srtContent);
    }

    vttCache.set(subtitlePath, { mtimeMs: stat.mtimeMs, vtt });
    res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
    res.send(vtt);
  } catch (e) {
    console.error('[subtitle] Error handling subtitle file:', e);
    res.status(500).send('Subtitle conversion error');
  }
});

app.get('/avatars', (req, res) => {
  const files = listFiles(AVATAR_DIR, AVATAR_EXTS);
  const avatars = files.map(name => ({
    name,
    url: `/avatar/${encodeURIComponent(name)}`
  }));
  res.json({ avatars });
});

app.get('/avatar/:file', (req, res) => {
  const file = req.params.file;
  const safe = path.basename(file);
  const ext = path.extname(safe).toLowerCase();
  if (!AVATAR_EXTS.includes(ext)) return res.status(404).end();
  const full = path.join(AVATAR_DIR, safe);
  if (!fs.existsSync(full)) return res.status(404).end();
  res.sendFile(full);
});

function updateAuthoritative() {
  let min = null;
  for (const [id, u] of users.entries()) {
    if (!min || u.joinedAt < min.joinedAt) min = { id, joinedAt: u.joinedAt };
  }
  roomState.authoritativeId = min ? min.id : null;
}

function avatarsInUseList() {
  return Array.from(users.values())
    .map(u => u.avatar)
    .filter(Boolean);
}

function computeReactionCounts(byUser) {
  const counts = {};
  REACTION_EMOJIS.forEach((e) => {
    counts[e] = 0;
  });
  if (byUser) {
    for (const em of byUser.values()) {
      if (Object.prototype.hasOwnProperty.call(counts, em)) {
        counts[em] += 1;
      }
    }
  }
  return counts;
}

io.on('connection', (socket) => {
  socket.join('room');

  socket.emit('avatarsInUse', avatarsInUseList());

  socket.on('join', ({ username, avatar }, ack) => {

    if (!users.has(socket.id) && users.size >= 2) {
      if (typeof ack === 'function') {
        ack({ ok: false, error: 'room_full' });
      }
      return;
    }

    users.set(socket.id, { username, avatar, joinedAt: Date.now() });
    updateAuthoritative();

    if (typeof ack === 'function') {
      ack({ ok: true });
    }

    socket.broadcast.emit('systemMessage', {
      type: 'join',
      user: { username, avatar },
      timestamp: Date.now()
    });

    io.emit('avatarsInUse', avatarsInUseList());
  });

  socket.on('play', ({ time, ts }) => {
    if (typeof time !== 'number' || typeof ts !== 'number') return;
    if (ts >= roomState.lastActionTs) {
      roomState.isPlaying = true;
      roomState.currentTime = time;
      roomState.lastActionTs = ts;
      socket.broadcast.emit('play', { time, ts });
    }
  });

  socket.on('pause', ({ time, ts }) => {
    if (typeof time !== 'number' || typeof ts !== 'number') return;
    if (ts >= roomState.lastActionTs) {
      roomState.isPlaying = false;
      roomState.currentTime = time;
      roomState.lastActionTs = ts;
      socket.broadcast.emit('pause', { time, ts });
    }
  });

  socket.on('seek', ({ time, ts }) => {
    if (typeof time !== 'number' || typeof ts !== 'number') return;
    if (ts >= roomState.lastActionTs) {
      roomState.currentTime = time;
      roomState.lastActionTs = ts;
      socket.broadcast.emit('seek', { time, ts });
    }
  });

  socket.on('timeSync', ({ time, isPlaying, ts }) => {
    if (socket.id === roomState.authoritativeId) {
      const snapshot = { time, isPlaying, ts, from: socket.id, at: Date.now() };
      roomState.lastSnapshot = snapshot;

      if (pendingSyncRequests.size) {
        for (const id of pendingSyncRequests) {
          io.to(id).emit('timeSyncState', snapshot);
        }
        pendingSyncRequests.clear();
      }

    }
  });

  socket.on('requestSync', () => {

    if (roomState.lastSnapshot && Date.now() - roomState.lastSnapshot.at < 5000) {
      socket.emit('timeSyncState', roomState.lastSnapshot);
    } else if (roomState.authoritativeId) {
      pendingSyncRequests.add(socket.id);
      io.to(roomState.authoritativeId).emit('requestSnapshot');
    }
  });

  socket.on('typing', () => {
    const u = users.get(socket.id);
    if (!u) return;
    socket.broadcast.emit('typing', {
      username: u.username,
      avatar: u.avatar,
      timestamp: Date.now()
    });
  });

  socket.on('chatMessage', (payload = {}) => {
    const u = users.get(socket.id);
    if (!u) return;

    const { id, text, timestamp, type, url, replyTo } = payload;
    const kind = type || 'text';

    if (kind === 'gif') {
      if (typeof url !== 'string' || !url) return;
    } else {
      if (typeof text !== 'string') return;
    }

    const safeReply =
      replyTo && typeof replyTo === 'object'
        ? {
            id: typeof replyTo.id === 'string' ? replyTo.id : undefined,
            username: typeof replyTo.username === 'string' ? replyTo.username : undefined,
            text: typeof replyTo.text === 'string' ? replyTo.text : undefined
          }
        : undefined;

    socket.broadcast.emit('chatMessage', {
      username: u.username,
      avatar: u.avatar,
      id: typeof id === 'string' ? id : undefined,
      type: kind,
      text: kind === 'text' ? text : undefined,
      url: kind === 'gif' ? url : undefined,
      replyTo: safeReply,
      timestamp: typeof timestamp === 'number' ? timestamp : Date.now()
    });
  });

  socket.on('subtitleOffsetChange', ({ offset }) => {
    const u = users.get(socket.id);
    if (!u || typeof offset !== 'number') return;
    socket.broadcast.emit('subtitleOffsetChange', {
      offset,
      username: u.username,
      timestamp: Date.now()
    });
  });

  socket.on('pingTime', (t) => {
    socket.emit('pongTime', t);
  });

  socket.on('reactMessage', ({ msgId, emoji }) => {
    if (typeof msgId !== 'string' || !msgId) return;
    if (!REACTION_EMOJIS.includes(emoji)) return;

    let byUser = messageReactions.get(msgId);
    if (!byUser) {
      byUser = new Map();
      messageReactions.set(msgId, byUser);
    }

    const existing = byUser.get(socket.id);
    if (existing === emoji) {

      byUser.delete(socket.id);
    } else {
      byUser.set(socket.id, emoji);
    }

    if (!byUser.size) {
      messageReactions.delete(msgId);
    }

    const counts = computeReactionCounts(byUser);
    io.emit('messageReactions', { msgId, counts });
  });

  socket.on('disconnect', () => {
    const u = users.get(socket.id);
    users.delete(socket.id);
    updateAuthoritative();

    pendingSyncRequests.delete(socket.id);

    for (const [msgId, byUser] of messageReactions.entries()) {
      if (byUser.delete(socket.id)) {
        if (!byUser.size) {
          messageReactions.delete(msgId);
        }
        const counts = computeReactionCounts(byUser);
        io.emit('messageReactions', { msgId, counts });
      }
    }

    if (u) {
      socket.broadcast.emit('systemMessage', {
        type: 'leave',
        user: { username: u.username, avatar: u.avatar },
        timestamp: Date.now()
      });
    }

    io.emit('avatarsInUse', avatarsInUseList());
  });

  socket.on('updateProfile', ({ username, avatar }) => {
    const u = users.get(socket.id);
    if (!u) return;
    if (typeof username === 'string' && username.trim()) u.username = username.trim();
    if (typeof avatar === 'string' && avatar.trim()) u.avatar = avatar.trim();

    socket.broadcast.emit('systemMessage', {
      type: 'profile',
      user: { username: u.username, avatar: u.avatar },
      timestamp: Date.now()
    });
    io.emit('avatarsInUse', avatarsInUseList());
  });
});

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

server.listen(PORT, () => {
  const ip = getLocalIp();
  console.log(`Server on http://${ip}:${PORT}`);
});