# Delivery checks

Passed:
- npm dependency installation and locked dependency resolution.
- Vite production build of the React frontend.
- Node syntax checks for all server modules and Vercel entry point.
- Import of the Vercel entry confirms it exports an Express application without opening a listener or requiring a database at module import.

Not verified:
- End-to-end database integration: attempted using temporary MongoDB 8.2 and 7.0; both failed to start in this execution environment with "open: Operation not permitted". Authentication, GridFS uploads/downloads, filtering and deletion therefore need runtime verification with your MongoDB/Atlas instance.
- Browser visual/accessibility checks.
- Live Vercel deployment or production routing.
- AdSense approval, ad delivery, revenue or regional consent behavior. No real publisher ID was supplied. Ads are disabled by default.

## Smoke test after connecting Atlas
1. Start the app and open /api/health; expect {"status":"ok"}.
2. Sign in with your configured admin credentials. A wrong password must fail.
3. Upload a small landscape PNG in Nature; expect a card and WebP preview.
4. Search its title/tag, then switch Desktop/Mobile and verify matching dimensions.
5. Download it; verify the WebP opens and the download count increases after refreshing the collection.
6. Sign out; an upload request without an admin token must return 401.
7. Sign in and delete the test image; verify its preview and download return 404.
8. Repeat after Vercel deployment and after another deployment, confirming uploaded files persist.
9. Check About/Privacy/Terms/Contact pages and ads.txt (after adding your real file).
