/* =====================================================================
   admin-modul.js — Konten (CRUD), Notifikasi (WA/Email, Template, Log, Blast),
   CRM Kontak, Dokumen & TTD (Doc Engine), Persetujuan, Pengaturan, Role & Pengguna
   ===================================================================== */
(function () {
  'use strict';
  var A = window.App, Admin = window.Admin, icon = A.icon, esc = A.esc, qs = A.qs, qsa = A.qsa, Api = A.Api;

  /* =================== KONTEN =================== */
  var TINGKAT = ['Kabupaten', 'Kota', 'Provinsi', 'Nasional', 'Internasional'];
  var KONTEN = {
    Hero: { judul: 'Hero / Slider', sub: 'Slide utama di bagian atas landing page.', kol: [['judul', 'Judul'], ['cta_label', 'Tombol']], img: true,
      f: [{ k: 'judul', l: 'Judul besar', req: 1, span: 1, max: 150 }, { k: 'subjudul', l: 'Subjudul', t: 'textarea', rows: 3 }, { k: 'cta_label', l: 'Label tombol', ph: 'Jelajahi Sekolah' },
          { k: 'cta_link', l: 'Tautan tombol', ph: '#profil atau #/daftar', help: 'Gunakan <span class="kbd">#/daftar</span> untuk formulir, <span class="kbd">#profil</span> untuk section.' }, { k: 'gambar_id', l: 'Gambar (opsional — kosong = logo)', t: 'image' }, { k: 'aktif', l: 'Tampil', t: 'switch' }] },
    Keunggulan: { judul: 'Keunggulan', sub: 'Strip 5 poin keunggulan di bawah hero.', kol: [['judul', 'Judul'], ['deskripsi', 'Deskripsi']], ikon: true,
      f: [{ k: 'judul', l: 'Judul', req: 1, max: 80 }, { k: 'deskripsi', l: 'Deskripsi singkat', max: 200 }, { k: 'ikon', l: 'Ikon', t: 'icon' }, { k: 'aktif', l: 'Tampil', t: 'switch' }] },
    Profil: { judul: 'Profil Sekolah', sub: 'Blok profil. Blok pertama memuat Visi & Misi dan tampil di beranda.', kol: [['judul', 'Judul']], img: true,
      f: [{ k: 'judul', l: 'Judul blok', req: 1, span: 1 }, { k: 'isi', l: 'Isi', t: 'rich' }, { k: 'visi', l: 'Visi (blok pertama)', t: 'textarea', rows: 2 }, { k: 'misi', l: 'Misi (satu per baris)', t: 'textarea', rows: 5 }, { k: 'gambar_id', l: 'Gambar', t: 'image' }, { k: 'aktif', l: 'Tampil', t: 'switch' }] },
    Prestasi: { judul: 'Prestasi', sub: 'Capaian santri/siswa.', kol: [['judul', 'Prestasi'], ['tingkat', 'Tingkat'], ['tahun', 'Tahun']], img: true,
      f: [{ k: 'judul', l: 'Judul prestasi', req: 1, span: 1 }, { k: 'tingkat', l: 'Tingkat', t: 'select', opts: TINGKAT }, { k: 'tahun', l: 'Tahun', ph: String(new Date().getFullYear()), max: 4 }, { k: 'deskripsi', l: 'Deskripsi', t: 'textarea', rows: 3 }, { k: 'gambar_id', l: 'Foto', t: 'image' }, { k: 'aktif', l: 'Tampil', t: 'switch' }] },
    Fasilitas: { judul: 'Fasilitas', sub: 'Sarana penunjang yang tampil di landing page.', kol: [['nama', 'Nama'], ['deskripsi', 'Deskripsi']], img: true, ikon: true,
      f: [{ k: 'nama', l: 'Nama fasilitas', req: 1 }, { k: 'deskripsi', l: 'Deskripsi singkat', max: 300 }, { k: 'ikon', l: 'Ikon', t: 'icon' }, { k: 'gambar_id', l: 'Foto (opsional — menggantikan ikon)', t: 'image' }, { k: 'aktif', l: 'Tampil', t: 'switch' }] },
    Berita: { judul: 'Berita', sub: 'Artikel & pengumuman. Status "draf" tidak tampil di website.', kol: [['judul', 'Judul'], ['kategori', 'Kategori'], ['tanggal', 'Tanggal'], ['status', 'Status']], img: true, noSort: true,
      f: [{ k: 'judul', l: 'Judul', req: 1, span: 1 }, { k: 'kategori', l: 'Kategori', ph: 'PPDB / Prestasi / Kegiatan' }, { k: 'tanggal', l: 'Tanggal', t: 'date' }, { k: 'ringkasan', l: 'Ringkasan', t: 'textarea', rows: 2, req: 1 },
          { k: 'isi', l: 'Isi berita', t: 'rich' }, { k: 'gambar_id', l: 'Gambar sampul', t: 'image' }, { k: 'status', l: 'Status', t: 'select', opts: [{ v: 'terbit', l: 'Terbit' }, { v: 'draf', l: 'Draf' }] }, { k: 'penulis', l: 'Penulis' }, { k: 'slug', l: 'Slug URL (opsional)', help: 'Otomatis dari judul bila kosong.' }] },
    Kegiatan: { judul: 'Kegiatan', sub: 'Galeri kegiatan (5 terbaru tampil di beranda).', kol: [['nama', 'Kegiatan'], ['tanggal', 'Tanggal']], img: true,
      f: [{ k: 'nama', l: 'Nama kegiatan', req: 1 }, { k: 'tanggal', l: 'Tanggal', t: 'date' }, { k: 'deskripsi', l: 'Deskripsi', t: 'textarea', rows: 3 }, { k: 'gambar_id', l: 'Foto', t: 'image' }, { k: 'aktif', l: 'Tampil', t: 'switch' }] },
    Biaya: { judul: 'Biaya Pendidikan', sub: 'Rincian biaya per jenjang (format Rupiah otomatis).', kol: [['jenjang', 'Jenjang'], ['komponen', 'Komponen'], ['nominal', 'Nominal']],
      f: [{ k: 'jenjang', l: 'Jenjang / kategori', req: 1 }, { k: 'komponen', l: 'Komponen biaya', req: 1 }, { k: 'nominal', l: 'Nominal (Rp)', t: 'number' }, { k: 'keterangan', l: 'Keterangan' }, { k: 'aktif', l: 'Tampil', t: 'switch' }] },
    Kontak: { judul: 'Kontak & Peta', sub: 'Informasi kontak, tombol WhatsApp, dan peta Google Maps.', single: true,
      f: [{ k: 'alamat', l: 'Alamat', t: 'textarea', rows: 2 }, { k: 'telepon', l: 'Telepon' }, { k: 'whatsapp', l: 'Nomor WhatsApp', ph: '08xxxxxxxxxx' }, { k: 'email', l: 'Email', t: 'email' }, { k: 'jam_layanan', l: 'Jam layanan' },
          { k: 'lat', l: 'Latitude', ph: '5.2468' }, { k: 'lng', l: 'Longitude', ph: '96.0700' },
          { k: 'maps_embed', l: 'Kode sematan Google Maps', t: 'textarea', rows: 3, help: 'Google Maps → Bagikan → Sematkan peta → Salin HTML, lalu tempel di sini.' },
          { k: 'instagram', l: 'Instagram (URL)' }, { k: 'facebook', l: 'Facebook (URL)' }, { k: 'youtube', l: 'YouTube (URL)' }, { k: 'tiktok', l: 'TikTok (URL)' }] }
  };
  Admin.page('konten', {
    roles: Admin.SA,
    render: function (view, r) {
      var sec = r.seg[1] || 'Hero', K = KONTEN[sec];
      if (!K) { Admin.go('konten/Hero'); return; }
      var st = { q: '', tampil: '', data: '' }, rows = [];
      view.innerHTML = Admin.head(K.judul, K.sub, (K.single ? '' : '<a class="btn btn-sm btn-light" href="index.html' + (sec === 'Berita' ? '#/berita' : '#' + sec.toLowerCase()) + '" target="_blank" rel="noopener">' + icon('external', 'ico-sm') + 'Pratinjau di Website</a><button class="btn btn-sm" id="kNew">' + icon('plus', 'ico-sm') + 'Tambah</button>')) + '<div id="kBody">' + Admin.skel(5, 56) + '</div>';
      function muat() { Admin.load('konten.list', { section: sec }, function (d) { rows = d.rows; draw(); }).catch(function (e) { Admin.fail(qs('#kBody'), e, muat); }); }
      function draw() {
        if (!qs('#kBody')) return;
        if (K.single) return drawSingle();
        var list = rows.filter(function (x) {
          if (st.tampil === 'ya' && x.aktif === false) return false; if (st.tampil === 'tidak' && x.aktif !== false) return false;
          if (st.data === 'dummy' && !x.is_dummy) return false; if (st.data === 'asli' && x.is_dummy) return false;
          if (st.q && JSON.stringify(x).toLowerCase().indexOf(st.q) < 0) return false; return true;
        });
        qs('#kBody').innerHTML = '<div class="card"><div class="filters"><label class="search">' + icon('search') + '<input class="input" id="kq" type="search" placeholder="Cari…" value="' + esc(st.q) + '"></label>' +
          (sec !== 'Berita' ? '<select class="select" id="kt"><option value="">Semua status</option><option value="ya"' + (st.tampil === 'ya' ? ' selected' : '') + '>Tampil</option><option value="tidak"' + (st.tampil === 'tidak' ? ' selected' : '') + '>Disembunyikan</option></select>' : '') +
          '<select class="select" id="kd"><option value="">Semua data</option><option value="asli"' + (st.data === 'asli' ? ' selected' : '') + '>Data asli</option><option value="dummy"' + (st.data === 'dummy' ? ' selected' : '') + '>Data dummy</option></select></div>' +
          (!K.noSort && !st.q ? '<p class="help" style="padding:10px 16px 0;margin:0">' + icon('grip', 'ico-sm') + ' Seret baris untuk mengubah urutan tampil.</p>' : '') +
          (list.length ? '<div class="table-wrap"><table class="table" id="kTbl"><thead><tr>' + (K.noSort ? '' : '<th style="width:40px"></th>') + (K.img || K.ikon ? '<th style="width:70px"></th>' : '') + K.kol.map(function (c) { return '<th' + (c[0] === 'nominal' ? ' class="num"' : '') + '>' + c[1] + '</th>'; }).join('') + (sec !== 'Berita' ? '<th>Tampil</th>' : '') + '<th></th></tr></thead><tbody>' +
            list.map(function (x) {
              var media = K.img ? (x.gambar_id ? A.media(x.gambar_id, 'image', 200, '', 'tthumb') : (K.ikon ? '<span class="ini">' + icon(x.ikon || 'star', 'ico-sm') + '</span>' : '<div class="thumb pattern tthumb"><div class="ph">' + icon('image') + '</div></div>')) : K.ikon ? '<span class="ini">' + icon(x.ikon || 'star', 'ico-sm') + '</span>' : '';
              return '<tr data-id="' + esc(x.id) + '">' + (K.noSort ? '' : '<td><span class="drag-h" aria-label="Seret">' + icon('grip') + '</span></td>') + (K.img || K.ikon ? '<td>' + media + '</td>' : '') +
                K.kol.map(function (c, i) {
                  var v = x[c[0]];
                  if (c[0] === 'nominal') return '<td class="num">' + A.rp(v) + '</td>';
                  if (c[0] === 'tanggal') return '<td>' + esc(A.tgl(v, true)) + '</td>';
                  if (c[0] === 'status') return '<td><span class="badge ' + (v === 'draf' ? 'b-warn' : 'b-ok') + '">' + esc(v === 'draf' ? 'Draf' : 'Terbit') + '</span></td>';
                  if (c[0] === 'tingkat') return '<td><span class="badge b-brand no-dot">' + esc(v || '-') + '</span></td>';
                  return '<td>' + (i === 0 ? '<b>' + esc(v) + '</b>' + (x.is_dummy ? ' <span class="badge no-dot" style="font-size:10px">DUMMY</span>' : '') : '<span class="muted">' + esc(String(v || '').substring(0, 90)) + '</span>') + '</td>';
                }).join('') +
                (sec !== 'Berita' ? '<td><label class="switch"><input type="checkbox" data-tog="' + esc(x.id) + '"' + (x.aktif === false ? '' : ' checked') + ' aria-label="Tampilkan"><span class="track"></span></label></td>' : '') +
                '<td class="row-act"><button class="btn btn-ghost btn-icon btn-sm" data-ed="' + esc(x.id) + '" aria-label="Ubah">' + icon('edit') + '</button><button class="btn btn-ghost btn-icon btn-sm" data-del="' + esc(x.id) + '" aria-label="Hapus">' + icon('trash') + '</button></td></tr>';
            }).join('') + '</tbody></table></div>' : Admin.empty('inbox', 'Belum ada ' + K.judul.toLowerCase(), 'Klik Tambah untuk membuat item pertama.', '<button class="btn btn-sm" onclick="document.getElementById(\'kNew\').click()">' + icon('plus', 'ico-sm') + 'Tambah</button>')) + '</div>';
        qs('#kq').addEventListener('input', A.debounce(function (e) { st.q = e.target.value.toLowerCase(); draw(); setTimeout(function () { var q = qs('#kq'); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }, 0); }, 300));
        var kt = qs('#kt'); if (kt) kt.onchange = function (e) { st.tampil = e.target.value; draw(); };
        qs('#kd').onchange = function (e) { st.data = e.target.value; draw(); };
        qsa('[data-ed]').forEach(function (b) { b.onclick = function () { form(rows.filter(function (x) { return x.id === b.dataset.ed; })[0]); }; });
        qsa('[data-del]').forEach(function (b) {
          b.onclick = function () {
            var x = rows.filter(function (y) { return y.id === b.dataset.del; })[0];
            A.confirmDlg({ title: 'Hapus item?', danger: true, html: 'Hapus <b>' + esc(x.judul || x.nama || x.komponen) + '</b>? Tindakan ini tidak dapat dibatalkan.', ok: 'Hapus' }).then(function (y) { if (y) Admin.call('konten.delete', { section: sec, ids: [x.id] }).then(muat).catch(function () {}); });
          };
        });
        qsa('[data-tog]').forEach(function (c) {
          c.onchange = function () { var x = rows.filter(function (y) { return y.id === c.dataset.tog; })[0]; x.aktif = c.checked; Admin.call('konten.save', { section: sec, item: x }, { toast: false }).then(function () { A.toast(c.checked ? 'Ditampilkan di website.' : 'Disembunyikan dari website.', 'ok'); }).catch(function () { c.checked = !c.checked; }); };
        });
        var tb = qs('#kTbl tbody');
        if (tb && !K.noSort) Admin.sortable(tb, 'tr', function (trs) {
          var ids = trs.map(function (t) { return t.dataset.id; });
          rows.sort(function (a, b) { return ids.indexOf(a.id) - ids.indexOf(b.id); });
          Admin.call('konten.reorder', { section: sec, ids: ids }, { toast: false }).then(function () { A.toast('Urutan tersimpan.', 'ok'); }).catch(muat);
        });
      }
      function drawSingle() {
        var x = rows[0] || {};
        qs('#kBody').innerHTML = '<div class="split"><div class="card card-pad" id="kf">' + Admin.formHtml(K.f, x) + '<div style="display:flex;justify-content:flex-end;margin-top:6px"><button class="btn" id="kSave">' + icon('save') + 'Simpan Kontak</button></div></div>' +
          '<div class="card sticky"><div class="card-h"><h3>' + icon('map-pin', 'ico-sm') + 'Pratinjau Peta</h3></div><div class="card-b">' + (x.maps_embed ? '<iframe src="' + esc(x.maps_embed) + '" style="width:100%;height:320px;border:0;border-radius:12px" loading="lazy" title="Peta"></iframe>' : Admin.empty('map-pin', 'Belum ada peta', 'Tempel kode sematan Google Maps.')) + '</div></div></div>';
        var get = Admin.formBind(qs('#kf'), K.f, x);
        qs('#kSave').onclick = function () { var o = get(); o.id = x.id; Admin.call('konten.save', { section: sec, item: o }, { btn: this }).then(muat).catch(function () {}); };
      }
      function form(x) {
        var baru = !x; x = x || { aktif: true, status: 'terbit', tanggal: new Date().toISOString().slice(0, 10) };
        var m = A.modal({ title: (baru ? 'Tambah ' : 'Ubah ') + K.judul, drawer: true, body: (x.is_dummy ? '<div class="info-strip warn">' + icon('info') + '<div>Item ini data dummy. Setelah disimpan, item dianggap <b>data asli</b> dan tidak ikut terhapus saat "Hapus Data Dummy".</div></div>' : '') + Admin.formHtml(K.f, x),
          foot: '<button class="btn btn-light" data-close>Batal</button><button class="btn" id="kfSave">' + icon('save') + 'Simpan</button>' });
        var get = Admin.formBind(m.el, K.f, x);
        qs('#kfSave', m.el).onclick = function () {
          var o = get(); o.id = x.id;
          var kurang = K.f.filter(function (f) { return f.req && !String(o[f.k] || '').replace(/<[^>]*>/g, '').trim(); });
          if (kurang.length) { A.toast(kurang[0].l + ' wajib diisi.', 'warn'); return; }
          Admin.call('konten.save', { section: sec, item: o }, { btn: this }).then(function () { m.close(); muat(); }).catch(function () {});
        };
      }
      var nb = qs('#kNew'); if (nb) nb.onclick = function () { form(null); };
      muat();
    }
  });

  /* =================== NOTIFIKASI: WA & EMAIL =================== */
  Admin.page('notifikasi', {
    roles: Admin.SA,
    render: function (view) {
      view.innerHTML = Admin.head('WhatsApp & Email', 'Konfigurasi gateway Fonnte, email, dan uji kirim. Token disimpan di Script Properties dan tidak pernah ditampilkan utuh.') + '<div id="nb">' + Admin.skel(4, 80) + '</div>';
      function muat() { Api.post('notif.config', {}).then(function (r) { draw(r.data); }).catch(function (e) { Admin.fail(qs('#nb'), e, muat); }); }
      function draw(c) {
        if (!qs('#nb')) return;
        qs('#nb').innerHTML = (c.antrean ? '<div class="info-strip warn">' + icon('clock') + '<div>Ada notifikasi di antrean. <button class="btn btn-xs btn-light" id="nProc">Proses sekarang</button></div></div>' : '') +
          (!c.trigger ? '<div class="info-strip bad">' + icon('alert-triangle') + '<div>Trigger pengirim belum aktif. Jalankan <span class="kbd">installTriggers()</span> atau <span class="kbd">setupAppEnvironment()</span> di editor Apps Script.</div></div>' : '') +
          '<div class="grid-dash" style="grid-template-columns:repeat(auto-fit,minmax(min(380px,100%),1fr))">' +
          '<div class="card"><div class="card-h"><h3>' + icon('whatsapp', 'ico-sm') + 'WhatsApp (Fonnte)</h3><span class="badge ' + (c.waAktif && c.adaToken ? 'b-ok' : '') + '">' + (c.waAktif && c.adaToken ? 'AKTIF' : 'NONAKTIF') + '</span></div><div class="card-b">' +
          '<div class="big-switch" style="margin-bottom:16px"><div class="t"><b>Notifikasi WhatsApp</b><span>Saklar utama semua pesan WA otomatis</span></div><label class="switch"><input type="checkbox" id="cWa"' + (c.waAktif ? ' checked' : '') + '><span class="track"></span></label></div>' +
          '<div class="field"><label for="cTok">Token Fonnte</label><input class="input mono" id="cTok" type="password" autocomplete="off" placeholder="' + esc(c.tokenMask || 'Belum diisi — tempel token dari fonnte.com') + '"><div class="help">Kosongkan bila tidak diubah. ' + (c.adaToken ? '<a href="javascript:void 0" id="cTokDel" style="color:var(--bad)">Hapus token</a>' : '') + '</div></div>' +
          '<div class="grid-2"><div class="field"><label for="cBatch">Ukuran batch blast</label><select class="select" id="cBatch">' + [10, 20, 50].map(function (n) { return '<option' + (n === c.batchDefault ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></div>' +
          '<div class="field"><label for="cJeda">Jeda antarpesan (detik)</label><input class="input" id="cJeda" value="' + esc(c.jeda) + '" placeholder="5 atau 3-8"></div></div>' +
          '<label class="switch" style="margin-bottom:16px"><input type="checkbox" id="cDet"' + (c.deteksiOtomatis ? ' checked' : '') + '><span class="track"></span><span>Deteksi otomatis nomor terdaftar WhatsApp</span></label>' +
          '<div class="sec-title">Uji coba</div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-sm btn-light" id="cDev">' + icon('smartphone', 'ico-sm') + 'Cek Perangkat</button><input class="input" id="cWaNo" placeholder="08xxxxxxxxxx" style="flex:1;min-width:150px;min-height:36px"><button class="btn btn-sm btn-light" id="cWaT">' + icon('send', 'ico-sm') + 'Uji Kirim WhatsApp</button></div><div id="cDevRes" style="margin-top:10px"></div></div></div>' +
          '<div class="card"><div class="card-h"><h3>' + icon('mail', 'ico-sm') + 'Email</h3><span class="badge ' + (c.emailAktif ? 'b-ok' : '') + '">' + (c.emailAktif ? 'AKTIF' : 'NONAKTIF') + '</span></div><div class="card-b">' +
          '<div class="big-switch" style="margin-bottom:16px"><div class="t"><b>Notifikasi Email</b><span>Dikirim dari akun Google pemilik Apps Script</span></div><label class="switch"><input type="checkbox" id="cEm"' + (c.emailAktif ? ' checked' : '') + '><span class="track"></span></label></div>' +
          '<div class="field"><label for="cName">Nama pengirim</label><input class="input" id="cName" value="' + esc(c.namaPengirim) + '"></div>' +
          '<dl class="dl" style="margin-bottom:16px"><dt>Sisa kuota email hari ini</dt><dd>' + (c.kuotaEmail >= 0 ? A.angka(c.kuotaEmail) : '—') + '</dd><dt>URL website (untuk tautan)</dt><dd style="font-size:12.5px">' + esc(c.appUrl || 'Terisi otomatis saat superadmin login dari GitHub Pages') + '</dd></dl>' +
          '<div class="sec-title">Uji coba</div><div style="display:flex;gap:8px;flex-wrap:wrap"><input class="input" id="cEmTo" type="email" placeholder="email@contoh.com" style="flex:1;min-width:180px;min-height:36px"><button class="btn btn-sm btn-light" id="cEmT">' + icon('send', 'ico-sm') + 'Uji Kirim Email</button></div>' +
          '<p class="help" style="margin-top:12px">Kuota Gmail biasa ±100 email/hari, Google Workspace ±1.500. Antrean otomatis mencoba ulang maks. 3×.</p></div></div></div>' +
          '<div style="display:flex;justify-content:flex-end;gap:8px"><a class="btn btn-light" href="#/template">' + icon('message') + 'Atur Template Pesan</a><button class="btn" id="cSave">' + icon('save') + 'Simpan Konfigurasi</button></div>';
        qs('#cSave').onclick = function () {
          Admin.call('notif.configSave', { waAktif: qs('#cWa').checked, emailAktif: qs('#cEm').checked, token: qs('#cTok').value.trim(), batchDefault: +qs('#cBatch').value, jeda: qs('#cJeda').value.trim(), deteksiOtomatis: qs('#cDet').checked, namaPengirim: qs('#cName').value }, { btn: this }).then(function (r) { draw(r.data); }).catch(function () {});
        };
        var del = qs('#cTokDel'); if (del) del.onclick = function () { A.confirmDlg({ title: 'Hapus token Fonnte?', danger: true, text: 'WhatsApp otomatis berhenti.', ok: 'Hapus' }).then(function (y) { if (y) Admin.call('notif.configSave', { waAktif: false, emailAktif: qs('#cEm').checked, token: '__HAPUS__', batchDefault: c.batchDefault, jeda: c.jeda, deteksiOtomatis: c.deteksiOtomatis }).then(function (r) { draw(r.data); }).catch(function () {}); }); };
        qs('#cDev').onclick = function () { var b = this; A.btnBusy(b, true); Api.post('wa.device', {}).then(function (r) { var d = r.data; qs('#cDevRes').innerHTML = '<div class="info-strip ' + (d.status === 'connect' ? 'ok' : 'warn') + '">' + icon('smartphone') + '<div>Perangkat <b>' + esc(d.device) + '</b> · ' + esc(d.status) + ' · paket ' + esc(d.paket || '-') + ' · kuota ' + esc(d.kuota || '-') + ' · aktif s/d ' + esc(d.kedaluwarsa || '-') + '</div></div>'; }).catch(function (e) { qs('#cDevRes').innerHTML = '<div class="info-strip bad">' + icon('alert-circle') + '<div>' + esc(e.message) + '</div></div>'; }).finally(function () { A.btnBusy(b, false); }); };
        qs('#cWaT').onclick = function () { Admin.call('wa.test', { nomor: qs('#cWaNo').value }, { btn: this }).catch(function () {}); };
        qs('#cEmT').onclick = function () { Admin.call('email.test', { email: qs('#cEmTo').value }, { btn: this }).catch(function () {}); };
        var pr = qs('#nProc'); if (pr) pr.onclick = function () { Admin.call('notif.processNow', {}, { btn: this }).then(muat).catch(function () {}); };
      }
      muat();
    }
  });

  /* =================== TEMPLATE PESAN =================== */
  Admin.page('template', {
    roles: Admin.SA,
    render: function (view) {
      var sel = null, data = null;
      view.innerHTML = Admin.head('Template Pesan', 'Teks email & WhatsApp otomatis per kejadian. Klik variabel untuk menyisipkan.') + '<div id="tb">' + Admin.skel(4, 70) + '</div>';
      function muat() { Api.post('notif.templates', {}).then(function (r) { data = r.data; if (!sel && data.rows.length) sel = data.rows[0].id; draw(); }).catch(function (e) { Admin.fail(qs('#tb'), e, muat); }); }
      function draw() {
        if (!qs('#tb')) return;
        var t = data.rows.filter(function (x) { return x.id === sel; })[0];
        var ev = {}; data.rows.forEach(function (x) { (ev[x.event] = ev[x.event] || []).push(x); });
        qs('#tb').innerHTML = '<div class="split tpl-split"><div class="card"><div class="card-b" style="padding:10px">' + Object.keys(ev).map(function (e) {
          return '<div class="sec-title" style="margin:10px 8px 6px">' + esc(data.events[e] || e) + '</div>' + ev[e].map(function (x) { return '<a class="nav-i ' + (x.id === sel ? 'active' : '') + '" href="javascript:void 0" data-s="' + esc(x.id) + '">' + icon(x.kanal === 'wa' ? 'whatsapp' : 'mail') + '<span>' + (x.kanal === 'wa' ? 'WhatsApp' : 'Email') + '</span><span class="badge ' + (x.aktif ? 'b-ok' : '') + '" style="margin-left:auto">' + (x.aktif ? 'Aktif' : 'Mati') + '</span></a>'; }).join('');
        }).join('') + '</div></div>' +
          '<div class="card"><div class="card-h"><h3>' + icon(t.kanal === 'wa' ? 'whatsapp' : 'mail', 'ico-sm') + esc(data.events[t.event] || t.event) + ' — ' + (t.kanal === 'wa' ? 'WhatsApp' : 'Email') + '</h3><label class="switch"><input type="checkbox" id="tAk"' + (t.aktif ? ' checked' : '') + '><span class="track"></span><span>Aktif</span></label></div><div class="card-b">' +
          (t.kanal !== 'wa' ? '<div class="field"><label for="tSub">Subjek email</label><input class="input" id="tSub" value="' + esc(t.subjek) + '"></div>' : '') +
          '<div class="field"><label for="tIsi">Isi pesan</label><div class="var-chips">' + data.vars.map(function (v) { return '<button type="button" data-v="{' + v + '}">{' + v + '}</button>'; }).join('') + '</div><textarea class="textarea mono" id="tIsi" rows="10" style="font-size:13.5px">' + esc(t.isi) + '</textarea><div class="help">Gunakan *teks* untuk huruf tebal.</div></div>' +
          '<div class="sec-title">Pratinjau (data contoh)</div><div id="tPrev"></div><div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn" id="tSave">' + icon('save') + 'Simpan Template</button></div></div></div></div>';
        qsa('[data-s]').forEach(function (a) { a.onclick = function () { sel = a.dataset.s; draw(); }; });
        var isi = qs('#tIsi');
        qsa('[data-v]').forEach(function (b) { b.onclick = function () { var s = isi.selectionStart, e = isi.selectionEnd; isi.value = isi.value.slice(0, s) + b.dataset.v + isi.value.slice(e); isi.focus(); isi.selectionStart = isi.selectionEnd = s + b.dataset.v.length; prev(); }; });
        function prev() {
          var c = { nama: 'Ahmad Fauzan', token: 'PPDB-27-7K3QX9', status: 'Diterima', catatan: 'Selamat bergabung!', periode: 'PPDB 2027/2028', jenjang: 'MTs', nama_sekolah: (Admin.settings && Admin.settings.nama_sekolah) || 'Sekolah', link_cek_status: 'https://…/#/status?t=PPDB-27-7K3QX9', tanggal: A.tgl(new Date()), pesan_tambahan: 'Mohon lengkapi berkas.' };
          var fill = function (s) { return String(s || '').replace(/\{(\w+)\}/g, function (m, k) { return c[k] == null ? m : c[k]; }); };
          var body = esc(fill(isi.value)).replace(/\*([^*\n]+)\*/g, '<b>$1</b>');
          qs('#tPrev').innerHTML = t.kanal === 'wa' ? '<div class="wa-bg"><div class="wa-bubble">' + body + '<span class="tm">' + new Date().toTimeString().slice(0, 5) + '</span></div></div>'
            : '<div class="email-prev"><div style="padding:10px 16px;border-bottom:1px solid #e3e8f0;font-size:13px"><b>Subjek:</b> ' + esc(fill(qs('#tSub').value)) + '</div><div class="eh">' + esc(c.nama_sekolah) + '</div><div class="eb">' + body + '</div></div>';
        }
        isi.oninput = prev; var ts = qs('#tSub'); if (ts) ts.oninput = prev; prev();
        qs('#tSave').onclick = function () { Admin.call('notif.templateSave', { id: t.id, subjek: ts ? ts.value : '', isi: isi.value, aktif: qs('#tAk').checked }, { btn: this }).then(muat).catch(function () {}); };
      }
      muat();
    }
  });

  /* =================== LOG PENGIRIMAN =================== */
  Admin.page('log', {
    roles: Admin.SA,
    render: function (view) {
      var st = { status: '', kanal: '', q: '' };
      view.innerHTML = Admin.head('Log Pengiriman', 'Antrean & riwayat notifikasi. Kegagalan dicoba ulang otomatis maks. 3 kali.', '<button class="btn btn-sm btn-light" id="lProc">' + icon('zap', 'ico-sm') + 'Proses Sekarang</button><button class="btn btn-sm btn-light" id="lRetry">' + icon('refresh', 'ico-sm') + 'Ulangi yang Gagal</button>') + '<div id="lk"></div><div class="card"><div class="filters"><label class="search">' + icon('search') + '<input class="input" id="lq" type="search" placeholder="Nama, tujuan, atau event"></label>' +
        '<select class="select" id="lkan"><option value="">Semua kanal</option><option value="email">Email</option><option value="wa">WhatsApp</option></select><select class="select" id="lst"><option value="">Semua status</option><option>Antri</option><option>Proses</option><option>Terkirim</option><option>Gagal</option><option>Batal</option></select></div><div id="lb">' + Admin.skel(6) + '</div></div>';
      function muat() { Api.post('notif.queue', st).then(function (r) { draw(r.data); }).catch(function (e) { Admin.fail(qs('#lb'), e, muat); }); }
      function draw(d) {
        if (!qs('#lb')) return;
        Admin.setBadge('gagal', d.ringkasan.Gagal);
        qs('#lk').innerHTML = '<div class="kpis">' + Admin.kpi('clock', 'Menunggu', A.angka(d.ringkasan.Antri + d.ringkasan.Proses), 'di antrean') + Admin.kpi('check-circle', 'Terkirim', A.angka(d.ringkasan.Terkirim), 'berhasil') + Admin.kpi('alert-circle', 'Gagal', A.angka(d.ringkasan.Gagal), 'setelah 3× percobaan') + Admin.kpi('slash', 'Dibatalkan', A.angka(d.ringkasan.Batal), 'blast dihentikan') + '</div>';
        if (!d.rows.length) { qs('#lb').innerHTML = Admin.empty('inbox', 'Belum ada log'); return; }
        var cls = { Terkirim: 'b-ok', Gagal: 'b-bad', Antri: 'b-info', Proses: 'b-violet', Batal: '' };
        qs('#lb').innerHTML = '<div class="table-wrap"><table class="table"><thead><tr><th>Waktu</th><th>Penerima</th><th>Kanal</th><th>Event</th><th>Status</th><th>Percobaan</th><th>Keterangan</th></tr></thead><tbody>' + d.rows.map(function (x) {
          return '<tr style="cursor:pointer" data-i="' + esc(x.id) + '"><td style="white-space:nowrap">' + esc(A.tglJam(x.waktu)) + '</td><td><b>' + esc(x.nama) + '</b><div class="muted mono" style="font-size:12px">' + esc(x.tujuan) + '</div></td><td>' + icon(x.kanal === 'wa' ? 'whatsapp' : 'mail', 'ico-sm') + '</td><td><span class="badge b-brand no-dot">' + esc(x.event) + '</span></td><td><span class="badge ' + (cls[x.status] || '') + '">' + esc(x.status) + '</span></td><td>' + (x.percobaan || 0) + '/3</td><td class="muted" style="font-size:12.5px;max-width:260px">' + esc(x.error || (x.dikirim ? 'Dikirim ' + A.tglJam(x.dikirim) : '')) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
        qsa('[data-i]').forEach(function (tr) { tr.onclick = function () { var x = d.rows.filter(function (y) { return y.id === tr.dataset.i; })[0]; A.modal({ title: 'Detail pesan', drawer: true, body: '<dl class="dl"><dt>Penerima</dt><dd>' + esc(x.nama) + ' · ' + esc(x.tujuan) + '</dd><dt>Kanal</dt><dd>' + esc(x.kanal) + '</dd><dt>Event</dt><dd>' + esc(x.event) + '</dd><dt>Status</dt><dd>' + esc(x.status) + '</dd><dt>Dibuat</dt><dd>' + esc(A.tglJam(x.waktu)) + '</dd><dt>Dikirim</dt><dd>' + esc(A.tglJam(x.dikirim)) + '</dd><dt>Galat</dt><dd>' + esc(x.error || '-') + '</dd></dl>' + (x.subjek ? '<div class="sec-title">Subjek</div><p>' + esc(x.subjek) + '</p>' : '') + '<div class="sec-title">Isi</div><div class="' + (x.kanal === 'wa' ? 'wa-bg' : '') + '"><div class="' + (x.kanal === 'wa' ? 'wa-bubble' : 'email-prev eb') + '" style="white-space:pre-wrap">' + esc(x.pesan) + '</div></div>' }); }; });
      }
      qs('#lq').addEventListener('input', A.debounce(function (e) { st.q = e.target.value; muat(); }, 350));
      qs('#lkan').onchange = function (e) { st.kanal = e.target.value; muat(); };
      qs('#lst').onchange = function (e) { st.status = e.target.value; muat(); };
      qs('#lProc').onclick = function () { Admin.call('notif.processNow', {}, { btn: this }).then(muat).catch(function () {}); };
      qs('#lRetry').onclick = function () { Admin.call('notif.retry', {}, { btn: this }).then(muat).catch(function () {}); };
      muat();
    }
  });

  /* =================== BLAST WHATSAPP =================== */
  Admin.page('blast', {
    roles: Admin.SA,
    render: function (view) {
      var S = { rows: [], ring: null, batch: 20, jeda: '5', hanyaWA: false, sel: {} };
      var pra = A.Store.sget('blast_ids'); if (pra) { try { S.ids = JSON.parse(pra); } catch (e) {} A.Store.sset('blast_ids', ''); }
      view.innerHTML = Admin.head('Blast WhatsApp', 'Kirim pesan massal per batch (anti-banned). Server tetap mengirim 1 batch/menit walau halaman ditutup.') +
        '<div id="bAct"></div><div class="split"><div class="card"><div class="card-h"><h3>' + icon('users', 'ico-sm') + '1. Pilih Sasaran</h3></div><div class="card-b">' +
        '<div class="seg" id="bSrc" style="margin-bottom:12px"><button class="active" data-s="crm">Dari CRM Kontak</button><button data-s="manual">Tempel Manual</button></div><div id="bFil"></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0"><button class="btn btn-sm" id="bLoad">' + icon('users', 'ico-sm') + 'Muat Penerima</button><button class="btn btn-sm btn-light" id="bDet" disabled>' + icon('smartphone', 'ico-sm') + 'Deteksi Nomor WA</button></div><div id="bRing"></div><div id="bList"></div></div></div>' +
        '<div class="sticky" style="display:grid;gap:16px"><div class="card"><div class="card-h"><h3>' + icon('edit', 'ico-sm') + '2. Tulis Pesan</h3></div><div class="card-b">' +
        '<div class="field"><label for="bJud">Judul internal</label><input class="input" id="bJud" placeholder="Mis. Pengingat berkas Februari"></div>' +
        '<div class="field"><label for="bMsg">Pesan</label><div class="var-chips">' + ['nama', 'token', 'status', 'jenjang', 'periode', 'nama_sekolah'].map(function (v) { return '<button type="button" data-v="{' + v + '}">{' + v + '}</button>'; }).join('') + '</div><textarea class="textarea" id="bMsg" rows="6" placeholder="Assalamu\'alaikum {nama}, …"></textarea></div>' +
        '<div class="wa-bg"><div class="wa-bubble" id="bPrev">Pratinjau pesan…<span class="tm">' + new Date().toTimeString().slice(0, 5) + '</span></div></div></div></div>' +
        '<div class="card"><div class="card-h"><h3>' + icon('sliders', 'ico-sm') + '3. Batch & Jeda</h3></div><div class="card-b"><div class="seg" id="bBatch" style="margin-bottom:12px">' + [10, 20, 50].map(function (n) { return '<button data-n="' + n + '" class="' + (n === 20 ? 'active' : '') + '">' + n + ' / batch</button>'; }).join('') + '</div>' +
        '<div class="field"><label for="bJeda">Jeda antarpesan (detik)</label><input class="input" id="bJeda" value="5" placeholder="5 atau 3-8"></div><label class="choice" style="margin-bottom:12px"><input type="checkbox" id="bOnly">Kirim hanya ke nomor terdeteksi WhatsApp</label>' +
        '<div id="bSum" class="help" style="margin-bottom:12px"></div><button class="btn btn-accent btn-block" id="bGo" disabled>' + icon('megaphone') + 'Mulai Blast</button>' +
        '<p class="help" style="margin-top:10px">Tips: mulai dari batch 10, jeda acak ≥5 detik, hindari tautan sama ke ratusan nomor dalam 1 jam.</p></div></div></div></div>' +
        '<div class="card" style="margin-top:18px"><div class="card-h"><h3>' + icon('history', 'ico-sm') + 'Riwayat Blast</h3></div><div id="bHist">' + Admin.skel(3) + '</div></div>';
      var src = 'crm';
      function filHtml() {
        qs('#bFil').innerHTML = src === 'crm' ? '<div class="grid-2"><div class="field"><label for="fSt">Status pendaftar</label><select class="select" id="fSt"><option value="">Semua</option>' + Admin.STATUS.map(function (s) { return '<option>' + s + '</option>'; }).join('') + '</select></div>' +
          '<div class="field"><label for="fSeg">Segmen</label><select class="select" id="fSeg"><option value="">Semua segmen</option><option>Pendaftar</option><option>Manual</option></select></div><div class="field"><label for="fJen">Jenjang</label><input class="input" id="fJen" placeholder="Mis. MTs"></div><div class="field"><label for="fTag">Tag</label><input class="input" id="fTag" placeholder="Opsional"></div></div>' +
          (S.ids ? '<div class="info-strip">' + icon('info') + '<div>' + S.ids.length + ' kontak terpilih dari CRM. <a href="javascript:void 0" id="clrIds">Hapus pilihan</a></div></div>' : '')
          : '<div class="field"><label for="fMan">Satu nomor per baris (format: 0812…|Nama)</label><textarea class="textarea mono" id="fMan" rows="6" placeholder="081234567890|Budi&#10;081298765432|Siti"></textarea></div>';
        var c = qs('#clrIds'); if (c) c.onclick = function () { S.ids = null; filHtml(); };
      }
      filHtml();
      qsa('#bSrc button').forEach(function (b) { b.onclick = function () { src = b.dataset.s; qsa('#bSrc button').forEach(function (x) { x.classList.toggle('active', x === b); }); filHtml(); }; });
      qs('#bLoad').onclick = function () {
        var d = src === 'crm' ? { sumber: 'crm', status: qs('#fSt').value, segmen: qs('#fSeg').value, jenjang: qs('#fJen').value.trim(), tag: qs('#fTag').value.trim(), ids: S.ids || [] } : { sumber: 'manual', manual: qs('#fMan').value };
        var b = this; A.btnBusy(b, true, 'Memuat…');
        Api.post('wa.audience', d).then(function (r) { S.rows = r.data.rows; S.ring = r.data.ringkasan; S.sel = {}; S.rows.forEach(function (x) { if (x.valid && !x.ganda && !x.optOut) S.sel[x.id] = 1; }); drawList(); }).catch(function (e) { A.toast(e.message, 'bad'); }).finally(function () { A.btnBusy(b, false); });
      };
      function drawList() {
        var R = S.ring; qs('#bDet').disabled = !S.rows.length;
        qs('#bRing').innerHTML = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">' + [['Total', R.total, ''], ['Valid', R.valid, 'b-ok'], ['Tidak valid', R.tidakValid, 'b-bad'], ['Ganda', R.ganda, 'b-warn'], ['Opt-out', R.optOut, ''], ['✓ WA', R.terdaftarWA, 'b-ok'], ['✕ bukan WA', R.tidakTerdaftarWA, 'b-bad']].map(function (x) { return '<span class="badge ' + x[2] + '">' + x[0] + ': ' + x[1] + '</span>'; }).join('') + '</div>';
        qs('#bList').innerHTML = S.rows.length ? '<div class="table-wrap" style="max-height:380px;overflow-y:auto;border:1px solid var(--line)"><table class="table"><thead><tr><th><input type="checkbox" id="bAll" checked aria-label="Pilih semua"></th><th>Nama</th><th>Nomor</th><th>WA</th></tr></thead><tbody>' + S.rows.slice(0, 1000).map(function (x) {
          var ok = x.valid && !x.ganda && !x.optOut;
          return '<tr class="' + (ok ? '' : 'row-dim') + '"><td><input type="checkbox" data-r="' + esc(x.id) + '"' + (S.sel[x.id] ? ' checked' : '') + (ok ? '' : ' disabled') + '></td><td>' + esc(x.nama) + (x.optOut ? ' <span class="badge">opt-out</span>' : '') + (x.ganda ? ' <span class="badge b-warn">ganda</span>' : '') + '</td><td class="mono">' + esc(x.hp || '-') + '</td><td>' + waBadge(x.statusWA, x.valid) + '</td></tr>';
        }).join('') + '</tbody></table></div>' : '<p class="muted">Tidak ada penerima.</p>';
        qsa('[data-r]').forEach(function (c) { c.onchange = function () { if (c.checked) S.sel[c.dataset.r] = 1; else delete S.sel[c.dataset.r]; ringkas(); }; });
        var all = qs('#bAll'); if (all) all.onchange = function () { qsa('[data-r]:not(:disabled)').forEach(function (c) { c.checked = all.checked; if (all.checked) S.sel[c.dataset.r] = 1; else delete S.sel[c.dataset.r]; }); ringkas(); };
        ringkas();
      }
      function waBadge(s, valid) { if (!valid) return '<span class="wa-badge tidak">tidak valid</span>'; return s === 'Terdaftar' ? '<span class="wa-badge ya">✓ WA</span>' : s === 'Tidak Terdaftar' ? '<span class="wa-badge tidak">✕ bukan WA</span>' : '<span class="wa-badge belum">? belum dicek</span>'; }
      function penerima() { return S.rows.filter(function (x) { return S.sel[x.id] && (!S.hanyaWA || x.statusWA !== 'Tidak Terdaftar'); }); }
      function ringkas() {
        var n = penerima().length, nb = Math.ceil(n / S.batch), j = String(S.jeda).split('-').map(Number), rj = j.length > 1 ? (j[0] + j[1]) / 2 : j[0] || 5;
        qs('#bSum').innerHTML = n ? '<b>' + n + ' penerima</b> → ' + nb + ' batch · estimasi ±' + Math.max(1, Math.ceil(n * rj / 60)) + ' menit pengiriman' : 'Muat penerima terlebih dahulu.';
        var go = qs('#bGo'); go.disabled = !n; go.innerHTML = icon('megaphone') + 'Mulai Blast' + (n ? ' (' + n + ' nomor)' : '');
      }
      qs('#bDet').onclick = function () {
        var nomor = S.rows.filter(function (x) { return x.valid && !x.statusWA; }).map(function (x) { return x.hp; }), b = this, i = 0, peta = {};
        if (!nomor.length) { A.toast('Semua nomor sudah dicek.', 'info'); return; }
        A.btnBusy(b, true);
        (function next() {
          if (i >= nomor.length) { S.rows.forEach(function (x) { if (peta[x.hp]) x.statusWA = peta[x.hp]; }); A.btnBusy(b, false); drawList(); A.toast('Deteksi selesai.', 'ok'); return; }
          b.innerHTML = '<span class="spin"></span>Mengecek ' + Math.min(i + 50, nomor.length) + '/' + nomor.length;
          Api.post('wa.validate', { nomor: nomor.slice(i, i + 50) }).then(function (r) { Object.assign(peta, r.data.peta); i += 50; next(); }).catch(function (e) { A.btnBusy(b, false); A.toast(e.message, 'bad'); });
        })();
      };
      var msg = qs('#bMsg');
      function prevMsg() { var x = penerima()[0] || { vars: { nama: 'Budi' } }, v = Object.assign({ nama_sekolah: (Admin.settings && Admin.settings.nama_sekolah) || '' }, x.vars || {}); qs('#bPrev').innerHTML = esc(String(msg.value || 'Pratinjau pesan…').replace(/\{(\w+)\}/g, function (m, k) { return v[k] == null ? m : v[k]; })).replace(/\*([^*\n]+)\*/g, '<b>$1</b>') + '<span class="tm">' + new Date().toTimeString().slice(0, 5) + '</span>'; }
      msg.oninput = prevMsg;
      qsa('[data-v]').forEach(function (b) { b.onclick = function () { var s = msg.selectionStart; msg.value = msg.value.slice(0, s) + b.dataset.v + msg.value.slice(msg.selectionEnd); msg.focus(); prevMsg(); }; });
      qsa('#bBatch button').forEach(function (b) { b.onclick = function () { S.batch = +b.dataset.n; qsa('#bBatch button').forEach(function (x) { x.classList.toggle('active', x === b); }); ringkas(); }; });
      qs('#bJeda').oninput = function (e) { S.jeda = e.target.value; ringkas(); };
      qs('#bOnly').onchange = function (e) { S.hanyaWA = e.target.checked; ringkas(); };
      qs('#bGo').onclick = function () {
        var p = penerima(), b = this;
        if (!msg.value.trim()) { A.toast('Tulis pesan terlebih dahulu.', 'warn'); msg.focus(); return; }
        A.confirmDlg({ title: 'Mulai blast?', html: 'Pesan dikirim ke <b>' + p.length + ' nomor</b> dalam ' + Math.ceil(p.length / S.batch) + ' batch.', ok: 'Mulai Blast' }).then(function (y) {
          if (!y) return;
          Admin.call('wa.blastCreate', { judul: qs('#bJud').value, pesan: msg.value, ukuranBatch: S.batch, jeda: S.jeda, hanyaWA: S.hanyaWA, sasaran: src === 'crm' ? 'CRM' : 'Manual', penerima: p.map(function (x) { return { hp: x.hp, nama: x.nama, statusWA: x.statusWA, vars: x.vars }; }) }, { btn: b }).then(function (r) { hist(r.data.id); }).catch(function () {});
        });
      };
      var auto = null;
      function hist(aktifId) {
        Api.post('wa.blastList', {}).then(function (r) {
          if (!qs('#bHist')) return;
          var list = r.data, aktif = list.filter(function (x) { return x.status === 'Berjalan'; })[0] || (aktifId && list.filter(function (x) { return x.id === aktifId; })[0]);
          qs('#bHist').innerHTML = list.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Judul</th><th>Sasaran</th><th>Batch · Jeda</th><th>Progres</th><th>Status</th><th>Tanggal</th></tr></thead><tbody>' + list.map(function (x) {
            return '<tr><td><b>' + esc(x.judul) + '</b></td><td>' + esc(x.sasaran || '-') + '</td><td>' + x.ukuran + ' · ' + esc(x.jeda) + ' dtk</td><td style="min-width:160px"><div class="prog"><span style="width:' + x.persen + '%"></span></div><span class="help">' + x.terkirim + ' terkirim · ' + x.gagal + ' gagal · ' + x.sisa + ' sisa</span></td><td><span class="badge ' + (x.status === 'Selesai' ? 'b-ok' : x.status === 'Berjalan' ? 'b-info' : 'b-warn') + '">' + esc(x.status) + '</span></td><td>' + esc(A.tglJam(x.tanggal)) + '</td></tr>';
          }).join('') + '</tbody></table></div>' : Admin.empty('megaphone', 'Belum ada blast');
          qs('#bAct').innerHTML = aktif && aktif.status === 'Berjalan' ? '<div class="card card-pad" style="margin-bottom:18px;border-color:var(--accent)"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center"><div><span class="badge b-info">Berjalan</span><h3 style="margin:8px 0 4px">' + esc(aktif.judul) + '</h3><span class="muted" style="font-size:13px">' + aktif.terkirim + ' terkirim · ' + aktif.gagal + ' gagal · ' + aktif.sisa + ' sisa dari ' + aktif.total + '</span></div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><label class="switch"><input type="checkbox" id="bAuto"' + (auto ? ' checked' : '') + '><span class="track"></span><span>Otomatis</span></label><button class="btn btn-sm" id="bNext">' + icon('send', 'ico-sm') + 'Kirim Batch Berikutnya</button><button class="btn btn-sm btn-danger" id="bStop">' + icon('slash', 'ico-sm') + 'Hentikan</button></div></div><div class="prog" style="margin-top:14px"><span style="width:' + aktif.persen + '%"></span></div></div>' : '';
          if (aktif && aktif.status === 'Berjalan') {
            var kirim = function (btn) { return Admin.call('wa.blastProcess', { blastId: aktif.id }, { btn: btn, toast: !!btn }).then(function () { hist(aktif.id); }).catch(function () { hist(aktif.id); }); };
            qs('#bNext').onclick = function () { kirim(this); };
            qs('#bStop').onclick = function () { A.confirmDlg({ title: 'Hentikan blast?', danger: true, text: 'Pesan yang belum terkirim dibatalkan.', ok: 'Hentikan' }).then(function (y) { if (y) { clearInterval(auto); auto = null; Admin.call('wa.blastStop', { blastId: aktif.id }).then(function () { hist(); }).catch(function () {}); } }); };
            qs('#bAuto').onchange = function (e) {
              clearInterval(auto); auto = null;
              if (e.target.checked) { var j = String(aktif.jeda).split('-').map(Number), d = Math.max(30, aktif.ukuran * (j.length > 1 ? (j[0] + j[1]) / 2 : j[0] || 5)); auto = setInterval(function () { if (Admin.cur !== 'blast') { clearInterval(auto); return; } kirim(null); }, d * 1000); A.toast('Mode otomatis: 1 batch tiap ' + d + ' detik.', 'info'); }
            };
          } else { clearInterval(auto); auto = null; }
        }).catch(function (e) { Admin.fail(qs('#bHist'), e); });
      }
      hist();
    }
  });

  /* =================== CRM KONTAK =================== */
  Admin.page('crm', {
    roles: Admin.SA,
    render: function (view) {
      var st = { cari: '', segmen: '', statusWA: '', emailValid: '', optOut: '', duplikat: '', masalah: '', tag: '', halaman: 1, per: 50 }, sel = {}, data = null;
      view.innerHTML = Admin.head('CRM Kontak', 'Satu layar untuk memantau Nama · Email · WhatsApp seluruh pendaftar dan kontak lain.',
        '<span class="help" id="cSync"></span><button class="btn btn-sm btn-light" id="crSync">' + icon('refresh', 'ico-sm') + 'Sinkron Sekarang</button><button class="btn btn-sm btn-light" id="crImp">' + icon('upload', 'ico-sm') + 'Import CSV</button>' +
        '<button class="btn btn-sm btn-light" id="crDup">' + icon('merge', 'ico-sm') + 'Periksa Duplikat</button><button class="btn btn-sm btn-light" id="crExp">' + icon('download', 'ico-sm') + 'Ekspor</button>') +
        '<div id="crK"></div><div class="card"><div class="chips" id="crSeg"></div><div class="filters"><label class="search">' + icon('search') + '<input class="input" id="crQ" type="search" placeholder="Nama, email, nomor, atau tag"></label>' +
        '<select class="select" id="crWa"><option value="">Status WA</option><option value="Terdaftar">✓ Terdaftar WA</option><option value="Tidak Terdaftar">✕ Bukan WA</option><option value="belum">Belum dicek</option></select>' +
        '<select class="select" id="crEm"><option value="">Email</option><option value="YA">Email valid</option><option value="TIDAK">Email bermasalah</option></select></div><div id="crB">' + Admin.skel(6) + '</div></div>';
      function stats() { Admin.load('crm.stats', {}, function (s) {
        var k = [['total', 'Total Kontak', 'users', s.total, ''], ['wa', 'WA Terverifikasi', 'check-circle', s.terdaftarWA, 'statusWA=Terdaftar'], ['email', 'Email Valid', 'mail', s.emailValid, 'emailValid=YA'], ['belum', 'Belum Dicek WA', 'clock', s.belumCek, 'statusWA=belum'], ['opt', 'Opt-out', 'slash', s.optOut, 'optOut=YA'], ['dup', 'Duplikat', 'merge', s.duplikat, 'duplikat=1']];
        qs('#crK').innerHTML = '<div class="kpis" style="grid-template-columns:repeat(auto-fill,minmax(min(170px,100%),1fr))">' + k.map(function (x) { return '<div class="card kpi click" data-f="' + x[4] + '" role="button" tabindex="0"><div class="kh"><span>' + x[1] + '</span><span class="ki">' + icon(x[2]) + '</span></div><div class="kv">' + A.angka(x[3]) + '</div></div>'; }).join('') + '</div>';
        qsa('#crK [data-f]').forEach(function (c) { c.onclick = function () { ['statusWA', 'emailValid', 'optOut', 'duplikat'].forEach(function (k2) { st[k2] = ''; }); if (c.dataset.f) { var p = c.dataset.f.split('='); st[p[0]] = p[1]; } st.halaman = 1; qsa('#crK [data-f]').forEach(function (x) { x.classList.toggle('active', x === c && !!c.dataset.f); }); muat(); }; });
      }).catch(function () {}); }
      function muat() { Api.post('crm.list', st).then(function (r) { data = r.data; draw(); }).catch(function (e) { Admin.fail(qs('#crB'), e, muat); }); }
      function draw() {
        if (!qs('#crB')) return;
        qs('#cSync').textContent = data.sinkron ? 'Sinkron: ' + A.relatif(new Date(+data.sinkron)) : '';
        qs('#crSeg').innerHTML = '<button class="chip ' + (!st.segmen ? 'active' : '') + '" data-sg="">Semua</button>' + Object.keys(data.facet.segmen).map(function (s) { return '<button class="chip ' + (st.segmen === s ? 'active' : '') + '" data-sg="' + esc(s) + '">' + esc(s) + ' <span class="n">' + A.angka(data.facet.segmen[s]) + '</span></button>'; }).join('') +
          Object.keys(data.facet.tag).slice(0, 8).map(function (t) { return '<button class="chip ' + (st.tag === t ? 'active' : '') + '" data-tg="' + esc(t) + '">' + icon('tag', 'ico-sm') + esc(t) + ' <span class="n">' + data.facet.tag[t] + '</span></button>'; }).join('');
        qsa('[data-sg]').forEach(function (b) { b.onclick = function () { st.segmen = b.dataset.sg; st.halaman = 1; muat(); }; });
        qsa('[data-tg]').forEach(function (b) { b.onclick = function () { st.tag = st.tag === b.dataset.tg ? '' : b.dataset.tg; st.halaman = 1; muat(); }; });
        var n = Object.keys(sel).length;
        qs('#crB').innerHTML = (data.rows.length ? '<div class="table-wrap"><table class="table"><thead><tr><th style="width:36px"><input type="checkbox" id="crAll" aria-label="Pilih halaman"></th><th>Kontak</th><th>Email</th><th>WhatsApp</th><th>Tag</th><th>Terakhir dihubungi</th><th class="num">Pesan</th><th></th></tr></thead><tbody>' +
          data.rows.map(function (k) {
            var masalah = !k.no_wa || k.email_valid === 'TIDAK' || k.dup;
            return '<tr class="' + (masalah ? 'row-warn' : '') + '"><td><input type="checkbox" data-c="' + esc(k.id) + '"' + (sel[k.id] ? ' checked' : '') + '></td><td><div class="cell-main"><span class="ini">' + esc(Admin.inisial(k.nama)) + '</span><div><b>' + esc(k.nama) + '</b><span>' + esc(k.segmen) + (k.status ? ' · ' + esc(k.status) : '') + (k.opt_out ? ' · opt-out' : '') + (k.dup ? ' · duplikat' : '') + '</span></div></div></td>' +
              '<td style="font-size:13px">' + (k.email ? esc(k.email) + ' ' + (k.email_valid === 'YA' ? icon('check', 'ico-sm') : icon('alert-triangle', 'ico-sm')) : '<span class="muted">—</span>') + '</td>' +
              '<td><span class="mono" style="font-size:13px">' + esc(k.no_wa || '—') + '</span> ' + (k.no_wa ? (k.status_wa === 'Terdaftar' ? '<span class="wa-badge ya">✓ WA</span>' : k.status_wa === 'Tidak Terdaftar' ? '<span class="wa-badge tidak">✕</span>' : '<span class="wa-badge belum">?</span>') + ' <a href="' + A.waLink(k.no_wa) + '" target="_blank" rel="noopener" aria-label="Chat WhatsApp">' + icon('external', 'ico-sm') + '</a>' : '') + '</td>' +
              '<td>' + String(k.tag || '').split(',').filter(String).map(function (t) { return '<span class="badge b-brand no-dot" style="margin:1px">' + esc(t) + '</span>'; }).join('') + '</td><td style="font-size:13px">' + esc(k.terakhir ? A.relatif(k.terakhir) : '—') + '</td><td class="num">' + k.jumlah_pesan + '</td>' +
              '<td class="row-act"><button class="btn btn-sm btn-light" data-d="' + esc(k.id) + '">Detail</button></td></tr>';
          }).join('') + '</tbody></table></div>' + Admin.pager(data.total, data.halaman, data.per, function (p) { st.halaman = p; muat(); }) : Admin.empty('users', 'Tidak ada kontak', 'Ubah filter atau sinkronkan data pendaftar.')) +
          (n ? '<div class="bulk"><b>' + n + ' dipilih</b><button class="btn btn-xs btn-light" data-b="deteksiWA">' + icon('smartphone', 'ico-sm') + 'Deteksi WA</button><button class="btn btn-xs btn-light" data-b="tag">' + icon('tag', 'ico-sm') + 'Beri Tag</button><button class="btn btn-xs btn-light" data-b="untag">Hapus Tag</button>' +
            '<button class="btn btn-xs btn-light" data-b="blast">' + icon('megaphone', 'ico-sm') + 'Blast ke Terpilih</button><button class="btn btn-xs btn-light" data-b="optout">' + icon('slash', 'ico-sm') + 'Opt-out</button><button class="btn btn-xs btn-light" data-b="optin">Opt-in</button><button class="btn btn-xs btn-light" data-b="hapusManual">' + icon('trash', 'ico-sm') + 'Hapus manual</button><button class="btn btn-xs btn-light" data-b="clear" style="margin-left:auto">Batal</button></div>' : '');
        qsa('[data-c]').forEach(function (c) { c.onchange = function () { if (c.checked) sel[c.dataset.c] = 1; else delete sel[c.dataset.c]; draw(); }; });
        var all = qs('#crAll'); if (all) { all.checked = data.rows.length && data.rows.every(function (k) { return sel[k.id]; }); all.onchange = function () { data.rows.forEach(function (k) { if (all.checked) sel[k.id] = 1; else delete sel[k.id]; }); draw(); }; }
        qsa('[data-d]').forEach(function (b) { b.onclick = function () { detail(b.dataset.d); }; });
        qsa('[data-b]').forEach(function (b) { b.onclick = function () { bulk(b.dataset.b, b); }; });
      }
      function bulk(aksi, btn) {
        var ids = Object.keys(sel);
        if (aksi === 'clear') { sel = {}; draw(); return; }
        if (aksi === 'blast') { A.Store.sset('blast_ids', JSON.stringify(ids)); Admin.go('blast'); return; }
        var go = function (nilai) { Admin.call('crm.bulk', { ids: ids, aksi: aksi, nilai: nilai }, { btn: btn }).then(function () { sel = {}; muat(); stats(); }).catch(function () {}); };
        if (aksi === 'tag' || aksi === 'untag') A.confirmDlg({ title: aksi === 'tag' ? 'Beri tag' : 'Hapus tag', ok: 'Terapkan', input: { label: 'Nama tag', placeholder: 'Mis. prioritas' } }).then(function (t) { if (t) go(t); });
        else if (aksi === 'hapusManual') A.confirmDlg({ title: 'Hapus kontak manual?', danger: true, text: 'Hanya kontak bersumber manual/impor yang dihapus.', ok: 'Hapus' }).then(function (y) { if (y) go(''); });
        else go('');
      }
      function detail(id) {
        var m = A.modal({ title: 'Detail Kontak', drawer: true, body: Admin.skel(5, 40) });
        Api.post('crm.detail', { id: id }).then(function (r) {
          var k = r.data.kontak, tl = r.data.timeline;
          qs('.modal-body', m.el).innerHTML = '<div style="display:flex;gap:14px;align-items:center;margin-bottom:16px"><span class="ini" style="width:52px;height:52px;font-size:18px;border-radius:16px">' + esc(Admin.inisial(k.nama)) + '</span><div><h3 style="margin:0">' + esc(k.nama) + '</h3><span class="muted" style="font-size:13px">' + esc(k.segmen) + ' · sumber ' + esc(k.sumber) + (k.info.Token ? ' · ' + esc(k.info.Token) : '') + '</span></div></div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">' + (k.no_wa ? '<a class="btn btn-sm" style="background:#1FAF54" target="_blank" rel="noopener" href="' + A.waLink(k.no_wa) + '">' + icon('whatsapp', 'ico-sm') + 'WhatsApp</a><button class="btn btn-sm btn-light" id="cpNo">' + icon('copy', 'ico-sm') + 'Salin nomor</button>' : '') +
            (k.email ? '<a class="btn btn-sm btn-light" href="mailto:' + esc(k.email) + '">' + icon('mail', 'ico-sm') + 'Email</a>' : '') + (k.sumber === 'pendaftar' ? '<a class="btn btn-sm btn-light" href="#/pendaftar/' + esc(k.ref_id) + '">' + icon('user', 'ico-sm') + 'Data pendaftar</a>' : '') + '</div>' +
            '<div class="grid-2"><div class="field"><label for="dkN">Nama</label><input class="input" id="dkN" value="' + esc(k.nama) + '"></div><div class="field"><label for="dkW">WhatsApp</label><input class="input" id="dkW" value="' + esc(k.no_wa) + '"></div><div class="field span-2"><label for="dkE">Email</label><input class="input" id="dkE" value="' + esc(k.email) + '"></div>' +
            '<div class="field span-2"><label for="dkT">Tag (pisahkan koma)</label><input class="input" id="dkT" value="' + esc(k.tag) + '"></div><div class="field span-2"><label for="dkC">Catatan</label><textarea class="textarea" id="dkC" rows="3">' + esc(k.catatan) + '</textarea></div></div>' +
            '<label class="switch" style="margin-bottom:14px"><input type="checkbox" id="dkO"' + (k.opt_out ? ' checked' : '') + '><span class="track"></span><span>Opt-out (tidak menerima blast)</span></label>' +
            (k.sumber === 'pendaftar' ? '<p class="help">Perubahan nama/email/nomor juga diperbarui di data pendaftar.</p>' : '') + '<button class="btn btn-block" id="dkSave">' + icon('save') + 'Simpan Kontak</button>' +
            '<div class="sec-title">Catat interaksi</div><div style="display:flex;gap:8px;flex-wrap:wrap"><select class="select" id="ikK" style="width:auto"><option>Telepon</option><option>WA Manual</option><option>Kunjungan</option><option>Email Manual</option><option>Catatan</option></select><input class="input" id="ikR" placeholder="Ringkasan interaksi" style="flex:1;min-width:180px"><button class="btn btn-light" id="ikS">' + icon('plus', 'ico-sm') + 'Catat</button></div>' +
            '<div class="sec-title">Timeline</div><div class="timeline">' + (tl.length ? tl.map(function (t) { return '<div class="tl"><span class="dot">' + icon(t.tipe === 'pesan' ? (t.kanal === 'wa' ? 'whatsapp' : 'mail') : 'message', 'ico-sm') + '</span><div><b>' + esc(t.tipe === 'pesan' ? (t.event || 'Pesan') + ' · ' + t.status : t.kanal) + '</b><div>' + esc(t.ringkasan) + '</div><div class="m">' + esc(A.tglJam(t.waktu)) + (t.oleh ? ' · ' + esc(t.oleh) : '') + '</div></div></div>'; }).join('') : '<p class="muted">Belum ada interaksi.</p>') + '</div>';
          var cp = qs('#cpNo', m.el); if (cp) cp.onclick = function () { A.copyText(k.no_wa).then(function () { A.toast('Nomor disalin.', 'ok'); }); };
          qs('#dkSave', m.el).onclick = function () { Admin.call('crm.save', { kontak: { id: k.id, nama: qs('#dkN', m.el).value, no_wa: qs('#dkW', m.el).value, email: qs('#dkE', m.el).value, tag: qs('#dkT', m.el).value, catatan: qs('#dkC', m.el).value, opt_out: qs('#dkO', m.el).checked } }, { btn: this }).then(function () { m.close(); muat(); stats(); }).catch(function () {}); };
          qs('#ikS', m.el).onclick = function () { Admin.call('crm.interaksi', { kontakId: k.id, kanal: qs('#ikK', m.el).value, ringkasan: qs('#ikR', m.el).value }, { btn: this }).then(function () { m.close(); detail(id); }).catch(function () {}); };
        }).catch(function (e) { Admin.fail(qs('.modal-body', m.el), e); });
      }
      qs('#crQ').addEventListener('input', A.debounce(function (e) { st.cari = e.target.value; st.halaman = 1; muat(); }, 350));
      qs('#crWa').onchange = function (e) { st.statusWA = e.target.value; st.halaman = 1; muat(); };
      qs('#crEm').onchange = function (e) { st.emailValid = e.target.value; st.halaman = 1; muat(); };
      qs('#crSync').onclick = function () { Admin.call('crm.sync', {}, { btn: this }).then(function () { muat(); stats(); }).catch(function () {}); };
      qs('#crExp').onclick = function () { var b = this; A.btnBusy(b, true); Api.post('crm.export', {}).then(function (r) { return Admin.exportXlsx([{ nama: 'Kontak', kolom: r.data.kolom, rows: r.data.rows }], 'CRM-Kontak-' + new Date().toISOString().slice(0, 10)); }).catch(function (e) { A.toast(e.message, 'bad'); }).finally(function () { A.btnBusy(b, false); }); };
      qs('#crImp').onclick = function () {
        var m = A.modal({ title: 'Import Kontak (CSV)', body: '<p class="muted" style="font-size:13.5px">Kolom: <span class="kbd">nama,email,wa,segmen,tag</span>. Baris ganda (nomor/email sudah ada) dilewati.</p><button class="btn btn-sm btn-light" id="tplCsv">' + icon('download', 'ico-sm') + 'Unduh template CSV</button>' +
          '<div class="field" style="margin-top:14px"><label for="csvF">Pilih berkas CSV</label><input type="file" id="csvF" accept=".csv,text/csv" class="input" style="padding:8px"></div><div class="field"><label for="csvT">…atau tempel isi CSV</label><textarea class="textarea mono" id="csvT" rows="6"></textarea></div><div id="csvInfo" class="help"></div>',
          foot: '<button class="btn btn-light" data-close>Batal</button><button class="btn" id="csvGo">' + icon('upload') + 'Import</button>' });
        qs('#tplCsv', m.el).onclick = function () { A.unduhBlob(new Blob(['﻿nama,email,wa,segmen,tag\nBudi Santoso,budi@contoh.com,081234567890,Calon Wali,seminar\n'], { type: 'text/csv' }), 'template-kontak.csv'); };
        qs('#csvF', m.el).onchange = function (e) { var f = e.target.files[0]; if (f) f.text().then(function (t) { qs('#csvT', m.el).value = t; }); };
        qs('#csvGo', m.el).onclick = function () {
          var rows = parseCsv(qs('#csvT', m.el).value);
          if (!rows.length) { A.toast('CSV kosong atau tidak terbaca.', 'warn'); return; }
          Admin.call('crm.import', { rows: rows }, { btn: this }).then(function () { m.close(); muat(); stats(); }).catch(function () {});
        };
      };
      qs('#crDup').onclick = function () {
        var m = A.modal({ title: 'Periksa Duplikat', size: 'wide', body: Admin.skel(4) });
        Api.post('crm.duplikat', {}).then(function (r) {
          qs('.modal-body', m.el).innerHTML = r.data.length ? r.data.map(function (g, gi) {
            return '<div class="slot-card"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap"><b>' + esc(g.jenis) + ': <span class="mono">' + esc(g.kunci) + '</span></b><button class="btn btn-xs" data-gab="' + gi + '">' + icon('merge', 'ico-sm') + 'Gabungkan</button></div>' +
              g.kontak.map(function (k, i) { return '<label class="choice" style="margin-top:8px"><input type="radio" name="utama' + gi + '" value="' + esc(k.id) + '"' + (i ? '' : ' checked') + '>' + esc(k.nama) + ' <span class="muted" style="font-size:12px">· ' + esc(k.segmen) + ' · ' + esc(k.sumber) + '</span></label>'; }).join('') + '<p class="help" style="margin:6px 0 0">Pilih kontak utama; yang lain digabung ke dalamnya.</p></div>';
          }).join('') : Admin.empty('check-circle', 'Tidak ada duplikat', 'Semua nomor & email unik.');
          qsa('[data-gab]', m.el).forEach(function (b) { b.onclick = function () { var g = r.data[+b.dataset.gab], ut = qs('input[name="utama' + b.dataset.gab + '"]:checked', m.el).value; Admin.call('crm.merge', { utama: ut, gabung: g.kontak.map(function (k) { return k.id; }).filter(function (x) { return x !== ut; }) }, { btn: b }).then(function () { b.closest('.slot-card').remove(); muat(); stats(); }).catch(function () {}); }; });
        }).catch(function (e) { Admin.fail(qs('.modal-body', m.el), e); });
      };
      stats(); muat();
    }
  });
  function parseCsv(t) {
    var lines = String(t || '').replace(/^﻿/, '').split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (lines.length < 2) return [];
    var sep = lines[0].indexOf(';') >= 0 && lines[0].indexOf(',') < 0 ? ';' : ',';
    var split = function (l) { var out = [], cur = '', q = false; for (var i = 0; i < l.length; i++) { var c = l[i]; if (c === '"') { if (q && l[i + 1] === '"') { cur += '"'; i++; } else q = !q; } else if (c === sep && !q) { out.push(cur); cur = ''; } else cur += c; } out.push(cur); return out.map(function (s) { return s.trim(); }); };
    var h = split(lines[0]).map(function (x) { return x.toLowerCase().replace(/[^a-z]/g, ''); });
    var map = { nama: 'nama', name: 'nama', email: 'email', wa: 'wa', whatsapp: 'wa', nowa: 'wa', hp: 'wa', segmen: 'segmen', tag: 'tag' };
    return lines.slice(1).map(function (l) { var c = split(l), o = {}; h.forEach(function (k, i) { if (map[k]) o[map[k]] = c[i] || ''; }); return o; }).filter(function (o) { return o.nama; });
  }

  /* =================== DOKUMEN & TTD (Doc Engine) =================== */
  var DSTAT = { DRAF: ['Draf', ''], MENUNGGU_TTD: ['Menunggu TTD', 'b-warn'], TERBIT: ['Terbit', 'b-ok'], DITARIK: ['Ditarik', 'b-bad'] };
  Admin.page('dokumen', {
    roles: Admin.SA,
    render: function (view, r) {
      var tab = r.q.tab || 'dokumen';
      view.innerHTML = Admin.head('Dokumen & Tanda Tangan', 'Template Google Docs/Sheets/Slides ber-placeholder <span class="kbd">{{...}}</span> → dokumen ber-QR yang bisa diverifikasi di website.',
        '<button class="btn btn-sm" id="dNew">' + icon('plus', 'ico-sm') + 'Buat Dokumen</button>') +
        '<div class="card"><div class="tabs" style="padding:0 12px" role="tablist">' + [['dokumen', 'Dokumen', 'file-text'], ['template', 'Template', 'layers'], ['pejabat', 'Pejabat', 'user-check'], ['massal', 'Generate Massal', 'zap']].map(function (t) { return '<button data-tab="' + t[0] + '" class="' + (t[0] === tab ? 'active' : '') + '">' + icon(t[2], 'ico-sm') + t[1] + '</button>'; }).join('') + '</div><div id="dBody" class="card-b">' + Admin.skel(4) + '</div></div>';
      qsa('[data-tab]').forEach(function (b) { b.onclick = function () { tab = b.dataset.tab; qsa('[data-tab]').forEach(function (x) { x.classList.toggle('active', x === b); }); show(); }; });
      qs('#dNew').onclick = function () { Admin.buatDokumen({}, show); };
      function show() { ({ dokumen: tabDok, template: tabTpl, pejabat: tabPej, massal: tabMassal })[tab](qs('#dBody'), show, r.q); }
      show();
    }
  });
  function tabDok(el, re, q) {
    var st = { status: '' };
    function muat() { Api.post('de.dokumen', st).then(function (r) { draw(r.data); }).catch(function (e) { Admin.fail(el, e, muat); }); }
    function draw(d) {
      el.innerHTML = '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"><button class="chip ' + (!st.status ? 'active' : '') + '" data-st="">Semua</button>' + Object.keys(DSTAT).map(function (k) { return '<button class="chip ' + (st.status === k ? 'active' : '') + '" data-st="' + k + '">' + DSTAT[k][0] + ' <span class="n">' + (d.hitung[k] || 0) + '</span></button>'; }).join('') + '</div>' +
        (d.rows.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Dokumen</th><th>Nomor</th><th>Status</th><th>Penanda tangan</th><th>Tanggal</th><th></th></tr></thead><tbody>' + d.rows.map(function (x) {
          return '<tr><td><b>' + esc(x.judul) + '</b><div class="muted" style="font-size:12px">' + esc(x.template) + '</div></td><td class="mono" style="font-size:12.5px">' + esc(x.nomor || '—') + '</td><td><span class="badge ' + DSTAT[x.status][1] + '">' + DSTAT[x.status][0] + '</span></td>' +
            '<td style="font-size:12.5px">' + x.ttd.map(function (t) { return esc(t.nama || '-') + ' ' + (t.status === 'SETUJU' ? icon('check', 'ico-sm') : icon('clock', 'ico-sm')); }).join('<br>') + '</td><td style="font-size:13px">' + esc(A.tglJam(x.terbit || x.dibuat)) + '</td>' +
            '<td class="row-act">' + (x.status === 'TERBIT' || x.status === 'DITARIK' ? '<button class="btn btn-ghost btn-icon btn-sm" data-un="' + esc(x.id) + '" aria-label="Unduh PDF">' + icon('download') + '</button><button class="btn btn-ghost btn-icon btn-sm" data-vf="' + esc(x.kode) + '" aria-label="Salin tautan verifikasi">' + icon('qr') + '</button>' : '') +
            (x.status === 'DRAF' ? '<button class="btn btn-sm btn-light" data-aj="' + esc(x.id) + '">Ajukan</button>' : '') + (x.status === 'TERBIT' ? '<button class="btn btn-ghost btn-icon btn-sm" data-tr="' + esc(x.id) + '" aria-label="Tarik">' + icon('slash') + '</button>' : '') +
            '<button class="btn btn-ghost btn-icon btn-sm" data-pv="' + esc(x.id) + '" aria-label="Pratinjau">' + icon('eye') + '</button></td></tr>';
        }).join('') + '</tbody></table></div>' : Admin.empty('file-text', 'Belum ada dokumen', 'Buat dokumen dari template, misalnya Bukti Pendaftaran.'));
      qsa('[data-st]', el).forEach(function (b) { b.onclick = function () { st.status = b.dataset.st; muat(); }; });
      qsa('[data-un]', el).forEach(function (b) { b.onclick = function () { A.btnBusy(b, true); Api.post('de.unduh', { id: b.dataset.un, format: 'pdf' }).then(function (r) { Admin.downloadB64(r.data); }).catch(function (e) { A.toast(e.message, 'bad'); }).finally(function () { A.btnBusy(b, false); }); }; });
      qsa('[data-vf]', el).forEach(function (b) { b.onclick = function () { var u = location.href.split('#')[0].replace(/admin\.html.*$/, '') + '#/v/' + b.dataset.vf; A.copyText(u).then(function () { A.toast('Tautan verifikasi disalin.', 'ok'); }); }; });
      qsa('[data-aj]', el).forEach(function (b) { b.onclick = function () { Admin.call('de.dokumenAjukan', { id: b.dataset.aj }, { btn: b, busy: 'Memproses…' }).then(muat).catch(function () {}); }; });
      qsa('[data-tr]', el).forEach(function (b) { b.onclick = function () { A.confirmDlg({ title: 'Tarik dokumen?', danger: true, ok: 'Tarik', input: { label: 'Alasan penarikan', placeholder: 'Mis. Salah data nama' } }).then(function (a) { if (a) Admin.call('de.tarik', { id: b.dataset.tr, alasan: a }).then(muat).catch(function () {}); }); }; });
      qsa('[data-pv]', el).forEach(function (b) { b.onclick = function () { pratinjauPdf({ id: b.dataset.pv }, b); }; });
    }
    muat();
  }
  function pratinjauPdf(d, btn) {
    A.btnBusy(btn, true, btn && btn.classList.contains('btn-icon') ? '' : 'Merender…');
    return Api.post('de.pratinjau', d).then(function (r) {
      var url = URL.createObjectURL(A.b64ToBlob(r.data.data, 'application/pdf'));
      A.modal({ title: 'Pratinjau PDF', size: 'xwide', body: '<div class="preview-box"><iframe src="' + url + '" title="Pratinjau"></iframe></div>', foot: '<button class="btn btn-light" data-close>Tutup</button>' });
    }).catch(function (e) { A.toast(e.message, 'bad'); }).finally(function () { A.btnBusy(btn, false); });
  }
  /** Modal buat dokumen (dipakai juga dari detail pendaftar). */
  Admin.buatDokumen = function (pre, done) {
    var m = A.modal({ title: 'Buat Dokumen', size: 'wide', body: Admin.skel(4) });
    Promise.all([Api.post('de.templates', {}), Api.post('de.pejabat', {})]).then(function (rs) {
      var tpls = rs[0].data.filter(function (t) { return t.aktif; }), pj = rs[1].data.filter(function (p) { return p.aktif; }), t = tpls[0];
      if (!t) { qs('.modal-body', m.el).innerHTML = Admin.empty('layers', 'Belum ada template', 'Tambahkan template di tab Template.'); return; }
      var ref = pre.refId ? { id: pre.refId, nama: pre.nama } : null;
      function draw() {
        var isian = t.bidang.filter(function (b) { return b.kategori !== 'ppdb' || !ref; });
        qs('.modal-body', m.el).innerHTML = '<div class="grid-2"><div class="field"><label for="bdT">Template</label><select class="select" id="bdT">' + tpls.map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === t.id ? ' selected' : '') + '>' + esc(x.nama) + ' (' + esc(x.kode) + ')</option>'; }).join('') + '</select></div>' +
          '<div class="field"><label for="bdP">Pendaftar</label>' + (ref ? '<input class="input" value="' + esc(ref.nama) + '" disabled>' : '<div style="display:flex;gap:6px"><input class="input" id="bdQ" placeholder="Cari nama/token (opsional)"><button class="btn btn-light" id="bdCari" type="button">' + icon('search', 'ico-sm') + '</button></div><select class="select" id="bdP" style="margin-top:6px"><option value="">— Tanpa pendaftar (isi manual) —</option></select>') + '</div></div>' +
          (ref ? '<div class="info-strip ok">' + icon('check-circle') + '<div>Kolom data pendaftar (nama, TTL, token, dll.) terisi otomatis dari formulir PPDB.</div></div>' : '') +
          (isian.length ? '<div class="sec-title">Isian dokumen</div><div class="grid-2">' + isian.map(function (b) {
            var id = 'bd_' + b.kunci, inp = b.tipe === 'area' || b.tipe === 'naskah' ? '<textarea class="textarea" id="' + id + '" rows="3"></textarea>' : b.tipe === 'pilihan' ? '<select class="select" id="' + id + '">' + (b.opsi || []).map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select>' : '<input class="input" id="' + id + '" type="' + ({ tanggal: 'date', angka: 'number' }[b.tipe] || 'text') + '">';
            return '<div class="field' + (b.tipe === 'area' || b.tipe === 'naskah' ? ' span-2' : '') + '"><label for="' + id + '">' + esc(b.label) + (b.wajib ? '<span class="req">*</span>' : '') + ' <span class="kbd">{{' + esc(b.kunci) + '}}</span></label>' + inp + (b.bantu ? '<div class="help">' + esc(b.bantu) + '</div>' : '') + '</div>';
          }).join('') + '</div>' : '<p class="muted">Semua isian terisi otomatis.</p>') +
          (t.slotTtd.filter(function (s) { return s.cara === 'pilih'; }).map(function (s) { return '<div class="field"><label for="bdS' + s.slot + '">Penanda tangan: ' + esc(s.label) + '</label><select class="select" id="bdS' + s.slot + '">' + pj.map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === s.pejabatId ? ' selected' : '') + '>' + esc(p.nama) + ' — ' + esc(p.jabatan) + '</option>'; }).join('') + '</select></div>'; }).join('')) +
          (t.slotTtd.length ? '<div class="info-strip">' + icon('pen') + '<div>' + t.slotTtd.length + ' slot tanda tangan: ' + t.slotTtd.map(function (s) { return esc(s.label) + (s.wajibSetuju ? ' (perlu persetujuan Google + PIN)' : ''); }).join(', ') + '.</div></div>' : '');
        qs('#bdT', m.el).onchange = function (e) { t = tpls.filter(function (x) { return x.id === e.target.value; })[0]; draw(); };
        var cari = qs('#bdCari', m.el); if (cari) cari.onclick = function () { Api.post('pendaftar.list', { q: qs('#bdQ', m.el).value, per: 50 }).then(function (r2) { qs('#bdP', m.el).innerHTML = '<option value="">— Tanpa pendaftar (isi manual) —</option>' + r2.data.rows.map(function (x) { return '<option value="' + esc(x.id) + '">' + esc(x.nama) + ' · ' + esc(x.token) + '</option>'; }).join(''); }); };
      }
      function kumpul() {
        var isian = {}, pjl = {};
        t.bidang.forEach(function (b) { var e = qs('#bd_' + b.kunci, m.el); if (e && e.value !== '') isian[b.kunci] = e.value; });
        t.slotTtd.forEach(function (s) { var e = qs('#bdS' + s.slot, m.el); if (e) pjl[s.slot] = e.value; });
        var rid = ref ? ref.id : (qs('#bdP', m.el) ? qs('#bdP', m.el).value : '');
        return { templateId: t.id, refId: rid, isian: isian, pejabat: pjl };
      }
      qs('.modal-foot', m.el) || qs('.modal', m.el).insertAdjacentHTML('beforeend', '<div class="modal-foot"><button class="btn btn-light" id="bdPrev">' + icon('eye', 'ico-sm') + 'Pratinjau PDF</button><button class="btn btn-light" id="bdDraf">Simpan Draf</button><button class="btn" id="bdGo">' + icon('send', 'ico-sm') + 'Ajukan / Terbitkan</button></div>');
      draw();
      qs('#bdPrev', m.el).onclick = function () { pratinjauPdf(kumpul(), this); };
      qs('#bdDraf', m.el).onclick = function () { var d = kumpul(); Admin.call('de.dokumenBuat', d, { btn: this }).then(function () { m.close(); if (done) done(); }).catch(function () {}); };
      qs('#bdGo', m.el).onclick = function () { var d = kumpul(); d.ajukan = true; Admin.call('de.dokumenBuat', d, { btn: this, busy: 'Merender dokumen…' }).then(function () { m.close(); if (done) done(); }).catch(function () {}); };
    }).catch(function (e) { Admin.fail(qs('.modal-body', m.el), e); });
  };
  function tabTpl(el) {
    function muat() { Api.post('de.templates', {}).then(function (r) { draw(r.data); }).catch(function (e) { Admin.fail(el, e, muat); }); }
    function draw(list) {
      el.innerHTML = '<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:14px"><p class="muted" style="margin:0;font-size:13.5px">Desain template di Google Docs/Sheets/Slides, tulis placeholder seperti <span class="kbd">{{NAMA_LENGKAP|kapital}}</span>, <span class="kbd">{{TTD_1}}</span>, <span class="kbd">{{QR}}</span>, lalu pindai.</p><button class="btn btn-sm" id="tAdd">' + icon('plus', 'ico-sm') + 'Tambah Template</button></div>' +
        '<div class="grid-cards">' + list.map(function (t) {
          return '<div class="card tcard"><div class="th"><span class="tic">' + icon(t.engine === 'sheets' ? 'grid' : t.engine === 'slides' ? 'image' : 'file-text') + '</span><div style="flex:1;min-width:0"><b>' + esc(t.nama) + '</b><div class="muted" style="font-size:12.5px">' + esc(t.kode) + ' · ' + esc(t.engine) + ' · v' + t.versi + ' · ' + t.jumlahDokumen + ' dokumen</div></div><span class="badge ' + (t.aktif ? 'b-ok' : '') + '">' + (t.aktif ? 'Aktif' : 'Nonaktif') + '</span></div>' +
            '<div style="font-size:13px" class="muted">' + t.bidang.length + ' kolom isian · ' + t.slotTtd.length + ' slot TTD · keluaran ' + t.keluaran.join(', ').toUpperCase() + '</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap"><a class="btn btn-xs btn-light" href="' + esc(t.url) + '" target="_blank" rel="noopener">' + icon('external', 'ico-sm') + 'Edit di Google</a><button class="btn btn-xs btn-light" data-at="' + esc(t.id) + '">' + icon('settings', 'ico-sm') + 'Atur</button><button class="btn btn-xs btn-light" data-sc="' + esc(t.kode) + '">' + icon('refresh', 'ico-sm') + 'Pindai Ulang</button>' +
            (t.jumlahDokumen ? '' : '<button class="btn btn-xs btn-ghost" data-dl="' + esc(t.id) + '">' + icon('trash', 'ico-sm') + '</button>') + '</div></div>';
        }).join('') + '</div>';
      qs('#tAdd').onclick = function () { scan(); };
      qsa('[data-sc]', el).forEach(function (b) { b.onclick = function () { Admin.call('de.templateScan', { kode: b.dataset.sc }, { btn: b, busy: 'Memindai…' }).then(function (r) { if (r.data.hilang.length) A.toast('Kolom tidak lagi ada di template: ' + r.data.hilang.join(', '), 'warn', 8000); muat(); }).catch(function () {}); }; });
      qsa('[data-dl]', el).forEach(function (b) { b.onclick = function () { A.confirmDlg({ title: 'Hapus template?', danger: true, ok: 'Hapus' }).then(function (y) { if (y) Admin.call('de.templateDelete', { id: b.dataset.dl }).then(muat).catch(function () {}); }); }; });
      qsa('[data-at]', el).forEach(function (b) { b.onclick = function () { atur(list.filter(function (t) { return t.id === b.dataset.at; })[0]); }; });
    }
    function scan() {
      var m = A.modal({ title: 'Tambah Template', body: Admin.formHtml([{ k: 'kode', l: 'Kode (singkat, unik)', req: 1, ph: 'SKD', max: 12 }, { k: 'nama', l: 'Nama template', req: 1, ph: 'Surat Keterangan Diterima' }, { k: 'url', l: 'URL Google Docs/Sheets/Slides', req: 1, span: 1, ph: 'https://docs.google.com/document/d/…' }, { k: 'formatNomor', l: 'Format nomor', span: 1, ph: '{URUT}/SKD/PPDB/{BULAN}/{TAHUN}' }], {}) +
        '<div class="pill-tog" style="margin-bottom:12px"><span class="label" style="width:100%">Keluaran</span>' + ['pdf', 'docx', 'xlsx', 'png'].map(function (f) { return '<label><input type="checkbox" data-o="' + f + '"' + (f === 'pdf' ? ' checked' : '') + '>' + f.toUpperCase() + '</label>'; }).join('') + '</div><p class="help">Template disalin ke folder Template_Dokumen aplikasi; master tidak pernah diubah.</p>',
        foot: '<button class="btn btn-light" data-close>Batal</button><button class="btn" id="scGo">' + icon('search') + 'Pindai Template</button>' });
      qs('#scGo', m.el).onclick = function () {
        var o = {}; qsa('[data-k]', m.el).forEach(function (e) { o[e.dataset.k] = e.value.trim(); }); o.keluaran = qsa('[data-o]', m.el).filter(function (c) { return c.checked; }).map(function (c) { return c.dataset.o; });
        Admin.call('de.templateScan', o, { btn: this, busy: 'Memindai…' }).then(function () { m.close(); muat(); }).catch(function () {});
      };
    }
    function atur(t) {
      Api.post('de.pejabat', {}).then(function (rp) {
        var pj = rp.data;
        var m = A.modal({ title: 'Atur Template — ' + t.nama, size: 'xwide', body: '<div class="grid-2"><div class="field"><label for="atN">Nama</label><input class="input" id="atN" value="' + esc(t.nama) + '"></div><div class="field"><label for="atF">Format nomor</label><input class="input mono" id="atF" placeholder="{URUT}/' + esc(t.kode) + '/PPDB/{BULAN}/{TAHUN}"></div></div>' +
          '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:6px"><label class="switch"><input type="checkbox" id="atA"' + (t.aktif ? ' checked' : '') + '><span class="track"></span><span>Aktif</span></label><label class="switch"><input type="checkbox" id="atQ"' + (t.qrPerPenandatangan ? ' checked' : '') + '><span class="track"></span><span>QR per penanda tangan (menggantikan TTD)</span></label></div>' +
          '<div class="pill-tog" style="margin:10px 0">' + ['pdf', 'docx', 'xlsx', 'png'].map(function (f) { return '<label><input type="checkbox" data-o="' + f + '"' + (t.keluaran.indexOf(f) >= 0 ? ' checked' : '') + '>' + f.toUpperCase() + '</label>'; }).join('') + '</div>' +
          '<div class="sec-title">Kolom isian</div><div class="table-wrap"><table class="table res-table"><thead><tr><th>Placeholder</th><th>Label</th><th>Tipe</th><th>Wajib</th><th>Sumber</th></tr></thead><tbody>' + t.bidang.map(function (b, i) {
            return '<tr><td class="mono" style="font-size:12px">{{' + esc(b.kunci) + '}}</td><td><input class="input" data-bl="' + i + '" value="' + esc(b.label) + '" style="min-height:36px"></td><td><select class="select" data-bt="' + i + '" style="min-height:36px">' + ['teks', 'area', 'naskah', 'tanggal', 'angka', 'pilihan', 'daftar', 'gambar'].map(function (x) { return '<option' + (x === b.tipe ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></td><td><input type="checkbox" data-bw="' + i + '"' + (b.wajib ? ' checked' : '') + '></td><td><span class="badge ' + (b.kategori === 'ppdb' ? 'b-ok' : 'b-brand') + ' no-dot">' + (b.kategori === 'ppdb' ? 'otomatis' : b.kategori) + '</span></td></tr>';
          }).join('') + '</tbody></table></div>' +
          '<div class="sec-title">Slot tanda tangan</div>' + (t.slotTtd.length ? t.slotTtd.map(function (s, i) {
            return '<div class="slot-card"><b>Slot ' + s.slot + '</b> <span class="muted" style="font-size:12px">' + s.penanda.join(', ') + '</span><div class="grid-2" style="margin-top:10px"><div class="field"><label>Label</label><input class="input" data-sl="' + i + '" value="' + esc(s.label) + '"></div>' +
              '<div class="field"><label>Cara menentukan pejabat</label><select class="select" data-sc2="' + i + '">' + [['tetap', 'Pejabat tetap'], ['pilih', 'Dipilih operator'], ['jabatan', 'Berdasarkan jabatan aktif']].map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === s.cara ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>' +
              '<div class="field"><label>Pejabat</label><select class="select" data-sp="' + i + '"><option value="">—</option>' + pj.map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === s.pejabatId ? ' selected' : '') + '>' + esc(p.nama) + ' — ' + esc(p.jabatan) + '</option>'; }).join('') + '</select></div>' +
              '<div class="field"><label>Jabatan (untuk cara "jabatan")</label><input class="input" data-sj="' + i + '" value="' + esc(s.jabatan) + '"></div>' +
              '<div class="field"><label>Bentuk tanda</label><select class="select" data-sd="' + i + '">' + [['qr', 'QR eTTD'], ['spesimen', 'Spesimen TTD'], ['qr+spesimen', 'QR + spesimen'], ['kosong', 'Kosong (TTD basah)']].map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === s.tanda ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>' +
              '<div class="field"><label>Urutan</label><input class="input" type="number" data-su="' + i + '" value="' + esc(s.urutan) + '"></div></div><label class="switch"><input type="checkbox" data-sw="' + i + '"' + (s.wajibSetuju ? ' checked' : '') + '><span class="track"></span><span>Wajib persetujuan pejabat (Google + PIN)</span></label></div>';
          }).join('') : '<p class="muted">Template tidak memiliki placeholder tanda tangan (mis. <span class="kbd">{{TTD_1}}</span>).</p>'),
          foot: '<button class="btn btn-light" data-close>Batal</button><button class="btn" id="atSave">' + icon('save') + 'Simpan</button>' });
        qs('#atSave', m.el).onclick = function () {
          var bidang = t.bidang.map(function (b, i) { return Object.assign({}, b, { label: qs('[data-bl="' + i + '"]', m.el).value, tipe: qs('[data-bt="' + i + '"]', m.el).value, wajib: qs('[data-bw="' + i + '"]', m.el).checked }); });
          var slot = t.slotTtd.map(function (s, i) { return Object.assign({}, s, { label: qs('[data-sl="' + i + '"]', m.el).value, cara: qs('[data-sc2="' + i + '"]', m.el).value, pejabatId: qs('[data-sp="' + i + '"]', m.el).value, jabatan: qs('[data-sj="' + i + '"]', m.el).value, tanda: qs('[data-sd="' + i + '"]', m.el).value, urutan: +qs('[data-su="' + i + '"]', m.el).value, wajibSetuju: qs('[data-sw="' + i + '"]', m.el).checked }); });
          Admin.call('de.templateSave', { id: t.id, nama: qs('#atN', m.el).value, formatNomor: qs('#atF', m.el).value.trim(), aktif: qs('#atA', m.el).checked, qrPerPenandatangan: qs('#atQ', m.el).checked, keluaran: qsa('[data-o]', m.el).filter(function (c) { return c.checked; }).map(function (c) { return c.dataset.o; }), bidang: bidang, slotTtd: slot }, { btn: this }).then(function () { m.close(); muat(); }).catch(function () {});
        };
      }).catch(function (e) { A.toast(e.message, 'bad'); });
    }
    muat();
  }
  function tabPej(el) {
    function muat() { Api.post('de.pejabat', {}).then(function (r) { draw(r.data); }).catch(function (e) { Admin.fail(el, e, muat); }); }
    function draw(list) {
      el.innerHTML = '<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:14px"><p class="muted" style="margin:0;font-size:13.5px">Pejabat menyetujui dokumen dengan login Google (email harus sama) + PIN 6 digit yang diatur sendiri di menu Persetujuan Saya.</p><button class="btn btn-sm" id="pjAdd">' + icon('user-plus', 'ico-sm') + 'Tambah Pejabat</button></div>' +
        (list.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Nama</th><th>Jabatan</th><th>Email Google</th><th>PIN</th><th>Spesimen</th><th>Masa jabatan</th><th>Status</th><th></th></tr></thead><tbody>' + list.map(function (p) {
          return '<tr><td><b>' + esc(p.nama) + '</b>' + (p.gelar ? ', ' + esc(p.gelar) : '') + '<div class="muted" style="font-size:12px">' + esc(p.nip ? 'NIP ' + p.nip : '') + '</div></td><td>' + esc(p.jabatan) + '</td><td style="font-size:13px">' + esc(p.email || '—') + '</td><td>' + (p.adaPin ? '<span class="badge b-ok">Sudah</span>' : '<span class="badge b-warn">Belum</span>') + '</td><td>' + (p.spesimenId ? icon('check', 'ico-sm') : '—') + '</td><td style="font-size:12.5px">' + esc((p.mulai || '…') + ' s/d ' + (p.selesai || '…')) + '</td><td><span class="badge ' + (p.aktif ? 'b-ok' : '') + '">' + (p.aktif ? 'Aktif' : 'Nonaktif') + '</span></td><td class="row-act"><button class="btn btn-ghost btn-icon btn-sm" data-e="' + esc(p.id) + '">' + icon('edit') + '</button>' + (p.aktif ? '<button class="btn btn-ghost btn-icon btn-sm" data-x="' + esc(p.id) + '" aria-label="Nonaktifkan">' + icon('slash') + '</button>' : '') + '</td></tr>';
        }).join('') + '</tbody></table></div>' : Admin.empty('user-check', 'Belum ada pejabat'));
      qs('#pjAdd').onclick = function () { form(null); };
      qsa('[data-e]', el).forEach(function (b) { b.onclick = function () { form(list.filter(function (p) { return p.id === b.dataset.e; })[0]); }; });
      qsa('[data-x]', el).forEach(function (b) { b.onclick = function () { Admin.call('de.pejabatDelete', { id: b.dataset.x }).then(muat).catch(function () {}); }; });
    }
    function form(p) {
      p = p || { aktif: true };
      var F = [{ k: 'nama', l: 'Nama', req: 1 }, { k: 'gelar', l: 'Gelar' }, { k: 'jabatan', l: 'Jabatan', req: 1 }, { k: 'nip', l: 'NIP/NIY' }, { k: 'email', l: 'Email Google', t: 'email', span: 1, help: 'Harus sama dengan akun yang dipakai login & terdaftar di Role & Pengguna.' },
               { k: 'mulai', l: 'Mulai menjabat', t: 'date' }, { k: 'selesai', l: 'Selesai menjabat', t: 'date' }, { k: 'spesimenId', l: 'Spesimen tanda tangan (PNG transparan, privat)', t: 'image', tujuan: 'privat', help2: 'Disimpan privat; hanya disisipkan server ke dokumen.' }, { k: 'aktif', l: 'Status', t: 'switch' }];
      var m = A.modal({ title: p.id ? 'Ubah Pejabat' : 'Tambah Pejabat', drawer: true, body: Admin.formHtml(F, p), foot: '<button class="btn btn-light" data-close>Batal</button><button class="btn" id="pjS">' + icon('save') + 'Simpan</button>' });
      var get = Admin.formBind(m.el, F, p);
      qs('#pjS', m.el).onclick = function () { var o = get(); o.id = p.id; Admin.call('de.pejabatSave', { pejabat: o }, { btn: this }).then(function () { m.close(); muat(); }).catch(function () {}); };
    }
    muat();
  }
  function tabMassal(el) {
    Promise.all([Api.post('de.templates', {}), Api.post('periode.list', {}), Api.post('de.antrean', {})]).then(function (rs) {
      var t = rs[0].data.filter(function (x) { return x.aktif; }), per = rs[1].data, q = rs[2].data;
      el.innerHTML = '<div class="split"><div><div class="info-strip">' + icon('info') + '<div>Membuat dokumen untuk banyak pendaftar sekaligus (mis. Surat Keterangan Diterima untuk semua status Diterima). Diproses ±20 dokumen tiap 5 menit di latar belakang — aman dari batas waktu Apps Script.</div></div>' +
        '<div class="grid-2"><div class="field"><label for="mT">Template</label><select class="select" id="mT">' + t.map(function (x) { return '<option value="' + esc(x.id) + '">' + esc(x.nama) + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label for="mP">Periode</label><select class="select" id="mP"><option value="">Semua</option>' + per.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.nama_periode) + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label for="mS">Status pendaftar</label><select class="select" id="mS"><option value="">Semua status</option>' + Admin.STATUS.map(function (s) { return '<option' + (s === 'Diterima' ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></div></div>' +
        '<button class="btn" id="mGo">' + icon('zap') + 'Masukkan ke Antrean</button><p class="help">Pendaftar yang sudah memiliki dokumen dari template yang sama dilewati.</p></div>' +
        '<div class="card card-pad"><h3 style="font-size:15px">Status Antrean</h3><dl class="dl"><dt>Menunggu</dt><dd>' + (q.hitung.MENUNGGU || 0) + '</dd><dt>Diproses</dt><dd>' + (q.hitung.PROSES || 0) + '</dd><dt>Selesai</dt><dd>' + (q.hitung.SELESAI || 0) + '</dd><dt>Gagal</dt><dd>' + (q.hitung.GAGAL || 0) + '</dd></dl>' +
        (q.galat.length ? '<div class="sec-title">Galat terakhir</div>' + q.galat.map(function (g) { return '<p class="help" style="margin:0 0 6px">' + esc(g.galat) + '</p>'; }).join('') : '') +
        '<button class="btn btn-sm btn-light" id="mProc" style="margin-top:12px"' + (q.hitung.MENUNGGU ? '' : ' disabled') + '>' + icon('zap', 'ico-sm') + 'Proses Sekarang</button></div></div>';
      qs('#mGo').onclick = function () { Admin.call('de.massal', { templateId: qs('#mT').value, periode_id: qs('#mP').value, status: qs('#mS').value }, { btn: this }).then(function () { tabMassal(el); }).catch(function () {}); };
      qs('#mProc').onclick = function () { Admin.call('de.antreanProses', {}, { btn: this, busy: 'Memproses…' }).then(function () { tabMassal(el); }).catch(function () {}); };
    }).catch(function (e) { Admin.fail(el, e); });
  }

  /* =================== PERSETUJUAN SAYA (pejabat) =================== */
  Admin.page('persetujuan', {
    roles: Admin.ALL,
    render: function (view) {
      view.innerHTML = Admin.head('Persetujuan Saya', 'Setujui dokumen dengan PIN 6 digit. Superadmin dapat melakukan bypass dengan alasan (tercatat).') + '<div id="psB">' + Admin.skel(4, 60) + '</div>';
      function muat() { Api.post('de.menunggu', {}).then(function (r) { draw(r.data); }).catch(function (e) { Admin.fail(qs('#psB'), e, muat); }); }
      function draw(d) {
        Admin.setBadge('ttd', d.rows.length);
        var sa = Admin.user.role === 'superadmin';
        qs('#psB').innerHTML = (d.pejabat ? '<div class="card card-pad" style="margin-bottom:18px;display:flex;gap:14px;align-items:center;flex-wrap:wrap"><span class="ini" style="width:48px;height:48px">' + icon('pen') + '</span><div style="flex:1"><b>' + esc(d.pejabat.nama) + '</b><div class="muted" style="font-size:13px">' + (d.pejabat.adaPin ? 'PIN sudah diatur' : 'PIN belum diatur — atur sebelum menyetujui dokumen') + '</div></div><button class="btn btn-sm ' + (d.pejabat.adaPin ? 'btn-light' : '') + '" id="pinSet">' + icon('key', 'ico-sm') + (d.pejabat.adaPin ? 'Ganti PIN' : 'Atur PIN') + '</button></div>'
          : '<div class="info-strip">' + icon('info') + '<div>Akun Anda tidak terdaftar sebagai pejabat penanda tangan.' + (sa ? ' Sebagai superadmin, Anda dapat melihat semua dokumen yang menunggu dan melakukan bypass.' : '') + '</div></div>') +
          '<div class="card">' + (d.rows.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Dokumen</th><th>Diajukan</th><th>Penanda tangan</th><th></th></tr></thead><tbody>' + d.rows.map(function (x) {
            var slotSaya = x.ttd.filter(function (s) { return s.status === 'MENUNGGU' && d.pejabat && s.pejabatId === d.pejabat.id; })[0], slotAny = x.ttd.filter(function (s) { return s.status === 'MENUNGGU'; })[0];
            return '<tr><td><b>' + esc(x.judul) + '</b></td><td>' + esc(A.tglJam(x.dibuat)) + '</td><td style="font-size:13px">' + x.ttd.map(function (s) { return esc(s.label) + ': ' + esc(s.nama) + ' ' + (s.status === 'SETUJU' ? icon('check', 'ico-sm') : icon('clock', 'ico-sm')); }).join('<br>') + '</td>' +
              '<td class="row-act"><button class="btn btn-ghost btn-icon btn-sm" data-pv="' + esc(x.id) + '" aria-label="Pratinjau">' + icon('eye') + '</button>' + (slotSaya ? '<button class="btn btn-sm" data-ok="' + esc(x.id) + '" data-slot="' + slotSaya.slot + '">' + icon('pen', 'ico-sm') + 'Setujui</button>' : '') +
              (sa && slotAny ? '<button class="btn btn-sm btn-light" data-by="' + esc(x.id) + '" data-slot="' + slotAny.slot + '">Bypass</button>' : '') + '</td></tr>';
          }).join('') + '</tbody></table></div>' : Admin.empty('check-circle', 'Tidak ada dokumen menunggu', 'Semua dokumen sudah ditangani.')) + '</div>';
        var ps = qs('#pinSet'); if (ps) ps.onclick = function () { pin(d.pejabat.adaPin); };
        qsa('[data-pv]').forEach(function (b) { b.onclick = function () { pratinjauPdf({ id: b.dataset.pv }, b); }; });
        qsa('[data-ok]').forEach(function (b) {
          b.onclick = function () {
            var m = A.modal({ title: 'Setujui dokumen', body: '<p class="muted">Masukkan PIN 6 digit Anda.</p><input class="input mono" id="pinIn" inputmode="numeric" maxlength="6" autocomplete="one-time-code" style="font-size:24px;letter-spacing:.4em;text-align:center"><div class="field" style="margin-top:12px"><label for="pinCat">Catatan (opsional)</label><input class="input" id="pinCat"></div>', foot: '<button class="btn btn-light" data-close>Batal</button><button class="btn" id="pinGo">' + icon('pen') + 'Setujui & Tanda Tangani</button>' });
            qs('#pinGo', m.el).onclick = function () { Admin.call('de.setujui', { id: b.dataset.ok, slot: +b.dataset.slot, pin: qs('#pinIn', m.el).value, catatan: qs('#pinCat', m.el).value }, { btn: this, busy: 'Memproses…' }).then(function () { m.close(); muat(); }).catch(function () {}); };
          };
        });
        qsa('[data-by]').forEach(function (b) { b.onclick = function () { A.confirmDlg({ title: 'Bypass persetujuan?', danger: true, text: 'Bypass tercatat di Audit Log dan tampil di halaman verifikasi.', ok: 'Bypass', input: { label: 'Alasan (wajib)', placeholder: 'Mis. Pejabat sedang dinas luar, sudah setuju via telepon' } }).then(function (a) { if (a) Admin.call('de.setujui', { id: b.dataset.by, slot: +b.dataset.slot, bypass: true, catatan: a }, { busy: 'Memproses…' }).then(muat).catch(function () {}); }); }; });
      }
      function pin(ganti) {
        var m = A.modal({ title: ganti ? 'Ganti PIN' : 'Atur PIN', body: (ganti ? '<div class="field"><label for="pL">PIN lama</label><input class="input mono" id="pL" type="password" inputmode="numeric" maxlength="6"></div>' : '') + '<div class="field"><label for="pB">PIN baru (6 angka)</label><input class="input mono" id="pB" type="password" inputmode="numeric" maxlength="6"></div><div class="field"><label for="pU">Ulangi PIN</label><input class="input mono" id="pU" type="password" inputmode="numeric" maxlength="6"></div><p class="help">PIN disimpan sebagai hash (SHA-256 + salt). Salah 5 kali → terkunci 15 menit.</p>',
          foot: '<button class="btn btn-light" data-close>Batal</button><button class="btn" id="pS">' + icon('save') + 'Simpan PIN</button>' });
        qs('#pS', m.el).onclick = function () { Admin.call('de.pinSet', { pin: qs('#pB', m.el).value, ulang: qs('#pU', m.el).value, pinLama: qs('#pL', m.el) ? qs('#pL', m.el).value : '' }, { btn: this }).then(function () { m.close(); muat(); }).catch(function () {}); };
      }
      muat();
    }
  });

  /* =================== PENGATURAN =================== */
  Admin.page('pengaturan', {
    roles: Admin.ALL,
    render: function (view, r) {
      var sa = Admin.user.role === 'superadmin', tab = r.q.tab || 'identitas';
      var tabs = [['identitas', 'Identitas Sekolah', 'building'], ['tampilan', 'Tampilan', 'palette'], ['dummy', 'Data Dummy', 'trash']].concat(sa ? [['migrasi', 'Import / Migrasi', 'database'], ['sistem', 'Sistem & Performa', 'zap']] : []);
      view.innerHTML = Admin.head('Pengaturan', 'Identitas, tampilan, data dummy, dan sistem. Perubahan langsung berlaku di seluruh halaman.') +
        '<div class="card"><div class="tabs" style="padding:0 12px">' + tabs.map(function (t) { return '<button data-tab="' + t[0] + '" class="' + (t[0] === tab ? 'active' : '') + '">' + icon(t[2], 'ico-sm') + t[1] + '</button>'; }).join('') + '</div><div class="card-b" id="sB">' + Admin.skel(4) + '</div></div>';
      qsa('[data-tab]').forEach(function (b) { b.onclick = function () { tab = b.dataset.tab; qsa('[data-tab]').forEach(function (x) { x.classList.toggle('active', x === b); }); show(); }; });
      function show() { var el = qs('#sB'); el.innerHTML = Admin.skel(4); ({ identitas: tIdent, tampilan: tTampil, dummy: tDummy, migrasi: tMig, sistem: tSis })[tab](el); }
      show();
    }
  });
  function simpanSet(o, btn) { return Admin.call('settings.save', { settings: o }, { btn: btn }).then(function () { A.Store.clearPrefix('swr:pub'); Admin.load('settings.get', {}, function (s) { Admin.settings = s; A.applyBrand(s); }, { force: true }).catch(function () {}); }); }
  function tIdent(el) {
    Api.post('settings.get', {}).then(function (r) {
      var s = r.data, stat = (s.statistik || []).slice();
      var F = [{ k: 'nama_sekolah', l: 'Nama sekolah', req: 1 }, { k: 'nama_singkat', l: 'Nama singkat (layar HP)' }, { k: 'tagline', l: 'Tagline / slogan', span: 1 }, { k: 'deskripsi', l: 'Deskripsi singkat (footer & SEO)', t: 'textarea', rows: 3 },
               { k: 'yayasan', l: 'Nama yayasan' }, { k: 'tahun_berdiri', l: 'Tahun berdiri', max: 4 }, { k: 'jenjang', l: 'Jenjang (pisahkan koma)', help: 'Dipakai formulir bawaan periode baru.' }, { k: 'footer_teks', l: 'Teks footer' },
               { k: 'app_url', l: 'URL website (GitHub Pages)', span: 1, help: 'Untuk tautan cek status di email/WA dan QR dokumen. Terisi otomatis saat superadmin login dari website.' },
               { k: 'logo_id', l: 'Logo (PNG transparan, kosong = logo bawaan)', t: 'image', tujuan: 'branding' }];
      el.innerHTML = Admin.formHtml(F, s) + '<div class="sec-title">Angka statistik di hero (maks. 6)</div><div id="stRows"></div><button class="btn btn-sm btn-light" id="stAdd">' + icon('plus', 'ico-sm') + 'Tambah angka</button>' +
        '<div style="display:flex;justify-content:flex-end;margin-top:18px"><button class="btn" id="idS">' + icon('save') + 'Simpan Identitas</button></div>';
      var get = Admin.formBind(el, F, s);
      function drawStat() {
        qs('#stRows').innerHTML = stat.map(function (x, i) { return '<div style="display:flex;gap:8px;margin-bottom:8px"><input class="input" data-sn="' + i + '" value="' + esc(x.nilai) + '" placeholder="1.250+" style="max-width:140px"><input class="input" data-sl="' + i + '" value="' + esc(x.label) + '" placeholder="Santri Aktif"><button class="btn btn-ghost btn-icon" data-sx="' + i + '" aria-label="Hapus">' + icon('x') + '</button></div>'; }).join('');
        qsa('[data-sn]').forEach(function (e) { e.oninput = function () { stat[+e.dataset.sn].nilai = e.value; }; });
        qsa('[data-sl]').forEach(function (e) { e.oninput = function () { stat[+e.dataset.sl].label = e.value; }; });
        qsa('[data-sx]').forEach(function (b) { b.onclick = function () { stat.splice(+b.dataset.sx, 1); drawStat(); }; });
      }
      drawStat();
      qs('#stAdd').onclick = function () { if (stat.length < 6) { stat.push({ nilai: '', label: '' }); drawStat(); } };
      qs('#idS').onclick = function () { var o = get(); o.statistik = stat; simpanSet(o, this).catch(function () {}); };
    }).catch(function (e) { Admin.fail(el, e); });
  }
  function tTampil(el) {
    Api.post('settings.get', {}).then(function (r) {
      var s = r.data, p = s.warna_primer || '#0B2A5B', a = s.warna_aksen || '#F5B700', mode = s.mode_default || 'auto';
      el.innerHTML = '<div class="split"><div><div class="grid-2"><div class="field"><label for="cP">Warna primer</label><div style="display:flex;gap:10px"><input type="color" class="swatch" id="cP" value="' + esc(p) + '"><input class="input mono" id="cPh" value="' + esc(p) + '"></div></div>' +
        '<div class="field"><label for="cA">Warna aksen (tombol CTA)</label><div style="display:flex;gap:10px"><input type="color" class="swatch" id="cA" value="' + esc(a) + '"><input class="input mono" id="cAh" value="' + esc(a) + '"></div></div></div>' +
        '<div class="field"><span class="label">Mode tampilan bawaan pengunjung</span><div class="choices">' + [['auto', 'Ikuti perangkat'], ['light', 'Terang'], ['dark', 'Gelap']].map(function (o) { return '<label class="choice"><input type="radio" name="md" value="' + o[0] + '"' + (o[0] === mode ? ' checked' : '') + '>' + o[1] + '</label>'; }).join('') + '</div><div class="help">Pengunjung tetap bisa mengganti mode dengan tombol bulan/matahari.</div></div>' +
        '<button class="btn btn-light btn-sm" id="cRes">Kembalikan warna bawaan</button></div>' +
        '<div class="preview-mini" id="pvMini"><div class="pn"><img src="assets/logo-emblem.png" style="width:32px;height:32px"><b style="flex:1">' + esc(s.nama_sekolah) + '</b><span class="btn btn-sm btn-accent" style="pointer-events:none">Daftar</span></div><div class="pb"><h3 style="margin:0 0 8px">Pratinjau langsung</h3><p class="muted" style="font-size:13px">Tombol utama dan aksen mengikuti warna pilihan.</p><span class="btn btn-sm" style="pointer-events:none">Tombol Primer</span> <span class="btn btn-sm btn-outline" style="pointer-events:none">Sekunder</span></div></div></div>' +
        '<div style="display:flex;justify-content:flex-end;margin-top:18px"><button class="btn" id="tS">' + icon('save') + 'Simpan Tampilan</button></div>';
      function sync(src, dst) { qs(dst).value = qs(src).value; A.applyBrand({ warna_primer: qs('#cPh').value, warna_aksen: qs('#cAh').value }); }
      qs('#cP').oninput = function () { sync('#cP', '#cPh'); }; qs('#cA').oninput = function () { sync('#cA', '#cAh'); };
      qs('#cPh').oninput = function () { if (/^#[0-9a-f]{6}$/i.test(this.value)) sync('#cPh', '#cP'); }; qs('#cAh').oninput = function () { if (/^#[0-9a-f]{6}$/i.test(this.value)) sync('#cAh', '#cA'); };
      qs('#cRes').onclick = function () { qs('#cP').value = qs('#cPh').value = '#0B2A5B'; qs('#cA').value = qs('#cAh').value = '#F5B700'; sync('#cP', '#cPh'); };
      qs('#tS').onclick = function () { simpanSet({ warna_primer: qs('#cPh').value, warna_aksen: qs('#cAh').value, mode_default: qs('input[name=md]:checked').value }, this).catch(function () {}); };
    }).catch(function (e) { Admin.fail(el, e); });
  }
  function tDummy(el) {
    Api.post('dummy.info', {}).then(function (r) {
      var d = r.data;
      el.innerHTML = '<div class="danger-zone"><div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap"><span class="ini" style="width:48px;height:48px;background:var(--bad-bg);color:var(--bad)">' + icon('trash') + '</span><div style="flex:1;min-width:240px"><h3 style="margin:0 0 6px">Hapus Semua Data Dummy</h3>' +
        '<p class="muted" style="margin:0 0 10px;font-size:14px">Saat ini ada <b style="color:var(--ink)">' + A.angka(d.total) + ' baris data dummy</b> dan ' + d.gambar + ' gambar dummy. Hanya baris bertanda <span class="kbd">is_dummy = TRUE</span> yang dihapus; data asli tidak tersentuh.</p>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">' + Object.keys(d.per).map(function (k) { return '<span class="badge' + (d.per[k] ? '' : ' no-dot') + '">' + esc(k.replace(/_/g, ' ')) + ': ' + d.per[k] + '</span>'; }).join('') + '</div>' +
        (d.status && d.status !== 'aktif' ? '<p class="help">Status: ' + esc(d.status) + '</p>' : '') + '<button class="btn btn-danger" id="dPurge"' + (d.total ? '' : ' disabled') + '>' + icon('trash') + 'Hapus Semua Data Dummy</button></div></div></div><div id="dRes" style="margin-top:16px"></div>';
      qs('#dPurge').onclick = function () {
        var b = this;
        A.confirmDlg({ title: 'Hapus semua data dummy?', danger: true, html: 'Tindakan ini <b>tidak dapat dibatalkan</b>. Ketik <b>HAPUS DUMMY</b> untuk melanjutkan.', ok: 'Ya, hapus', input: { label: 'Konfirmasi', placeholder: 'HAPUS DUMMY', harus: 'HAPUS DUMMY' } }).then(function (k) {
          if (!k) return;
          A.loader('Menghapus data dummy di semua sheet…');
          Admin.call('dummy.purge', { konfirmasi: k }, { btn: b }).then(function (r2) {
            A.loader(false); A.Store.clearPrefix('swr:pub');
            qs('#dRes').innerHTML = '<div class="card card-pad"><h3 style="font-size:15px">' + icon('check-circle', 'ico-sm') + ' Hasil penghapusan</h3><div class="table-wrap"><table class="table res-table"><thead><tr><th>Bagian</th><th class="num">Baris terhapus</th></tr></thead><tbody>' + Object.keys(r2.data.per).map(function (x) { return '<tr><td>' + esc(x.replace(/_/g, ' ')) + '</td><td class="num">' + r2.data.per[x] + '</td></tr>'; }).join('') + '<tr><td><b>Total</b> (+ ' + r2.data.gambar + ' gambar)</td><td class="num"><b>' + r2.data.total + '</b></td></tr></tbody></table></div></div>';
            setTimeout(function () { tDummy(el); }, 4000);
          }).catch(function () { A.loader(false); });
        });
      };
    }).catch(function (e) { Admin.fail(el, e); });
  }
  function tMig(el) {
    Api.post('periode.list', {}).then(function (rp) {
      var SHEETS = ['Pengaturan', 'Hero', 'Keunggulan', 'Profil', 'Prestasi', 'Fasilitas', 'Berita', 'Kegiatan', 'Biaya', 'Kontak', 'Periode_PPDB', 'Form_Schema', 'Pendaftar', 'Template_Notifikasi', 'Pengguna', 'CRM_Kontak', 'CRM_Interaksi', 'Audit_Log'];
      el.innerHTML = '<div class="info-strip">' + icon('shield') + '<div>Spreadsheet lama <b>hanya dibaca</b> — tidak pernah diubah. Data dicocokkan berdasarkan nama kolom; import aman diulang (tanpa baris ganda). Gunakan <b>Pindai</b> dulu, lalu <b>Jalankan Import</b>. Jalankan sekali lagi tepat sebelum pindah (delta sync).</div></div>' +
        '<div class="seg" id="mgMode" style="margin-bottom:14px"><button class="active" data-m="app">Dari versi lama aplikasi ini</button><button data-m="form">Dari Google Form PPDB lama</button></div>' +
        '<div class="field"><label for="mgSrc">URL / ID spreadsheet lama</label><input class="input" id="mgSrc" placeholder="https://docs.google.com/spreadsheets/d/…"><div class="help">Harus bisa dibuka oleh akun Google pemilik Apps Script.</div></div><div id="mgOpt"></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-light" id="mgScan">' + icon('search') + 'Pindai (Dry-run)</button><button class="btn" id="mgRun">' + icon('database') + 'Jalankan Import</button></div><div id="mgRes" style="margin-top:16px"></div>';
      var mode = 'app';
      function opt() {
        qs('#mgOpt').innerHTML = mode === 'app' ? '<div class="field"><span class="label">Sheet yang diimpor</span><div class="pill-tog">' + SHEETS.map(function (s) { return '<label><input type="checkbox" data-sh="' + s + '"' + (s === 'Audit_Log' ? '' : ' checked') + '>' + s.replace(/_/g, ' ') + '</label>'; }).join('') + '</div></div><label class="choice" style="margin-bottom:14px"><input type="checkbox" id="mgOw">Timpa data yang sudah ada di aplikasi baru (default: hanya menambah & memperbarui status Baru)</label>'
          : '<div class="grid-2"><div class="field"><label for="mgSh">Nama sheet jawaban (kosong = sheet pertama)</label><input class="input" id="mgSh" placeholder="Form Responses 1"></div><div class="field"><label for="mgPer">Periode tujuan</label><select class="select" id="mgPer">' + rp.data.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.nama_periode) + '</option>'; }).join('') + '</select></div></div><p class="help">Kolom dicocokkan dengan label field formulir periode tujuan.</p>';
      }
      opt();
      qsa('#mgMode button').forEach(function (b) { b.onclick = function () { mode = b.dataset.m; qsa('#mgMode button').forEach(function (x) { x.classList.toggle('active', x === b); }); opt(); qs('#mgRes').innerHTML = ''; }; });
      function run(dry, btn) {
        var d = { source: qs('#mgSrc').value.trim(), dryRun: dry, mode: mode };
        if (mode === 'app') { d.sheets = qsa('[data-sh]').filter(function (c) { return c.checked; }).map(function (c) { return c.dataset.sh; }); d.overwrite = qs('#mgOw').checked; }
        else { d.sheetName = qs('#mgSh').value.trim(); d.periode_id = qs('#mgPer').value; }
        var go = function () {
          Admin.call('migrasi.import', d, { btn: btn, busy: dry ? 'Memindai…' : 'Mengimpor…' }).then(function (r) {
            var x = r.data;
            qs('#mgRes').innerHTML = '<div class="card card-pad"><h3 style="font-size:15px">' + (x.dryRun ? 'Hasil pindai (belum ditulis)' : 'Import selesai') + ' — ' + esc(x.source.name) + '</h3><div class="table-wrap"><table class="table res-table"><thead><tr><th>Data</th><th class="num">Di sumber</th><th class="num">Ditambah</th><th class="num">Diperbarui</th><th class="num">Dilewati</th></tr></thead><tbody>' +
              Object.keys(x.report).map(function (k) { var v = x.report[k]; return '<tr><td>' + esc(k.replace(/_/g, ' ')) + (v.info ? ' <span class="muted">(' + esc(v.info) + ')</span>' : '') + '</td><td class="num">' + v.source + '</td><td class="num">' + v.inserted + '</td><td class="num">' + v.updated + '</td><td class="num">' + v.skipped + '</td></tr>'; }).join('') + '</tbody></table></div>' +
              (x.warnings.length ? '<div class="sec-title">Peringatan</div>' + x.warnings.map(function (w) { return '<div class="info-strip warn" style="margin-bottom:6px">' + icon('alert-triangle') + '<div>' + esc(w) + '</div></div>'; }).join('') : '') + '</div>';
          }).catch(function () {});
        };
        if (!d.source) { A.toast('Tempel URL spreadsheet lama.', 'warn'); return; }
        if (dry) go(); else A.confirmDlg({ title: 'Jalankan import?', text: 'Data dari spreadsheet lama akan ditulis ke aplikasi baru.', ok: 'Jalankan' }).then(function (y) { if (y) go(); });
      }
      qs('#mgScan').onclick = function () { run(true, this); };
      qs('#mgRun').onclick = function () { run(false, this); };
    }).catch(function (e) { Admin.fail(el, e); });
  }
  function tSis(el) {
    Api.post('sistem.status', {}).then(function (r) {
      var s = r.data;
      el.innerHTML = '<div class="kpis">' + Admin.kpi('zap', 'Cache Beranda', s.cacheBeranda ? 'HANGAT' : 'dingin', s.warmLast ? 'Dipanaskan ' + A.relatif(s.warmLast.at) + ' (' + esc(s.warmLast.scope) + ')' : 'Belum dipanaskan') +
        Admin.kpi('clock', 'Trigger', s.trigger.length ? s.trigger.length + ' aktif' : 'TIDAK ADA', esc(s.trigger.join(', ') || 'Jalankan installTriggers()')) + Admin.kpi('mail', 'Sisa Kuota Email', s.kuotaEmail >= 0 ? A.angka(s.kuotaEmail) : '—', 'hari ini') +
        Admin.kpi('database', 'Script Properties', s.props + ' KB', 'dari 500 KB') + '</div>' +
        '<div class="split"><div class="card card-pad"><dl class="dl"><dt>Versi server</dt><dd>' + esc(s.versi) + '</dd><dt>Keep warm</dt><dd>' + esc(s.keepWarm) + '</dd><dt>Antrean notifikasi</dt><dd>' + (s.antrean ? 'Ada' : 'Kosong') + '</dd><dt>Google Client ID</dt><dd>' + (s.googleClientId ? 'Terpasang' : '<span style="color:var(--bad)">Belum diisi</span>') + '</dd><dt>Token Fonnte</dt><dd>' + (s.fonnte ? 'Terpasang' : 'Belum') + '</dd></dl>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px"><a class="btn btn-sm btn-light" href="' + esc(s.spreadsheetUrl) + '" target="_blank" rel="noopener">' + icon('grid', 'ico-sm') + 'Buka Spreadsheet</a>' + (s.driveUrl ? '<a class="btn btn-sm btn-light" href="' + esc(s.driveUrl) + '" target="_blank" rel="noopener">' + icon('external', 'ico-sm') + 'Folder Drive</a>' : '') + '<button class="btn btn-sm btn-light" id="flush">' + icon('refresh', 'ico-sm') + 'Bersihkan Cache</button></div></div>' +
        '<div class="card card-pad"><h3 style="font-size:15px">' + icon('sparkles', 'ico-sm') + ' Cara cepat tetap cepat</h3><ul style="padding-left:18px;font-size:13.5px;color:var(--ink-2);margin:0"><li>Data publik & menu admin di-cache dan diperbarui otomatis setiap ada perubahan.</li><li>Edit langsung di Google Sheets? Tekan ' + icon('refresh', 'ico-sm') + ' Segarkan di atas.</li><li>Trigger 1 menit memanaskan cache & mengirim antrean (±10–20 menit kuota trigger/hari).</li><li>Buka konsol peramban lalu ketik <span class="kbd">Perf.summary()</span> untuk melihat waktu respons.</li></ul></div></div>';
      qs('#flush').onclick = function () { Admin.call('cache.flush', {}, { btn: this }).then(function () { A.Store.clearPrefix('swr:'); tSis(el); }).catch(function () {}); };
    }).catch(function (e) { Admin.fail(el, e); });
  }

  /* =================== ROLE & PENGGUNA =================== */
  Admin.page('pengguna', {
    roles: Admin.ALL,
    render: function (view, r) {
      var sa = Admin.user.role === 'superadmin', tab = r.q.tab || 'pengguna';
      view.innerHTML = Admin.head('Role & Pengguna', 'Hanya akun Google yang terdaftar dan aktif yang dapat masuk ke dasbor.', '<button class="btn btn-sm" id="uAdd">' + icon('user-plus', 'ico-sm') + 'Tambah Pengguna</button>') +
        '<div class="grid-cards" style="margin-bottom:18px"><div class="card tcard"><div class="th"><span class="tic">' + icon('shield-check') + '</span><div><b>Superadmin</b><div class="muted" style="font-size:13px">Akses penuh: konten, PPDB, pendaftar, notifikasi, CRM, dokumen, pengaturan, pengguna.</div></div></div></div>' +
        '<div class="card tcard"><div class="th"><span class="tic">' + icon('user') + '</span><div><b>Admin (terbatas)</b><div class="muted" style="font-size:13px">Hanya Pengaturan dan Role & Pengguna (tidak dapat memberi peran superadmin).</div></div></div></div></div>' +
        '<div class="card"><div class="tabs" style="padding:0 12px"><button data-tab="pengguna" class="' + (tab === 'pengguna' ? 'active' : '') + '">' + icon('users', 'ico-sm') + 'Pengguna</button><button data-tab="audit" class="' + (tab === 'audit' ? 'active' : '') + '">' + icon('history', 'ico-sm') + 'Audit Log</button>' + (sa ? '<button data-tab="darurat" class="' + (tab === 'darurat' ? 'active' : '') + '">' + icon('key', 'ico-sm') + 'Akses Darurat</button>' : '') + '</div><div id="uB" class="card-b">' + Admin.skel(4) + '</div></div>';
      qsa('[data-tab]').forEach(function (b) { b.onclick = function () { tab = b.dataset.tab; qsa('[data-tab]').forEach(function (x) { x.classList.toggle('active', x === b); }); show(); }; });
      qs('#uAdd').onclick = function () { form(null); };
      function show() { var el = qs('#uB'); ({ pengguna: tUsers, audit: tAudit, darurat: tDar })[tab](el); }
      function tUsers(el) {
        Admin.load('users.list', {}, function (list) {
          if (tab !== 'pengguna') return;
          el.innerHTML = '<div class="table-wrap"><table class="table"><thead><tr><th>Pengguna</th><th>Email Google</th><th>Role</th><th>Aktif</th><th>Login terakhir</th><th></th></tr></thead><tbody>' + list.map(function (u) {
            var me = u.email === Admin.user.email;
            return '<tr><td><div class="cell-main"><span class="ini">' + esc(Admin.inisial(u.nama || u.email)) + '</span><div><b>' + esc(u.nama || '-') + (me ? ' <span class="badge b-gold no-dot">Anda</span>' : '') + '</b><span>Dibuat ' + esc(A.tgl(u.dibuat_pada, true)) + '</span></div></div></td><td style="font-size:13px">' + esc(u.email) + '</td>' +
              '<td><span class="badge ' + (u.role === 'superadmin' ? 'b-violet' : 'b-info') + '">' + (u.role === 'superadmin' ? 'Superadmin' : 'Admin') + '</span></td><td><label class="switch"><input type="checkbox" data-ak="' + esc(u.email) + '"' + (u.aktif ? ' checked' : '') + (me ? ' disabled' : '') + ' aria-label="Aktif"><span class="track"></span></label></td>' +
              '<td style="font-size:13px">' + esc(u.login_terakhir ? A.relatif(u.login_terakhir) : 'Belum pernah') + '</td><td class="row-act"><button class="btn btn-ghost btn-icon btn-sm" data-ue="' + esc(u.email) + '" aria-label="Ubah">' + icon('edit') + '</button>' + (me ? '' : '<button class="btn btn-ghost btn-icon btn-sm" data-ud="' + esc(u.email) + '" aria-label="Hapus">' + icon('trash') + '</button>') + '</td></tr>';
          }).join('') + '</tbody></table></div>';
          qsa('[data-ak]').forEach(function (c) { c.onchange = function () { var u = list.filter(function (x) { return x.email === c.dataset.ak; })[0]; Admin.call('users.save', { user: { email: u.email, nama: u.nama, role: u.role, aktif: c.checked } }).then(function () { tUsers(el); }).catch(function () { c.checked = !c.checked; }); }; });
          qsa('[data-ue]').forEach(function (b) { b.onclick = function () { form(list.filter(function (x) { return x.email === b.dataset.ue; })[0]); }; });
          qsa('[data-ud]').forEach(function (b) { b.onclick = function () { A.confirmDlg({ title: 'Hapus pengguna?', danger: true, text: b.dataset.ud + ' tidak dapat masuk lagi.', ok: 'Hapus' }).then(function (y) { if (y) Admin.call('users.delete', { email: b.dataset.ud }).then(function () { tUsers(el); }).catch(function () {}); }); }; });
        }).catch(function (e) { Admin.fail(el, e); });
      }
      function form(u) {
        var baru = !u; u = u || { role: 'admin', aktif: true };
        var opts = sa ? [{ v: 'admin', l: 'Admin (terbatas)' }, { v: 'superadmin', l: 'Superadmin' }] : [{ v: 'admin', l: 'Admin (terbatas)' }];
        var F = [{ k: 'email', l: 'Email Google', t: 'email', req: 1, span: 1 }, { k: 'nama', l: 'Nama' }, { k: 'role', l: 'Role', t: 'select', opts: opts }, { k: 'aktif', l: 'Status', t: 'switch' }];
        var m = A.modal({ title: baru ? 'Tambah Pengguna' : 'Ubah Pengguna', body: Admin.formHtml(F, u) + '<p class="help">Pengguna masuk dengan tombol "Masuk dengan Google" menggunakan email ini.</p>', foot: '<button class="btn btn-light" data-close>Batal</button><button class="btn" id="uS">' + icon('save') + 'Simpan</button>' });
        if (!baru) qs('#fx_email', m.el).disabled = true;
        var get = Admin.formBind(m.el, F, u);
        qs('#uS', m.el).onclick = function () { var o = get(); if (!baru) o.email = u.email; Admin.call('users.save', { user: o }, { btn: this }).then(function () { m.close(); tab = 'pengguna'; show(); }).catch(function () {}); };
      }
      function tAudit(el) {
        var st = { q: '', aksi: '', page: 1 };
        function muat() {
          Api.post('audit.list', st).then(function (r) {
            var d = r.data;
            el.innerHTML = '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><label class="search" style="position:relative;flex:1;min-width:200px">' + icon('search') + '<input class="input" id="aq" type="search" placeholder="Cari aktor, aksi, detail" value="' + esc(st.q) + '" style="padding-left:38px"></label><select class="select" id="aa" style="width:auto"><option value="">Semua aksi</option>' + d.aksi.map(function (a) { return '<option' + (a === st.aksi ? ' selected' : '') + '>' + esc(a) + '</option>'; }).join('') + '</select></div>' +
              '<div class="table-wrap"><table class="table"><thead><tr><th>Waktu</th><th>Aktor</th><th>Aksi</th><th>Entitas</th><th>Detail</th></tr></thead><tbody>' + d.rows.map(function (x) {
                var bahaya = /DARURAT|BYPASS|HAPUS|DITOLAK/.test(x.aksi);
                return '<tr' + (bahaya ? ' class="row-warn"' : '') + '><td style="white-space:nowrap;font-size:13px">' + esc(A.tglJam(x.waktu)) + '</td><td style="font-size:13px">' + esc(x.aktor) + '</td><td><span class="badge ' + (bahaya ? 'b-warn' : 'b-brand') + ' no-dot">' + esc(x.aksi) + '</span></td><td style="font-size:12.5px" class="muted">' + esc(x.entitas) + '</td><td style="font-size:12.5px;max-width:340px">' + esc(x.detail) + '</td></tr>';
              }).join('') + '</tbody></table></div>' + Admin.pager(d.total, d.page, d.per, function (p) { st.page = p; muat(); });
            var ss = el.querySelector('.search .ico'); if (ss) ss.style.cssText = 'position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted)';
            qs('#aq').addEventListener('change', function (e) { st.q = e.target.value; st.page = 1; muat(); });
            qs('#aa').onchange = function (e) { st.aksi = e.target.value; st.page = 1; muat(); };
          }).catch(function (e) { Admin.fail(el, e, muat); });
        }
        muat();
      }
      function tDar(el) {
        Api.post('darurat.info', {}).then(function (r) {
          var d = r.data;
          el.innerHTML = '<div class="split"><div><div class="info-strip warn">' + icon('alert-triangle') + '<div>Akses darurat dipakai hanya bila login Google bermasalah. Alamatnya <span class="kbd">admin.html#/darurat</span> tidak ditautkan dari mana pun. Kredensial disimpan sebagai hash di Script Properties.</div></div>' +
            '<dl class="dl"><dt>Status</dt><dd>' + (d.terkonfigurasi ? 'Terkonfigurasi' : '<span style="color:var(--bad)">Belum</span>') + '</dd><dt>Nama pengguna</dt><dd class="mono">' + esc(d.user || '—') + '</dd><dt>Terakhir digunakan</dt><dd>' + esc(d.terakhir ? A.tglJam(d.terakhir) : 'Belum pernah') + '</dd></dl>' +
            '<button class="btn" id="drRot" style="margin-top:16px">' + icon('key') + 'Ganti Kredensial Darurat</button></div><div class="card card-pad"><h3 style="font-size:15px">Keamanan</h3><ul style="padding-left:18px;font-size:13.5px;color:var(--ink-2);margin:0"><li>5 kali salah → terkunci 15 menit.</li><li>Setiap penggunaan tercatat di Audit Log (LOGIN_DARURAT).</li><li>Mengganti kredensial langsung membatalkan semua sesi darurat lama.</li></ul></div></div>';
          qs('#drRot').onclick = function () {
            var m = A.modal({ title: 'Ganti Kredensial Darurat', body: '<div class="field"><label for="dU">Nama pengguna baru</label><input class="input" id="dU" autocomplete="off"></div><div class="field"><label for="dP">Kata sandi baru (min. 10, huruf + angka)</label><input class="input" id="dP" type="password" autocomplete="new-password"></div><div class="field"><label for="dP2">Ulangi kata sandi</label><input class="input" id="dP2" type="password" autocomplete="new-password"></div>',
              foot: '<button class="btn btn-light" data-close>Batal</button><button class="btn" id="dS">' + icon('save') + 'Simpan</button>' });
            qs('#dS', m.el).onclick = function () { Admin.call('darurat.set', { user: qs('#dU', m.el).value, pass: qs('#dP', m.el).value, ulang: qs('#dP2', m.el).value }, { btn: this }).then(function () { m.close(); tDar(el); }).catch(function () {}); };
          };
        }).catch(function (e) { Admin.fail(el, e); });
      }
      show();
    }
  });
})();
