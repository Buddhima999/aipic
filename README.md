# AIpiC — MERN wallpaper library

A complete local starter project. Visitors browse categories, search titles/tags, filter mobile or desktop wallpapers, sort by downloads, open a preview, and download WebP images. Admins sign in, upload, and delete images. MongoDB stores metadata; files and thumbnails are stored in MongoDB GridFS. No paid service is required for local development.

## Requirements
- Node.js 22.12 or newer (Node 24 LTS recommended).
- MongoDB Community running locally, or a MongoDB Atlas connection string.
- npm and two terminals if running frontend and backend separately.

## Start on Windows (PowerShell)
1. Extract this ZIP. Open a terminal in the AIpiC folder containing package.json.
2. Install dependencies:
   ```powershell
   npm install
   Copy-Item server/.env.example server/.env
   ```
3. Edit `server/.env`. Set your admin email, an admin password of at least 12 characters, and a unique JWT secret of at least 32 characters. Generate a secret with:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   Paste its output as JWT_SECRET. Never commit the .env file.
4. Start MongoDB. Local URI: `mongodb://127.0.0.1:27017/aipic`. For Atlas, replace MONGO_URI with your own connection string; allow your client IP and escape special characters in the database password.
5. Optional: add eight original gradient wallpapers:
   ```powershell
   npm run seed
   ```
6. Start the app:
   ```powershell
   npm run dev
   ```
7. Open http://localhost:5173. API runs on http://localhost:5000.
8. Click Admin studio, sign in using server/.env credentials, and upload an image. The first successful login with your configured credentials creates your admin account. Changing the env password afterward does NOT reset the stored account. Use a new admin email to create a separate account; a password recovery flow is not included.

## How to use
- Select a category or enter a search and press Search.
- Desktop means width >= height; Mobile means height > width.
- Click a card, then Download wallpaper. Downloads preserve resolution, convert to WebP at quality 92 (converted output must fit 4 MB), and strip input metadata. They are not the original file bytes.
- Admin tokens live only in React memory, expire after two hours, and disappear on refresh.
- To delete: sign in, switch to Explore, open the image, click Delete image, confirm.
- The seed is safe to rerun; it skips existing demo records. Its category art is abstract placeholder content, not category-specific photographs. No external photos are bundled.

## Project structure
```
AIpiC/
  client/
    src/main.jsx       React interface
    src/style.css      Responsive styling
    vite.config.js     Development API proxy
  server/
    src/index.js       Express API, authentication, uploads, downloads
    src/models.js      MongoDB image and admin models
    src/config.js      Environment and category definitions
    src/seed.js        Original demo artwork
    .env.example       Configuration template
  package.json         Workspace commands
```

## API
| Method | Path | Purpose |
| --- | --- | --- |
| GET | /api/health | Health check |
| GET | /api/categories | Categories |
| GET | /api/images?q=&category=&orientation=&sort=&page= | Paginated library |
| GET | /api/images/:id/download | Attachment download |
| POST | /api/auth/login | Admin email/password to JWT |
| POST | /api/images | Admin multipart upload (image,title,category,tags,description) |
| DELETE | /api/images/:id | Admin deletion |

Admin requests use Authorization: Bearer <token>. Categories are edited in server/src/config.js; renaming an existing category also requires migrating stored records.

## Production build
```
npm run build
```
Set NODE_ENV=production in server/.env, then `npm start`. Express serves the built frontend and API together on port 5000. Set CLIENT_ORIGIN to the real HTTPS domain. Use HTTPS through your hosting platform or reverse proxy. With multiple proxy hops configure Express trust proxy specifically for your trusted infrastructure before using rate limiting; do not blindly trust every proxy.

This starter is not deployed. Files persist in MongoDB GridFS, including on Vercel. Each upload and converted download is limited to 4 MB to stay below Vercel function payload limits. Back up MongoDB, including the GridFS collections. For larger usage move uploads to object storage with a CDN, add distributed rate limiting, monitoring, upload quotas, and a real admin account management/password recovery flow. The current download counter counts accepted download requests, not unique people, and can be inflated. There is no visitor registration or AI image generation.

## Troubleshooting
- ECONNREFUSED / MongoDB: start MongoDB or correct MONGO_URI.
- Network error: confirm the server started and port 5000 is available.
- Unauthorized upload: sign in again; tokens expire after two hours.
- Upload rejected: use valid JPG/PNG/WebP, <=4 MB and <=40 megapixels.
- Empty gallery: run npm run seed or upload your own images.
- Port conflict: stop the other process; if changing the API port also change both proxy targets in client/vite.config.js.

## Validation
See VALIDATION.md for checks performed on the delivered project.

## Reference documentation
- https://expressjs.com/en/guide/migrating-5/
- https://vite.dev/guide/


## Deploy the MERN project to Vercel
1. Create MongoDB Atlas database and database user. Copy the connection string. Configure network access to allow your deployment to connect; restrict it when your hosting supports fixed outbound IPs. Do not use your Atlas account password as the database password.
2. Push the AIpiC folder contents to a GitHub repository. Keep .env files out of Git.
3. In Vercel, import the repository. Choose **Other** as framework preset, root directory containing package.json, install command `npm install`, build command `npm run build`, output directory `client/dist`. The included vercel.json routes API and image requests to Express.
4. Add environment variables MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, CLIENT_ORIGIN (your final HTTPS URL), and NODE_ENV=production. Vercel sets VERCEL automatically. The API exports Express; it does not start a listening server on Vercel.
5. Deploy. Update CLIENT_ORIGIN if the final domain differs, then redeploy.
6. Check /api/health, browse the homepage, sign in and upload a small real wallpaper. Verify preview, download and deletion.
7. To seed Atlas locally, use the same Atlas MONGO_URI in server/.env and run npm run seed. Seeding is optional; replace demo artwork before applying to AdSense.

Images use MongoDB GridFS instead of writing to Vercel’s temporary filesystem. The API accepts up to 4 MiB input and output per image. Very large 4K wallpapers must be compressed to fit, or use direct-to-object-storage uploads in a future version. GridFS bandwidth and storage count against Atlas limits. A larger wallpaper catalogue is better served by object storage/CDN.

## Google AdSense setup and earning
This project includes an optional responsive ad placement between the hero and collection. There are no forced ads, countdowns, rewards, or ads beside the download button. Revenue and approval are not guaranteed. Standard AdSense is not a pay-per-video-view programme: it earns from eligible advertising activity based on your traffic and ads.

Before applying, replace the demo artwork with original/licensed images and write useful original descriptions. Finish About, Contact, Terms and Privacy pages (the included pages are clearly marked drafts). Add real contact details and an explicit image license. A thin gallery of copied pictures may not qualify for approval.

1. Publish the finished website and add it to your AdSense account.
2. Copy your actual publisher ID. For ownership verification add Google's provided account meta tag to client/index.html, or use the verification method Google offers. Example: `<meta name="google-adsense-account" content="ca-pub-YOUR_REAL_ID">`. Redeploy.
3. Complete Google's site review. Create a Display ad unit and copy its numeric slot ID.
4. Configure the required consent message/CMP before serving ads. Where required by Google, use a Google-certified CMP, for example AdSense Privacy & messaging. This starter has no custom CMP. Validate consent behavior in relevant regions before enabling ads.
5. In Vercel set VITE_ADSENSE_CLIENT to your actual `ca-pub-...`, VITE_ADSENSE_SLOT to your ad unit ID, and VITE_ADSENSE_ENABLED=true only after approval and consent configuration. Redeploy (VITE variables are public build-time values).
6. Add client/public/ads.txt using the exact line AdSense gives you. Redeploy and verify https://your-domain/ads.txt. Do not invent a publisher ID.
7. Do not click your own ads or ask visitors to click/watch ads for downloads. Do not buy bot traffic or promise rewards. Keep downloads independent of ads.
8. Read Vercel's plan terms before monetizing. Hobby is intended for personal non-commercial use; use a plan that permits your commercial website. Hosting, Atlas and bandwidth may have costs.

Google references:
- https://support.google.com/adsense/answer/48182
- https://support.google.com/adsense/answer/7299563
- https://support.google.com/adsense/answer/7584263
Vercel references:
- https://vercel.com/docs/errors/function_payload_too_large
- https://vercel.com/docs/frameworks/backend/express

## Known limits
AdSense review, publisher IDs, consent configuration and legal/contact page completion must be done by the site owner. The site has not been deployed or approved. Rate limiting is per function instance and should be replaced with a shared store at scale. Downloads buffer files in memory (capped at 4 MB). Large collections should use CDN-backed object storage. Express CSP is disabled for ad compatibility; review a precise CSP for your chosen ad/CMP providers before launch. Image details currently open in a modal, not separate indexable detail pages; adding original editorial category/detail pages would improve discovery.
