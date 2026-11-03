# ✦ Constellation Lyrics for Spicetify

> **Real-time, word-by-word synced starlight constellation lyrics & kinetic typography for Spotify.**

<div align="center">
  <img src="https://raw.githubusercontent.com/Deepesh2606/Constellation-lyrics/main/CustomApps/constellation/manifest.json" width="0" height="0" />
</div>

**Constellation** transforms Spotify's lyrics into an organic, interactive cosmic starlight journey. Words are plotted as celestial constellations with dynamic orbital tracking, real-time audio sync calibration, ambient album artwork aura backdrops, and an editorial Kinetic Typography mode.

---

## ✨ Highlights & Features

- **✦ Constellation Mode**: Words appear as celestial nodes linked by starlight paths. The active word is tracked by custom target beacons (Reticle, Stellar, Orbit, Minimal) with smooth camera motion.
- **💫 Popped Stream-End Words**: The concluding word of every lyric phrase expands with an elastic spring pop animation and dashed halo ring, anchoring the constellation structure.
- **⚡ Kinetic Typography Mode**: Switch between cosmic mode and modern dynamic typographic posters featuring 3D perspective warp, Y2K chrome, editorial serif, or retro CRT aesthetics.
- **👁 Spicy Lyrics-Style Studio**: Intuitive 2-column settings with live eye preview (`👁`), allowing you to inspect changes against playing lyrics in real time.
- **🌍 Universal Lyrics Coverage**: Multi-tiered fallback engine:
  1. Spotify Official Client Lyrics (`CosmosAsync` color-lyrics)
  2. Netease Cloud Music (synced international & Asian catalog)
  3. LRCLIB with smart primary-artist matching & zero rate-limiting
  4. Kugou provider fallback (Bollywood, Asian, Western)
- **🎨 Dynamic Cosmic Atmosphere**:
  - Dynamic album art palette extraction (adapts starlight colors to current track)
  - Ambient breathing blurred artwork backdrop
  - Flowing Northern Lights Aurora Borealis
  - Periodic shooting star meteors & supernova spark shockwaves
- **⏱ Audio Sync Calibration**: Fine-tune latency (-1500ms to +1500ms) with ±50ms step controls to eliminate Bluetooth speaker delay.
- **🗺 Song Section Minimap**: Clickable Verse, Chorus, Bridge, and Outro markers docked directly above the player bar.

---

## 🚀 Installation

### Prerequisites
Make sure you have [Spicetify](https://spicetify.app/) installed and working:
```bash
spicetify --version
```

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Deepesh2606/Constellation-lyrics.git
cd Constellation-lyrics
```

---

### Step 2: Link to Spicetify CustomApps

#### macOS / Linux
```bash
# Create CustomApps folder if it does not exist
mkdir -p "$(dirname "$(spicetify -c)")/CustomApps"

# Create symbolic link
ln -sf "$(pwd)/CustomApps/constellation" "$(dirname "$(spicetify -c)")/CustomApps/constellation"
```

#### Windows (PowerShell as Administrator)
```powershell
$spicetifyDir = Split-Path (spicetify -c)
$target = Join-Path (Get-Location) "CustomApps\constellation"
$link = Join-Path $spicetifyDir "CustomApps\constellation"

New-Item -ItemType SymbolicLink -Path $link -Target $target -Force
```

---

### Step 3: Enable and Apply in Spicetify
```bash
spicetify config custom_apps constellation
spicetify apply
```

Open Spotify and click **Constellation** in the left navigation sidebar!

---

## 🎮 Controls & Shortcuts

| Action | Control / Shortcut |
| :--- | :--- |
| **Fullscreen** | Press `F` or click the fullscreen icon in the bottom HUD |
| **Close Settings / Exit Fullscreen** | Press `Esc` |
| **Switch View Mode** | Click `T Kinetic` or `✦ Constellation` in bottom HUD |
| **Open Settings Studio** | Click `⚙ Settings` in HUD |
| **Live Lyrics Eye Preview** | Click `👁` in Settings top-right to hide modal temporarily |
| **Seek to Word** | Click any lyric star or word directly on the canvas |
| **Close Constellation** | Click the `✕` button in bottom HUD or click the sidebar icon |
| **Pan & Inspect Cosmos** | Click and drag with mouse |
| **Recenter Camera** | Click the `🧭 Target` button in bottom HUD |

---

## 🌐 Showcase Landing Page & Live Simulator

Constellation includes a luxury dark/ambient showcase website inspired by [`trylumn.xyz`](https://www.trylumn.xyz). It features a Space Gray MacBook Pro mockup with seamless video playback, interactive live canvas fallback, bento feature grid, and instant 1-click install guides.

### Adding Your Screen Recording
1. Screenrecord Spotify running Constellation (e.g., using macOS `Cmd + Shift + 5` or OBS).
2. Save or copy the recorded `.mp4` into `public/demo.mp4`.
3. The showcase website will automatically detect and play your video inside the laptop mockup!
*(You can also drag-and-drop any video directly onto the website's mockup to preview it on the fly!)*

### Deploying to the Web (Free)
- **Vercel (1-Click)**: Run `npx vercel` in this repo folder, or connect your GitHub repository on [vercel.com](https://vercel.com).
- **GitHub Pages**: Build with `npm run build` and deploy the `dist/` directory.

---

## 🛠 Web Preview & Development

To run the standalone web preview:

```bash
# Install dependencies
npm install

# Run Vite development server
npm run dev

# Build production bundle
npm run build
```

---

## 📄 License

MIT License © [Deepesh](https://github.com/Deepesh2606)

*Special thanks to the [Spicetify](https://spicetify.app/) community, [LRCLIB](https://lrclib.net/), and [Spicy Lyrics](https://github.com/Spikerko/spicy-lyrics) for UI inspiration.*
