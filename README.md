# SyncPlay

A simple way to watch a movie together with a partner over the network.

---

## 1. Download the project

1. Click on code
![](https://i.imgur.com/AVwsB0V.png)
2. Click on [**Download ZIP**](https://github.com/folliejester/SyncPlay/archive/refs/heads/main.zip).
3. Extract the downloaded ZIP file to a folder (for example: `C:\Downloads\SyncPlay`).

---

## 2. Install Node.js

1. Download Node.js v24.12.0 from:  
   https://nodejs.org/en/download/archive/v24.12.0
2. Install Node.js using the installer.
3. Restart your PC.
4. Open **Command Prompt** and run:

   ```bash
   node -v
   ```

   If you see a version number, Node.js is installed correctly.

---

## 3. Install dependencies

1. Open the extracted project folder.
2. Right-click inside the folder and choose **Open in Terminal** (or open CMD and `cd` into the folder).
3. Run:

   ```bash
   npm i
   ```

---

## 4. Add your movie and subtitle

1. Open the `video` folder inside the project.
2. Copy your movie file into this folder.  
   - Movie must end with `.mp4` or `.mkv`.
3. Copy your subtitle file into this folder.  
   - Subtitle must end with `.srt`.

---

## 5. Create the `.env` file

1. Open **Notepad**.
2. Type exactly:

   ```text
   OMDB_API_KEY=
   GIPHY_API_KEY=
   PORT=3000
   ```

3. Visit these websites to create API keys:
   - OMDB API key: https://www.omdbapi.com/apikey.aspx  
   - Giphy API key: https://developers.giphy.com/dashboard
4. Paste your keys after the `=` signs:

   ```text
   OMDB_API_KEY=your_omdb_key_here
   GIPHY_API_KEY=your_giphy_key_here
   PORT=3000
   ```

5. Save the file in the project folder as **`.env`** (make sure it is not `.env.txt`).

---

## 6. Run the server

1. In the project folder terminal, run:

   ```bash
   node server.js
   ```

2. The terminal will show a URL (for example: `http://192.168.0.122:3000`).

- If your partner is on the **same network** (same WIFI), open that URL and share it with them.

---

## 7. Share over the internet (if not on same network)

You have two main options:

### Option A – Visual Studio Code (easier to set up)

1. Install VS Code:  
   https://code.visualstudio.com/Download
2. Open VS Code, click **File > Open Folder…** and select the extracted project folder.
3. Press `Ctrl + ~` to open the terminal in VS Code (or use **View > Terminal**).
4. In VS Code, go to the **Ports** view
5. Make sure the server is running: `node server.js`.
6. Click **Forward a Port**, type `3000`, and confirm.
7. Wait for the forwarded URL to appear.
8. Right-click the URL → **Change Visibility to Public** → **Continue**.
9. Copy the public URL and share it with your partner (ask them to click continue after opening).

### Option B – Tailscale (more secure, more setup)

1. Install Tailscale:  
   https://tailscale.com/download
2. Sign in and connect both you and your partner to the same Tailscale network.
3. Use the URL from `node server.js`, but with your Tailscale IP or hostname, and share it with your partner.

---

## 8. Enjoy the movie date

1. You and your partner open the shared URL in a browser.
2. Enjoy watching the movie together.
