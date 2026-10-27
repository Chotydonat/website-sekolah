# Panduan Instalasi — Website Dayah Jeumala Amal + Dasbor Admin & PPDB

Arsitektur: **frontend statis** (GitHub Pages) + **backend Google Apps Script** (REST API JSON) + **Google Sheets** (database) + **Google Drive** (berkas).
Semua rahasia (Client ID, token Fonnte, sandi darurat, ID spreadsheet/folder) tersimpan di **Script Properties** — tidak ada di kode maupun di GitHub.

Urutan pengerjaan: **A. Backend → B. Google Login → C. Isi config.js → D. GitHub Pages → E. Fonnte → F. Data nyata**.

---

## A. Pasang Backend (Google Apps Script)

1. Buka <https://script.google.com> → **Proyek baru**. Beri nama "PPDB Hub".
2. Di **Setelan proyek (ikon roda gigi)** → centang **"Tampilkan file manifes appsscript.json di editor"**.
3. Buka `appsscript.json` → ganti isinya dengan berkas `appsscript.json` dari paket backend.
4. Buat 8 file skrip (Tambah file → Skrip), nama persis tanpa `.gs`, lalu tempel isinya:
   `Kode`, `PPDB`, `Konten`, `Notifikasi`, `CRM`, `DocEngine`, `QrLib`, `Migrasi`.
   (File bawaan `Code.gs` diganti/rename menjadi `Kode`.)
5. Pilih fungsi **`setupAppEnvironment`** → **Jalankan**. Setujui izin (klik *Lanjutan → Buka … (tidak aman)* → Izinkan; wajar untuk skrip pribadi).
6. Buka **Log eksekusi**. Catat dan **simpan di pengelola sandi**:
   - URL Spreadsheet & folder Drive yang dibuat,
   - **Username & sandi akses darurat** (hanya ditampilkan sekali!).
7. Setup membuat otomatis: seluruh sheet, folder Drive (Branding, Konten, Berkas_Pendaftar, Template_Dokumen, Dokumen_Terbit, Sementara), data **dummy** contoh, template pesan WA/Email, template dokumen Bukti Pendaftaran & Surat Keterangan Diterima, serta trigger 1 menit.
8. Tambahkan akun Google Anda sebagai superadmin: edit `tambahSuperadmin('email-anda@gmail.com')` lalu jalankan fungsi tersebut (atau tambahkan lewat sheet **Pengguna**).

> Ulang `setupAppEnvironment` aman: bila sudah pernah, ia hanya memperbaiki skema & trigger, tidak menggandakan data.

## B. Google Login (OAuth Client ID)

1. <https://console.cloud.google.com> → buat proyek → **APIs & Services → OAuth consent screen** (External, isi nama aplikasi & email).
2. **Credentials → Create credentials → OAuth client ID → Web application**.
3. **Authorized JavaScript origins**: `https://USERNAME.github.io` (hanya domain, tanpa path, tanpa `/` di akhir). Untuk uji lokal tambah `http://localhost:8787`.
4. Salin Client ID (`…apps.googleusercontent.com`). Di editor Apps Script jalankan:
   `aturGoogleClientId('SALIN-CLIENT-ID-DI-SINI')`.
5. Bila consent screen berstatus *Testing*, tambahkan email admin di **Test users** (atau *Publish app*).

## C. Deploy Web App & isi `config.js`

1. Apps Script → **Deploy → Deployment baru → Aplikasi web**:
   - Jalankan sebagai: **Saya**
   - Siapa yang memiliki akses: **Siapa saja**
2. Salin URL yang berakhiran `/exec`.
3. Buka `js/config.js` di folder frontend, ganti:
   ```js
   GAS_URL: 'https://script.google.com/macros/s/ID-DEPLOYMENT-ANDA/exec'
   ```
4. Setiap Anda mengubah kode backend: **Deploy → Kelola deployment → ✏️ → Versi baru → Deploy** (URL tetap sama).

## D. Deploy Frontend ke GitHub Pages (lewat terminal)

**Folder yang di-`git init` adalah folder `dayah-jeumala-amal` hasil ekstrak ZIP** — folder yang langsung berisi `index.html`, `admin.html`, `css/`, `js/`, `assets/`. Bukan folder induknya, dan bukan folder backend.

1. Pasang Git (<https://git-scm.com>), lalu:
   ```bash
   git config --global user.name "Nama Anda"
   git config --global user.email "email@akungithub.com"
   ```
2. Di github.com buat repository **Public** baru (mis. `website-sekolah`), **tanpa** README.
3. Masuk ke folder hasil ekstrak, lalu **verifikasi** `dir` (Windows) / `ls` (Mac/Linux) menampilkan `index.html` di daftar teratas. Jika yang terlihat folder `backend`/`frontend`, Anda satu level terlalu tinggi.
   ```bash
   cd "C:\path\ke\dayah-jeumala-amal"
   dir
   git init
   git add .
   git commit -m "Upload pertama"
   git branch -M main
   git remote add origin https://github.com/USERNAME/website-sekolah.git
   git push -u origin main
   ```
4. Saat diminta password → tempel **Personal Access Token** (GitHub → Settings → Developer settings → Tokens (classic) → scope `repo`). Saat menempel, layar tampak kosong — itu normal.
5. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `/ (root)` → Save, centang **Enforce HTTPS**.
6. Situs hidup di `https://USERNAME.github.io/website-sekolah/` (publik) dan `…/admin.html` (dasbor).
7. Update berikutnya: `git add .` → `git commit -m "pesan"` → `git push`, lalu Ctrl+Shift+R.

Pastikan **origin OAuth (langkah B3)** sama dengan domain GitHub Pages Anda.

## E. WhatsApp (Fonnte) & Email

1. Daftar di <https://fonnte.com>, sambungkan nomor WA sekolah (scan QR), salin **token**.
2. Dasbor → **WhatsApp & Email** → tempel token → aktifkan saklar → **Cek Perangkat** → **Uji Kirim**. Token hanya tersimpan di Script Properties dan tampil ter-mask.
3. Email memakai akun Google pemilik skrip (kuota ±100/hari Gmail biasa, ±1.500 Workspace).
4. **Template Pesan**: ubah teks per kejadian; klik variabel untuk menyisipkan.
5. **Blast**: pilih sasaran dari CRM → tulis pesan → batch 10/20/50 → mulai. Server mengirim 1 batch/menit walau tab ditutup. Mulai dari batch 10 dengan jeda ≥5 detik untuk mengurangi risiko pemblokiran nomor.

## F. Mengganti Data Dummy dengan Data Asli

1. Edit semua konten di menu **Konten Website** (item yang Anda ubah otomatis dianggap data asli).
2. Atur **Pengaturan → Identitas** (nama, tagline, statistik, logo) dan **Periode PPDB**, **Form Builder** (Publish).
3. Setelah siap: **Pengaturan → Data Dummy → Hapus Semua Data Dummy** (ketik `HAPUS DUMMY`). Hanya baris bertanda dummy yang dihapus.

## G. Dokumen & Tanda Tangan

1. Desain template di Google Docs/Sheets/Slides dengan placeholder, mis. `{{NAMA_LENGKAP|kapital}}`, `{{NOMOR}}`, `{{TTD_1}}`, `{{NAMA_PEJABAT_1}}`, `{{QR}}`.
2. **Dokumen & TTD → Template → Tambah Template** → tempel URL → *Pindai* → atur kolom & slot TTD.
3. **Pejabat**: isi nama, jabatan, **email Google** (harus sama dengan akun login & terdaftar di Role & Pengguna). Pejabat membuat PIN 6 digit di **Persetujuan Saya**.
4. Dokumen terbit ber-QR; siapa pun dapat memeriksa keasliannya di `#/v/KODE` pada website publik (termasuk unggah PDF untuk cek hash).
5. **Generate Massal** memakai antrean latar belakang (±20 dokumen / 5 menit).

## H. Migrasi dari Spreadsheet Lama

**Pengaturan → Import / Migrasi** (superadmin): tempel URL spreadsheet lama (hanya dibaca) → **Pindai (dry-run)** → **Jalankan Import**. Aman diulang (tanpa baris ganda), cocokkan berdasarkan nama kolom. Ulangi tepat sebelum pindah (delta sync). Mode "Google Form lama" memetakan jawaban ke Pendaftar.

## I. Performa & Kuota

- Konten publik & data admin di-cache berversi; berubah otomatis saat ada edit. Edit langsung di Sheets → tekan ⟳ Segarkan di dasbor.
- Trigger 1 menit: mengirim antrean + memanaskan cache. Kuota trigger akun gratis ±90 menit/hari; matikan pemanasan dengan `matikanKeepWarm()` bila perlu (antrean notifikasi tetap jalan).
- Konsol browser: `Perf.summary()` untuk melihat waktu respons.

## J. Pemecahan Masalah

| Gejala | Penyebab / solusi |
|---|---|
| Halaman kosong/tidak bergaya | Struktur folder salah di repo; `css/` & `js/` harus ada di root repo. |
| Situs 404 | `git init` di folder induk. Push ulang dari folder yang berisi `index.html` (`git push -f`). |
| "Gagal terhubung ke server" | `GAS_URL` belum diisi / deployment bukan "Siapa saja" / belum deploy versi baru. |
| Tombol Google tidak muncul / `origin_mismatch` | Origin JavaScript di Cloud Console belum sama dengan domain Pages; Client ID belum diset. |
| Login Google "tidak terdaftar" | Email belum ada/nonaktif di sheet **Pengguna** → `tambahSuperadmin('email')`. |
| Terkunci | Gunakan akses darurat `admin.html#/darurat` (username/sandi dari log setup). |
| WA tidak terkirim | Token/perangkat Fonnte; lihat **Log Pengiriman** (galat per pesan, coba ulang otomatis 3×). |
| Dokumen gagal dibuat | Template belum dipindai / pejabat belum punya PIN / email pejabat tak cocok. |

## Batasan yang perlu diketahui

- Tanda tangan elektronik di sini bersifat **verifikasi internal (QR + hash + jejak audit), bukan TTE tersertifikasi** BSrE/PSrE.
- Sesi login tidak ikut migrasi; pengguna cukup login ulang.
- Beberapa domain Google Workspace memblokir berbagi file publik, sehingga gambar konten tidak tampil — minta admin Workspace mengizinkan.
- Apps Script memiliki batas eksekusi 6 menit dan kuota harian; aplikasi dirancang batch/antrean untuk menghindarinya, namun pendaftaran sangat besar (ribuan/hari) perlu dipantau.
- Pustaka diagram/ekspor Excel (SheetJS) dimuat dari cdnjs; bila diblokir, ekspor otomatis berformat CSV.
