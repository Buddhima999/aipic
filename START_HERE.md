# Start AIpiC in 6 steps

1. Extract this ZIP and open the AIpiC folder in VS Code.
2. Install Node.js 22.12+ and have MongoDB running, or create MongoDB Atlas.
3. Open VS Code Terminal, run `npm install`, then `Copy-Item server/.env.example server/.env` (Windows PowerShell).
4. Open server/.env. Enter your MongoDB URI, admin email, strong admin password, and random JWT secret. README.md explains each setting.
5. Run `npm run seed` for sample images, then `npm run dev`.
6. Open http://localhost:5173. Use Admin studio to upload your own wallpapers.

Read README.md for the full Vercel and AdSense setup. Ads are disabled until you add approved AdSense credentials and configure the required consent flow. Replace the draft information pages and demo images before launching publicly.

Stack: MongoDB + Express + React + Node.js. Files persist in MongoDB GridFS, including on Vercel. Upload size limit: 4 MB.
