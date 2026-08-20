
# Portal RT 09 - Vite Full Project - FINAL FIX

## Fix ENOENT package.json
ZIP ini sudah lengkap: package.json, vite.config.js, index.html, src/

## Cara jalan:
1. Extract ZIP ini, misal ke D:\portal-rt9-vite-full
2. Buka terminal di folder itu (bukan di dalam src)
3. npm install
4. npm run dev
5. Buka http://localhost:5173

## Login:
- daniel / 123456 -> Warga (personal Daniel G-12, Nama: Daniel tidak jadi - lagi)
- admin_rt / admin123 -> Admin

## Fix:
- Login simpan rt_nama, rt_blok, rt_username, rt_role
- Layout baca localStorage fallback Daniel G-12
- QRIS render via api.qrserver.com (img) anti MIME text/plain dan anti __cf_bm cookie
- Menu pakai React Router Link, bukan onclick manual

## Deploy ke InfinityFree:
1. Jalankan `npm run build`
2. Pastikan file `.htaccess` di dalam folder `dist/` ikut ter-upload.
3. Upload seluruh isi folder `dist/` (`index.html`, `assets/`, dan `.htaccess`) ke dalam folder `htdocs/` di InfinityFree File Manager / FTP.
4. Refresh pada route seperti `/dashboard` atau `/warga` tidak akan mengalami error 404 lagi.
