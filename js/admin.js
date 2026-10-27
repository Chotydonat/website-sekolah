/* =====================================================================
   admin.js — Inti dasbor: login (Google OAuth + akses darurat), shell
   (sidebar per peran, topbar), router, SWR + batch, komponen bersama
   (grafik SVG, unggah gambar, editor kaya, sortable, ekspor Excel, pratinjau berkas)
   ===================================================================== */
(function () {
  'use strict';
  var A = window.App, icon = A.icon, esc = A.esc, qs = A.qs, qsa = A.qsa, Api = A.Api;
  var SA = ['superadmin'], ALL = ['superadmin', 'admin'];
  var root = qs('#root');

  var Admin = window.Admin = {
    user: null, pages: {}, cur: null, badges: {}, settings: null,
    SA: SA, ALL: ALL,
    STATUS: ['Baru', 'Diverifikasi', 'Diterima', 'Ditolak', 'Cadangan'],
    STATUS_CLS: { Baru: 'b-info', Diverifikasi: 'b-violet', Diterima: 'b-ok', Ditolak: 'b-bad', Cadangan: 'b-warn' },
    STATUS_VAR: { Baru: '--info', Diverifikasi: '--violet', Diterima: '--ok', Ditolak: '--bad', Cadangan: '--warn' },
    page: function (id, def) { this.pages[id] = def; }
  };

  /* ---------------- navigasi ---------------- */
  var NAV = [
    { g: '', items: [{ id: 'ringkasan', t: 'Ringkasan', i: 'dashboard', r: SA }] },
    { g: 'Konten Website', items: [
      { id: 'konten/Hero', t: 'Hero / Slider', i: 'layout', r: SA }, { id: 'konten/Keunggulan', t: 'Keunggulan', i: 'star', r: SA },
      { id: 'konten/Profil', t: 'Profil', i: 'book-open', r: SA }, { id: 'konten/Prestasi', t: 'Prestasi', i: 'trophy', r: SA },
      { id: 'konten/Fasilitas', t: 'Fasilitas', i: 'building', r: SA }, { id: 'konten/Berita', t: 'Berita', i: 'file-text', r: SA },
      { id: 'konten/Kegiatan', t: 'Kegiatan', i: 'calendar', r: SA }, { id: 'konten/Biaya', t: 'Biaya', i: 'tag', r: SA },
      { id: 'konten/Kontak', t: 'Kontak & Peta', i: 'map-pin', r: SA }] },
    { g: 'PPDB', items: [{ id: 'periode', t: 'Periode', i: 'calendar', r: SA }, { id: 'form-builder', t: 'Form Builder', i: 'layers', r: SA },
      { id: 'pendaftar', t: 'Pendaftar', i: 'users', r: SA, badge: 'baru' }] },
    { g: 'Dokumen', items: [{ id: 'dokumen', t: 'Dokumen & TTD', i: 'file-text', r: SA }, { id: 'persetujuan', t: 'Persetujuan Saya', i: 'pen', r: ALL, badge: 'ttd' }] },
    { g: 'Komunikasi', items: [{ id: 'notifikasi', t: 'WhatsApp & Email', i: 'send', r: SA }, { id: 'template', t: 'Template Pesan', i: 'message', r: SA },
      { id: 'log', t: 'Log Pengiriman', i: 'inbox', r: SA, badge: 'gagal', badgeBad: true }, { id: 'blast', t: 'Blast WhatsApp', i: 'megaphone', r: SA },
      { id: 'crm', t: 'CRM Kontak', i: 'database', r: SA }] },
    { g: 'Sistem', items: [{ id: 'pengaturan', t: 'Pengaturan', i: 'settings', r: ALL }, { id: 'pengguna', t: 'Role & Pengguna', i: 'shield', r: ALL }] }
  ];
  function boleh(item) { return Admin.user && item.r.indexOf(Admin.user.role) >= 0; }
  function navItems() { var out = []; NAV.forEach(function (g) { g.items.forEach(function (i) { out.push(i); }); }); return out; }
  Admin.home = function () { return Admin.user && Admin.user.role === 'superadmin' ? 'ringkasan' : 'pengaturan'; };

  /* ---------------- data: SWR + batch ---------------- */
  /** Muat data baca: tampilkan cache lokal dulu, ambil dari server bila basi (30 dtk). */
  Admin.load = function (action, data, onData, opt) {
    opt = opt || {};
    var key = 'adm:' + (Admin.user ? Admin.user.email : '') + ':' + action + ':' + JSON.stringify(data || {});
    var fresh = Admin._fresh;
    return A.Swr.load(key, function () {
      var d = Object.assign({}, data || {}); if (fresh) d._fresh = true;
      return (opt.nobatch ? Api.post(action, d) : A.Batcher.add(action, d)).then(function (r) { return r.data; });
    }, { maxAge: opt.maxAge || 30000, force: fresh || opt.force, onData: onData });
  };
  /** Aksi tulis: tombol sibuk, toast, bersihkan cache lokal. */
  Admin.call = function (action, data, opt) {
    opt = opt || {};
    if (opt.btn) A.btnBusy(opt.btn, true, opt.busy);
    return Api.post(action, data || {}).then(function (r) {
      A.Store.clearPrefix('swr:adm:');
      if (opt.toast !== false && r.message) A.toast(r.message, 'ok');
      return r;
    }).catch(function (e) {
      if (opt.toast !== false && e.code !== 'AUTH') A.toast(e.message, 'bad', 7000);
      throw e;
    }).finally(function () { if (opt.btn) A.btnBusy(opt.btn, false); });
  };
  Admin.fail = function (el, e, retry) {
    if (!el) return;
    var id = 'rt' + Math.random().toString(36).slice(2);
    el.innerHTML = '<div class="empty"><div class="ico-wrap">' + icon('alert-triangle', 'ico-lg') + '</div><h3>Gagal memuat data</h3><p>' + esc(e.message) + '</p>' + (retry ? '<button class="btn btn-sm" id="' + id + '">' + icon('refresh') + 'Coba lagi</button>' : '') + '</div>';
    if (retry) qs('#' + id).onclick = retry;
  };

  /* ---------------- start & sesi ---------------- */
  Admin.start = function () {
    A.Theme.init();
    Api.onAuthFail = function () { if (Admin.user) { A.toast('Sesi berakhir. Silakan masuk kembali.', 'warn'); Admin.logout(true); } };
    if (!Api.configured()) { root.innerHTML = loginShell('<div class="login-note bad-note">' + icon('alert-triangle') + '<div>Isi <b>GAS_URL</b> di berkas <span class="kbd">js/config.js</span> dengan URL Web App Apps Script, lalu muat ulang halaman.</div></div>'); return; }
    Api.warm('admin');
    var tok = Api.token(), u = A.Store.json('ppdb_user', null);
    if (tok && u) { Admin.user = u; shell(); verifikasiSesi(); }
    else if (location.hash === '#/darurat') loginDarurat();
    else loginGoogle();
    window.addEventListener('hashchange', function () {
      if (!Admin.user) { if (location.hash === '#/darurat') loginDarurat(); else if (location.hash === '#/login' || !location.hash) loginGoogle(); return; }
      router();
    });
  };
  function verifikasiSesi() {
    A.Batcher.add('auth.me', {}).then(function (r) {
      var u = r.data.user;
      if (u.role !== Admin.user.role || u.nama !== Admin.user.nama) { Admin.user = Object.assign(Admin.user, u); A.Store.setJson('ppdb_user', Admin.user); shell(); }
    }).catch(function () {});
  }
  Admin.logout = function (diam) {
    var t = Api.token();
    if (t && !diam) Api.post('auth.logout', {}).catch(function () {});
    Api.setToken(''); A.Store.del('ppdb_user'); A.Store.clearPrefix('swr:adm:');
    Admin.user = null;
    try { if (window.google && google.accounts) google.accounts.id.disableAutoSelect(); } catch (e) {}
    location.hash = '#/login'; loginGoogle();
  };
  function masuk(r) {
    Api.setToken(r.data.token); Admin.user = r.data.user; A.Store.setJson('ppdb_user', Admin.user);
    A.toast(r.message || 'Berhasil masuk.', 'ok');
    location.hash = '#/' + Admin.home();
    shell();
    if (Admin.user.role === 'superadmin') aturAppUrl();
  }
  /** Isi otomatis URL website (untuk tautan di email/WA) bila masih kosong. */
  function aturAppUrl() {
    var base = location.href.split('#')[0].replace(/admin\.html.*$/, '').replace(/\?.*$/, '');
    if (!/^https:\/\//.test(base)) return;
    Api.post('settings.get', {}).then(function (r) { if (!r.data.app_url) Api.post('settings.save', { settings: { app_url: base } }).catch(function () {}); }).catch(function () {});
  }

  /* ---------------- login ---------------- */
  function loginShell(inner) {
    return '<div class="login-wrap"><div class="card login-card"><img class="lg" src="assets/logo-emblem.png" alt="">' + inner +
      '<p style="margin:22px 0 0"><a href="index.html">' + icon('arrow-left', 'ico-sm') + ' Kembali ke Beranda</a></p></div></div>';
  }
  function loginGoogle() {
    document.title = 'Masuk — Dasbor PPDB';
    root.innerHTML = loginShell('<h1>Masuk ke Dasbor</h1><p class="muted" style="margin:0">Gunakan akun Google yang telah didaftarkan superadmin.</p>' +
      '<div class="gbtn" id="gbtn"><span class="spinner-inline"></span></div><div id="lmsg"></div>' +
      '<div class="login-note">' + icon('shield') + '<div>Hanya email yang terdaftar dan aktif di menu <b>Role & Pengguna</b> yang dapat masuk. Token Google diverifikasi di server.</div></div>');
    Api.get('auth.config', {}, { publik: true }).then(function (r) {
      var cid = r.data.googleClientId;
      if (!cid) { qs('#gbtn').innerHTML = ''; qs('#lmsg').innerHTML = '<div class="login-note warn-note">' + icon('alert-triangle') + '<div>Login Google belum dikonfigurasi (GOOGLE_CLIENT_ID kosong). Ikuti panduan instalasi, atau gunakan akses darurat yang alamatnya dicatat superadmin.</div></div>'; return; }
      return A.loadScript('https://accounts.google.com/gsi/client').then(function () {
        google.accounts.id.initialize({ client_id: cid, callback: function (resp) { authGoogle(resp.credential); }, auto_select: false, cancel_on_tap_outside: true, ux_mode: 'popup' });
        qs('#gbtn').innerHTML = '';
        google.accounts.id.renderButton(qs('#gbtn'), { theme: A.Theme.current() === 'dark' ? 'filled_black' : 'filled_blue', size: 'large', shape: 'pill', text: 'signin_with', locale: 'id', width: 300 });
      });
    }).catch(function (e) { qs('#gbtn').innerHTML = ''; qs('#lmsg').innerHTML = '<div class="login-note bad-note">' + icon('alert-circle') + '<div>' + esc(e.message || 'Gagal memuat tombol Google.') + '</div></div>'; });
  }
  function authGoogle(cred) {
    qs('#lmsg').innerHTML = '<p class="muted">' + '<span class="spinner-inline"></span> Memverifikasi akun…</p>';
    Api.post('auth.google', { credential: cred }, { publik: true }).then(masuk).catch(function (e) {
      qs('#lmsg').innerHTML = '<div class="login-note bad-note">' + icon('alert-circle') + '<div>' + esc(e.message) + '</div></div>';
    });
  }
  function loginDarurat() {
    document.title = 'Akses Darurat';
    root.innerHTML = loginShell('<h1>Akses Darurat</h1><div class="login-note warn-note" style="margin:14px 0 18px">' + icon('alert-triangle') + '<div><b>Hanya digunakan bila login Google bermasalah.</b> Setiap penggunaan dicatat di Audit Log.</div></div>' +
      '<form id="dForm" style="text-align:left"><div class="field"><label for="du">Nama pengguna</label><input class="input" id="du" autocomplete="username" required></div>' +
      '<div class="field"><label for="dp">Kata sandi</label><div class="input-group"><input class="input" id="dp" type="password" autocomplete="current-password" required style="border-radius:11px 0 0 11px"><button type="button" class="btn btn-light btn-icon" id="eye" aria-label="Tampilkan kata sandi" style="border-radius:0 11px 11px 0">' + icon('eye') + '</button></div></div>' +
      '<div id="dmsg"></div><button class="btn btn-block btn-lg" id="dBtn">' + icon('unlock') + 'Masuk</button></form>');
    qs('#eye').onclick = function () { var p = qs('#dp'); p.type = p.type === 'password' ? 'text' : 'password'; this.innerHTML = icon(p.type === 'password' ? 'eye' : 'eye-off'); };
    qs('#dForm').onsubmit = function (e) {
      e.preventDefault();
      var b = qs('#dBtn'); A.btnBusy(b, true, 'Memeriksa…');
      Api.post('auth.darurat', { user: qs('#du').value, pass: qs('#dp').value }, { publik: true }).then(masuk).catch(function (er) {
        if (er.code === 'LOCKED') kunci(15 * 60);
        else qs('#dmsg').innerHTML = '<div class="login-note bad-note" style="margin:0 0 14px">' + icon('alert-circle') + '<div>' + esc(er.message) + '</div></div>';
      }).finally(function () { A.btnBusy(b, false); });
    };
    function kunci(dtk) {
      qsa('#dForm input, #dForm button').forEach(function (x) { x.disabled = true; });
      var el = qs('#dmsg'), t = setInterval(tick, 1000); tick();
      function tick() { if (dtk <= 0) { clearInterval(t); qsa('#dForm input, #dForm button').forEach(function (x) { x.disabled = false; }); el.innerHTML = ''; return; }
        el.innerHTML = '<div class="login-note bad-note" style="margin:0 0 14px">' + icon('lock') + '<div><b>Terkunci sementara.</b> Coba lagi dalam ' + Math.floor(dtk / 60) + ':' + String(dtk % 60).padStart(2, '0') + '</div></div>'; dtk--; }
    }
  }

  /* ---------------- shell ---------------- */
  function shell() {
    var u = Admin.user, ini = String(u.nama || u.email || '?').trim().split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
    var navHtml = NAV.map(function (g) {
      var items = g.items.filter(boleh);
      if (!items.length) return '';
      return (g.g ? '<div class="nav-g">' + esc(g.g) + '</div>' : '') + items.map(function (i) {
        return '<a class="nav-i" href="#/' + i.id + '" data-id="' + i.id + '">' + icon(i.i) + '<span>' + esc(i.t) + '</span>' + (i.badge ? '<span class="cnt hidden' + (i.badgeBad ? ' bad' : '') + '" data-badge="' + i.badge + '"></span>' : '') + '</a>';
      }).join('');
    }).join('');
    root.innerHTML = '<div class="shell"><aside class="side" id="side" aria-label="Menu dasbor"><a class="side-h" href="#/' + Admin.home() + '"><img src="assets/logo-emblem.png" alt="" id="sideLogo"><div><b id="sideName">Dasbor PPDB</b><span>' + (u.role === 'superadmin' ? 'Superadmin' : 'Admin') + (u.darurat ? ' · Darurat' : '') + '</span></div></a>' +
      '<nav>' + navHtml + '</nav><div class="side-f"><a class="nav-i" href="index.html" target="_blank" rel="noopener">' + icon('external') + '<span>Lihat Website</span></a><a class="nav-i" href="javascript:void 0" id="sideOut">' + icon('log-out') + '<span>Keluar</span></a></div></aside>' +
      '<div class="side-bd" id="sideBd"></div><div class="col"><header class="top"><button class="btn btn-ghost btn-icon btn-sm mob-only" id="burger" aria-label="Buka menu">' + icon('menu') + '</button>' +
      '<div class="tt"><div class="crumbs" id="crumbs"></div><h1 id="ptitle">Dasbor</h1></div><div class="top-act">' +
      '<button class="btn btn-ghost btn-icon btn-sm" id="refresh" title="Segarkan data dari Google Sheets" aria-label="Segarkan">' + icon('refresh') + '</button>' +
      '<button class="btn btn-ghost btn-icon btn-sm" data-theme-toggle aria-label="Ganti mode"></button>' +
      '<button class="umenu" id="umenu" aria-haspopup="menu"><span class="ava">' + esc(ini) + '</span><span class="un-wrap"><span class="un">' + esc(u.nama || u.email) + '</span><span class="ur">' + (u.role === 'superadmin' ? 'Superadmin' : 'Admin') + '</span></span>' + icon('chevron-down', 'ico-sm') + '</button></div></header>' +
      (u.darurat ? '<div class="info-strip warn" style="margin:12px 24px 0;border-radius:12px">' + icon('alert-triangle') + '<div>Anda masuk dengan <b>akses darurat</b>. Semua aktivitas dicatat. Segera pulihkan login Google di Pengaturan.</div></div>' : '') +
      '<main class="main" id="view" tabindex="-1"></main></div></div>';
    qs('#burger').onclick = function () { qs('#side').classList.add('open'); qs('#sideBd').classList.add('open'); };
    qs('#sideBd').onclick = tutupSide;
    qs('#sideOut').onclick = function () { A.confirmDlg({ title: 'Keluar dari dasbor?', text: 'Anda perlu masuk lagi untuk mengelola data.', ok: 'Keluar' }).then(function (y) { if (y) Admin.logout(); }); };
    qs('#refresh').onclick = function () { Admin._fresh = true; A.Store.clearPrefix('swr:adm:'); router(); setTimeout(function () { Admin._fresh = false; }, 1500); A.toast('Data dimuat ulang dari Google Sheets.', 'info'); };
    qs('#umenu').onclick = function (e) {
      e.stopPropagation();
      var dd = qs('.dropdown'); if (dd) { dd.remove(); return; }
      dd = document.createElement('div'); dd.className = 'dropdown'; dd.setAttribute('role', 'menu');
      dd.innerHTML = '<div style="padding:10px 12px;border-bottom:1px solid var(--line);margin-bottom:4px"><b style="font-size:14px">' + esc(u.nama || '') + '</b><div class="muted" style="font-size:12px;word-break:break-all">' + esc(u.email) + '</div></div>' +
        '<a href="#/persetujuan">' + icon('pen') + 'Persetujuan & PIN</a><a href="index.html" target="_blank" rel="noopener">' + icon('external') + 'Lihat Website</a><button id="ddOut">' + icon('log-out') + 'Keluar</button>';
      document.body.appendChild(dd);
      qs('#ddOut').onclick = function () { dd.remove(); Admin.logout(); };
      setTimeout(function () { document.addEventListener('click', function h() { dd.remove(); document.removeEventListener('click', h); }); }, 0);
    };
    document.addEventListener('click', function (e) { if (e.target.closest('[data-theme-toggle]')) A.Theme.toggle(); });
    A.Theme.sync();
    if (!location.hash || location.hash === '#/login' || location.hash === '#/darurat') location.hash = '#/' + Admin.home();
    router();
    muatBranding();
    if (u.role === 'superadmin') setTimeout(prefetch, 600);
  }
  function tutupSide() { var s = qs('#side'); if (s) s.classList.remove('open'); var b = qs('#sideBd'); if (b) b.classList.remove('open'); }
  function muatBranding() {
    Admin.load('settings.get', {}, function (s) {
      Admin.settings = s; A.applyBrand(s);
      if (s.nama_singkat || s.nama_sekolah) { qs('#sideName').textContent = s.nama_singkat || s.nama_sekolah; document.title = 'Dasbor — ' + (s.nama_singkat || s.nama_sekolah); }
      if (s.logo_id) qs('#sideLogo').src = A.thumb(s.logo_id, 120);
    }, { maxAge: 300000 }).catch(function () {});
  }
  /** Prefetch menu inti di waktu luang → 1 eksekusi batch (gas-scale-turbo). */
  function prefetch() {
    var run = function () { ['periode.list', 'users.list'].forEach(function (a) { Admin.load(a, {}).catch(function () {}); }); updateBadges(); };
    (window.requestIdleCallback || setTimeout)(run, { timeout: 1500 });
  }
  function updateBadges() {
    if (Admin.user.role !== 'superadmin') return;
    Admin.load('dash.summary', {}, function (d) { setBadge('baru', d.perStatus && d.perStatus.Baru); setBadge('gagal', d.notif ? d.notif.email.gagal + d.notif.wa.gagal : 0); }).catch(function () {});
  }
  function setBadge(k, n) { qsa('[data-badge="' + k + '"]').forEach(function (b) { b.textContent = n > 99 ? '99+' : n; b.classList.toggle('hidden', !n); }); }
  Admin.setBadge = setBadge;

  /* ---------------- router ---------------- */
  function router() {
    if (!Admin.user) return;
    var h = (location.hash || '').replace(/^#\/?/, ''), parts = h.split('?'), path = parts[0], seg = path.split('/');
    var q = {}; (parts[1] || '').split('&').forEach(function (kv) { if (kv) { var p = kv.split('='); q[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); } });
    var item = navItems().filter(function (i) { return i.id === path; })[0] || navItems().filter(function (i) { return i.id === seg[0]; })[0];
    var pid = seg[0] === 'konten' ? 'konten' : seg[0];
    var def = Admin.pages[pid];
    tutupSide();
    qsa('.nav-i').forEach(function (a) { a.classList.toggle('active', a.dataset.id === path || (a.dataset.id === seg[0] && !path.indexOf(seg[0]))); });
    var view = qs('#view');
    if (!def) { location.hash = '#/' + Admin.home(); return; }
    if (def.roles && def.roles.indexOf(Admin.user.role) < 0) {
      setTitle('Akses ditolak', []);
      view.innerHTML = '<div class="empty card" style="max-width:520px;margin:40px auto"><div class="ico-wrap">' + icon('lock', 'ico-lg') + '</div><h3>Anda tidak memiliki akses ke halaman ini</h3><p>Peran <b>' + esc(Admin.user.role) + '</b> hanya dapat membuka Pengaturan dan Role & Pengguna.</p><a class="btn" href="#/' + Admin.home() + '">Ke ' + (Admin.home() === 'pengaturan' ? 'Pengaturan' : 'Ringkasan') + '</a></div>';
      return;
    }
    Admin.cur = pid;
    clearInterval(Admin._poll);
    view.innerHTML = '';
    setTitle((item && item.t) || def.title || '', def.crumbs || (item ? [grupDari(item.id)] : []));
    def.render(view, { seg: seg, q: q, path: path });
    window.scrollTo(0, 0);
  }
  function grupDari(id) { var g = ''; NAV.forEach(function (x) { if (x.items.some(function (i) { return i.id === id; })) g = x.g; }); return g; }
  function setTitle(t, crumbs) {
    qs('#ptitle').textContent = t;
    qs('#crumbs').innerHTML = ['Dasbor'].concat(crumbs.filter(String)).map(esc).join(icon('chevron-right'));
  }
  Admin.setTitle = setTitle;
  Admin.go = function (h) { location.hash = '#/' + h; };
  Admin.reload = router;

  /* =================================================================
     KOMPONEN BERSAMA
     ================================================================= */
  Admin.head = function (judul, sub, acts) {
    return '<div class="pgh"><div><h2>' + esc(judul) + '</h2>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (acts ? '<div class="acts">' + acts + '</div>' : '') + '</div>';
  };
  Admin.badgeStatus = function (s) { return '<span class="badge ' + (Admin.STATUS_CLS[s] || '') + '">' + esc(s) + '</span>'; };
  Admin.inisial = function (n) { return String(n || '?').trim().split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase(); };
  Admin.pager = function (total, page, per, onGo) {
    var n = Math.max(1, Math.ceil(total / per)), id = 'pg' + Math.random().toString(36).slice(2);
    var nums = [], s = Math.max(1, page - 2), e = Math.min(n, s + 4); s = Math.max(1, e - 4);
    for (var i = s; i <= e; i++) nums.push(i);
    setTimeout(function () { qsa('#' + id + ' button[data-p]').forEach(function (b) { b.onclick = function () { onGo(+b.dataset.p); }; }); }, 0);
    return '<div class="pager" id="' + id + '"><span>Menampilkan ' + (total ? ((page - 1) * per + 1) + '–' + Math.min(total, page * per) : 0) + ' dari ' + A.angka(total) + '</span><div class="pg">' +
      '<button data-p="' + (page - 1) + '" ' + (page <= 1 ? 'disabled' : '') + ' aria-label="Sebelumnya">‹</button>' + nums.map(function (x) { return '<button data-p="' + x + '" class="' + (x === page ? 'active' : '') + '">' + x + '</button>'; }).join('') +
      '<button data-p="' + (page + 1) + '" ' + (page >= n ? 'disabled' : '') + ' aria-label="Berikutnya">›</button></div></div>';
  };
  Admin.empty = function (ic, judul, teks, aksi) {
    return '<div class="empty"><div class="ico-wrap">' + icon(ic, 'ico-lg') + '</div><h3>' + esc(judul) + '</h3>' + (teks ? '<p>' + teks + '</p>' : '') + (aksi || '') + '</div>';
  };
  Admin.skel = function (n, h) { var s = ''; for (var i = 0; i < (n || 4); i++) s += '<div class="sk" style="height:' + (h || 48) + 'px;margin:10px 16px"></div>'; return s; };
  Admin.cssVar = function (v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#0B2A5B'; };

  /* ---------- grafik SVG ringan (tanpa pustaka) ---------- */
  Admin.lineChart = function (el, pts, opt) {
    opt = opt || {};
    function draw() {
      var W = el.clientWidth || 600, H = el.clientHeight || 260, m = { l: 34, r: 12, t: 14, b: 28 };
      var w = W - m.l - m.r, h = H - m.t - m.b, n = pts.length;
      var max = Math.max.apply(null, pts.map(function (p) { return p.value; }).concat([1]));
      var step = Math.pow(10, Math.floor(Math.log10(max))), nice = Math.ceil(max / step) * step; if (nice / step < 3) nice = Math.ceil(max / (step / 2)) * (step / 2); max = Math.max(nice, 4);
      var x = function (i) { return m.l + (n < 2 ? w / 2 : i * w / (n - 1)); }, y = function (v) { return m.t + h - v / max * h; };
      var brand = Admin.cssVar('--brand-text') || '#0B2A5B', acc = Admin.cssVar('--accent');
      var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.value).toFixed(1); }).join(' ');
      var area = line + ' L' + x(n - 1).toFixed(1) + ' ' + (m.t + h) + ' L' + x(0).toFixed(1) + ' ' + (m.t + h) + ' Z';
      var gid = 'g' + Math.random().toString(36).slice(2), grid = '', ax = '';
      for (var k = 0; k <= 4; k++) { var v = max * k / 4, yy = y(v); grid += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + yy + '" y2="' + yy + '"/>'; ax += '<text x="' + (m.l - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + Math.round(v) + '</text>'; }
      var every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(w / 70))));
      pts.forEach(function (p, i) { if (i % every === 0 || i === n - 1) ax += '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="middle">' + esc(p.short || p.label) + '</text>'; });
      var dots = pts.map(function (p, i) { return p.value ? '<circle cx="' + x(i) + '" cy="' + y(p.value) + '" r="3" fill="' + brand + '"/>' : ''; }).join('');
      el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opt.label || 'Grafik') + '"><defs><linearGradient id="' + gid + '" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="' + acc + '" stop-opacity=".35"/><stop offset="1" stop-color="' + acc + '" stop-opacity="0"/></linearGradient></defs>' +
        '<g class="grid">' + grid + '</g><path d="' + area + '" fill="url(#' + gid + ')"/><path d="' + line + '" fill="none" stroke="' + brand + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' + dots +
        '<line class="hl" x1="0" x2="0" y1="' + m.t + '" y2="' + (m.t + h) + '" stroke="' + acc + '" stroke-width="1.5" opacity="0"/><circle class="hd" r="5.5" fill="' + acc + '" stroke="#fff" stroke-width="2" opacity="0"/><g class="axis">' + ax + '</g><rect x="' + m.l + '" y="' + m.t + '" width="' + w + '" height="' + h + '" fill="transparent" class="hit"/></svg><div class="tip"></div>';
      var svg = el.querySelector('svg'), tip = el.querySelector('.tip'), hl = el.querySelector('.hl'), hd = el.querySelector('.hd');
      function show(ev) {
        var r = svg.getBoundingClientRect(), px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left, sx = px * W / r.width;
        var i = Math.max(0, Math.min(n - 1, Math.round((sx - m.l) / (w / Math.max(1, n - 1)))));
        hl.setAttribute('x1', x(i)); hl.setAttribute('x2', x(i)); hl.setAttribute('opacity', '1');
        hd.setAttribute('cx', x(i)); hd.setAttribute('cy', y(pts[i].value)); hd.setAttribute('opacity', '1');
        tip.style.left = (x(i) * r.width / W) + 'px'; tip.style.top = (y(pts[i].value) * r.height / H) + 'px'; tip.style.opacity = '1';
        tip.textContent = pts[i].label + ': ' + pts[i].value + (opt.unit || '');
      }
      function hide() { tip.style.opacity = '0'; hl.setAttribute('opacity', '0'); hd.setAttribute('opacity', '0'); }
      var hit = el.querySelector('.hit'); hit.addEventListener('mousemove', show); hit.addEventListener('touchstart', show, { passive: true }); hit.addEventListener('mouseleave', hide);
    }
    draw();
    var ro = window.ResizeObserver ? new ResizeObserver(A.debounce(function () { if (document.body.contains(el)) draw(); else ro.disconnect(); }, 150)) : null;
    if (ro) ro.observe(el);
    document.addEventListener('themechange', function h() { if (document.body.contains(el)) draw(); else document.removeEventListener('themechange', h); });
  };
  Admin.donut = function (el, items, opt) {
    opt = opt || {};
    var total = items.reduce(function (a, b) { return a + b.value; }, 0), R = 60, C = 2 * Math.PI * R, off = 0;
    var arcs = items.filter(function (i) { return i.value; }).map(function (i) {
      var len = i.value / Math.max(total, 1) * C, s = '<circle r="' + R + '" cx="80" cy="80" fill="none" stroke="' + i.color + '" stroke-width="22" stroke-dasharray="' + len + ' ' + (C - len) + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 80 80)"><title>' + esc(i.label) + ': ' + i.value + '</title></circle>';
      off += len; return s;
    }).join('');
    el.innerHTML = '<div class="donut-wrap"><svg viewBox="0 0 160 160" width="170" height="170" role="img" aria-label="' + esc(opt.label || 'Komposisi') + '"><circle r="' + R + '" cx="80" cy="80" fill="none" stroke="var(--surface-2)" stroke-width="22"/>' + arcs +
      '<text x="80" y="78" text-anchor="middle" style="font:700 26px var(--font);fill:var(--ink)">' + A.angka(total) + '</text><text x="80" y="98" text-anchor="middle" style="font:500 11px var(--font);fill:var(--muted)">' + esc(opt.center || 'Total') + '</text></svg>' +
      '<div class="legend">' + items.map(function (i) { return '<div class="li"><span class="sw" style="background:' + i.color + '"></span>' + esc(i.label) + '<b>' + A.angka(i.value) + '</b><span class="muted" style="font-size:12px;width:40px;text-align:right">' + (total ? Math.round(i.value / total * 100) : 0) + '%</span></div>'; }).join('') + '</div></div>';
  };

  /* ---------- ekspor Excel (SheetJS dari cdnjs; cadangan CSV) ---------- */
  Admin.exportXlsx = function (sheets, nama) {
    return A.loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js').then(function () {
      var wb = XLSX.utils.book_new();
      sheets.forEach(function (s) {
        var ws = XLSX.utils.aoa_to_sheet([s.kolom].concat(s.rows));
        ws['!cols'] = s.kolom.map(function (k, i) { var mx = String(k).length; s.rows.slice(0, 200).forEach(function (r) { mx = Math.max(mx, String(r[i] == null ? '' : r[i]).length); }); return { wch: Math.min(48, mx + 2) }; });
        ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: s.rows.length, c: s.kolom.length - 1 } }) };
        XLSX.utils.book_append_sheet(wb, ws, s.nama.substring(0, 31));
      });
      XLSX.writeFile(wb, nama + '.xlsx');
      return 'xlsx';
    }).catch(function () {
      var s = sheets[0], csv = [s.kolom].concat(s.rows).map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); return /[",\n;]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\n');
      A.unduhBlob(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }), nama + '.csv');
      A.toast('Pustaka Excel tidak dapat dimuat — diekspor sebagai CSV (bisa dibuka di Excel).', 'warn');
      return 'csv';
    });
  };

  /* ---------- pratinjau berkas privat (modal) ---------- */
  Admin.previewFile = function (fileId, judul) {
    var m = A.modal({ title: judul || 'Pratinjau berkas', size: 'xwide', body: '<div class="preview-box" id="pvb"><span class="spinner-inline"></span></div>', foot: '<button class="btn btn-light" data-close>Tutup</button><button class="btn" id="pvDl" disabled>' + icon('download') + 'Unduh</button>' });
    Api.post('file.get', { id: fileId }).then(function (r) { tampil(r.data); }).catch(function (e) { qs('#pvb', m.el).innerHTML = '<p class="muted" style="padding:20px">' + esc(e.message) + '</p>'; });
    function tampil(d) {
      var box = qs('#pvb', m.el);
      if (d.besar) { box.innerHTML = '<div class="empty"><p>Berkas terlalu besar untuk pratinjau.</p><a class="btn" target="_blank" rel="noopener" href="' + esc(d.url) + '">Buka di Google Drive</a></div>'; return; }
      var blob = A.b64ToBlob(d.data, d.mime), url = URL.createObjectURL(blob);
      if (/^image\//.test(d.mime)) box.innerHTML = '<img src="' + url + '" alt="' + esc(d.nama) + '">';
      else if (d.mime === 'application/pdf') box.innerHTML = '<iframe src="' + url + '" title="' + esc(d.nama) + '"></iframe>';
      else box.innerHTML = '<div class="empty"><div class="ico-wrap">' + icon('file', 'ico-lg') + '</div><p>' + esc(d.nama) + '</p></div>';
      var dl = qs('#pvDl', m.el); dl.disabled = false; dl.onclick = function () { A.unduhBlob(blob, d.nama); };
    }
  };
  Admin.downloadB64 = function (d) { A.unduhBlob(A.b64ToBlob(d.data, d.mime), d.nama); };

  /* ---------- unggah gambar (kompres → Drive → thumbnail) ---------- */
  Admin.imageUploader = function (el, opt) {
    opt = opt || {};
    var cur = opt.value || '';
    function draw() {
      el.innerHTML = '<div class="imgup"><div class="iv">' + (cur ? A.media(cur, 'image', 400, '', 'iv-th') : '<div class="thumb pattern" style="width:100%;height:100%;border-radius:10px"><div class="ph">' + icon('image') + '</div></div>') + '</div>' +
        '<div class="ia"><div style="display:flex;gap:6px;flex-wrap:wrap"><label class="btn btn-sm btn-light" style="cursor:pointer">' + icon('upload', 'ico-sm') + (cur ? 'Ganti' : 'Unggah') + '<input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only"></label>' +
        (cur ? '<button type="button" class="btn btn-sm btn-ghost" data-rm>' + icon('trash', 'ico-sm') + 'Hapus</button>' : '') + '</div>' +
        '<span class="help">' + esc(opt.help || 'JPG/PNG/WebP · maks 5 MB · dikompres otomatis') + '</span><div class="up-st help"></div></div></div>';
      el.querySelector('.iv-th') && (el.querySelector('.iv-th').style.cssText = 'width:100%;height:100%;border-radius:10px');
      el.querySelector('input[type=file]').onchange = function (e) { var f = e.target.files[0]; if (f) unggah(f); };
      var rm = el.querySelector('[data-rm]'); if (rm) rm.onclick = function () { cur = ''; draw(); if (opt.onChange) opt.onChange(''); };
    }
    function unggah(f) {
      var st = el.querySelector('.up-st'); st.innerHTML = '<span class="spinner-inline"></span> Mengompres & mengunggah…';
      A.compressImage(f, opt.maxW || 1600, 0.82).then(function (fl) {
        if (fl.size > 5 * 1048576) throw new Error('Ukuran gambar maksimal 5 MB.');
        return A.fileToBase64(fl).then(function (b64) { return Api.post('upload.image', { nama: fl.name, mime: fl.type, data: b64, tujuan: opt.tujuan || 'konten' }); });
      }).then(function (r) { cur = r.data.id; draw(); if (opt.onChange) opt.onChange(cur); A.toast(r.message, r.data.publik === false && opt.tujuan !== 'privat' ? 'warn' : 'ok'); })
        .catch(function (e) { st.innerHTML = '<span style="color:var(--bad)">' + esc(e.message) + '</span>'; });
    }
    draw();
    return { get: function () { return cur; } };
  };

  /* ---------- editor teks kaya (contenteditable) ---------- */
  Admin.richEditor = function (el, html) {
    el.innerHTML = '<div class="rte"><div class="rte-bar" role="toolbar" aria-label="Format teks">' +
      [['bold', '<b>B</b>', 'Tebal'], ['italic', '<i>I</i>', 'Miring'], ['underline', '<u>U</u>', 'Garis bawah'], ['h3', 'H', 'Subjudul'], ['p', '¶', 'Paragraf'],
       ['insertUnorderedList', '•', 'Daftar poin'], ['insertOrderedList', '1.', 'Daftar nomor'], ['link', icon('link', 'ico-sm'), 'Tautan'], ['removeFormat', icon('x', 'ico-sm'), 'Hapus format']]
        .map(function (b) { return '<button type="button" data-c="' + b[0] + '" title="' + b[2] + '" aria-label="' + b[2] + '">' + b[1] + '</button>'; }).join('') +
      '</div><div class="rte-ed rich" contenteditable="true" role="textbox" aria-multiline="true"></div></div>';
    var ed = el.querySelector('.rte-ed'); ed.innerHTML = html || '';
    qsa('[data-c]', el).forEach(function (b) {
      b.onmousedown = function (e) { e.preventDefault(); };
      b.onclick = function () {
        var c = b.dataset.c; ed.focus();
        if (c === 'h3' || c === 'p') document.execCommand('formatBlock', false, c);
        else if (c === 'link') { var sel = window.getSelection(), rng = sel.rangeCount ? sel.getRangeAt(0) : null; A.confirmDlg({ title: 'Sisipkan tautan', ok: 'Sisipkan', input: { label: 'Alamat (URL)', placeholder: 'https://' } }).then(function (u) { if (!u) return; if (rng) { sel.removeAllRanges(); sel.addRange(rng); } if (!/^https?:\/\//.test(u)) u = 'https://' + u; document.execCommand('createLink', false, u); }); }
        else document.execCommand(c, false, null);
      };
    });
    ed.addEventListener('paste', function (e) {
      var h = e.clipboardData.getData('text/html'), t = e.clipboardData.getData('text/plain');
      e.preventDefault();
      if (h) {
        var doc = new DOMParser().parseFromString(h, 'text/html');
        qsa('style,script,meta,link,title', doc).forEach(function (n) { n.remove(); });
        qsa('*', doc.body).forEach(function (n) { Array.prototype.slice.call(n.attributes).forEach(function (a) { if (a.name !== 'href') n.removeAttribute(a.name); }); });
        qsa('span,font', doc.body).forEach(function (n) { n.replaceWith.apply(n, Array.prototype.slice.call(n.childNodes)); });
        document.execCommand('insertHTML', false, doc.body.innerHTML);
      } else document.execCommand('insertText', false, t);
    });
    return { get: function () { return ed.innerHTML.replace(/<p><br><\/p>/g, '').trim(); } };
  };

  /* ---------- pemilih ikon ---------- */
  Admin.ICON_PILIH = ['book-open', 'users', 'building', 'trophy', 'leaf', 'star', 'award', 'cap', 'monitor', 'book', 'moon', 'activity', 'flask', 'home', 'coffee', 'heart', 'shield-check', 'globe', 'zap', 'target', 'sparkles', 'clipboard', 'calendar', 'message', 'smartphone', 'palette'];
  Admin.iconPicker = function (el, val, onChange) {
    var cur = val || 'star';
    function draw() {
      el.innerHTML = '<div class="icon-pick" role="radiogroup" aria-label="Pilih ikon">' + Admin.ICON_PILIH.map(function (n) { return '<button type="button" role="radio" aria-checked="' + (n === cur) + '" data-n="' + n + '" class="' + (n === cur ? 'active' : '') + '" title="' + n + '">' + icon(n) + '</button>'; }).join('') + '</div>';
      qsa('[data-n]', el).forEach(function (b) { b.onclick = function () { cur = b.dataset.n; draw(); if (onChange) onChange(cur); }; });
    }
    draw();
    return { get: function () { return cur; } };
  };

  /* ---------- sortable (pointer: mouse & sentuh) ---------- */
  Admin.sortable = function (container, rowSel, onEnd) {
    var drag = null, ph = null;
    container.addEventListener('pointerdown', function (e) {
      var h = e.target.closest('.drag-h'); if (!h || !container.contains(h)) return;
      var row = h.closest(rowSel); if (!row) return;
      e.preventDefault(); drag = row; row.classList.add('dragging');
      h.setPointerCapture(e.pointerId);
      h.addEventListener('pointermove', move); h.addEventListener('pointerup', up, { once: true }); h.addEventListener('pointercancel', up, { once: true });
    });
    function move(e) {
      if (!drag) return;
      var el = document.elementFromPoint(e.clientX, e.clientY), over = el && el.closest(rowSel);
      qsa(rowSel, container).forEach(function (r) { r.classList.remove('drop-line'); });
      if (over && over !== drag && container.contains(over)) { over.classList.add('drop-line'); ph = over; } else ph = null;
      var r = container.getBoundingClientRect(); if (e.clientY < r.top + 40) window.scrollBy(0, -12); if (e.clientY > window.innerHeight - 40) window.scrollBy(0, 12);
    }
    function up(e) {
      e.target.removeEventListener('pointermove', move);
      if (!drag) return;
      drag.classList.remove('dragging');
      qsa(rowSel, container).forEach(function (r) { r.classList.remove('drop-line'); });
      if (ph) { var rows = qsa(rowSel, container); if (rows.indexOf(ph) > rows.indexOf(drag)) ph.after(drag); else ph.before(drag); if (onEnd) onEnd(qsa(rowSel, container), drag, ph); }
      drag = null; ph = null;
    }
  };

  /* ---------- formulir generik dari definisi kolom ---------- */
  /** fields: [{k, l, t:'text|textarea|rich|number|date|select|switch|image|icon|email|color', opts, req, help, span, ph}] */
  Admin.formHtml = function (fields, item) {
    item = item || {};
    return '<div class="grid-2">' + fields.map(function (f) {
      var v = item[f.k] === undefined ? (f.def === undefined ? '' : f.def) : item[f.k], id = 'fx_' + f.k, full = f.span || ['textarea', 'rich', 'image', 'icon'].indexOf(f.t) >= 0;
      var lab = '<label for="' + id + '">' + esc(f.l) + (f.req ? '<span class="req">*</span>' : '') + '</label>', inp;
      if (f.t === 'textarea') inp = '<textarea class="textarea" id="' + id + '" data-k="' + f.k + '" rows="' + (f.rows || 4) + '" placeholder="' + esc(f.ph || '') + '">' + esc(v) + '</textarea>';
      else if (f.t === 'select') inp = '<select class="select" id="' + id + '" data-k="' + f.k + '">' + (f.opts || []).map(function (o) { var val = typeof o === 'object' ? o.v : o, lb = typeof o === 'object' ? o.l : o; return '<option value="' + esc(val) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + esc(lb) + '</option>'; }).join('') + '</select>';
      else if (f.t === 'switch') { inp = '<label class="switch"><input type="checkbox" id="' + id + '" data-k="' + f.k + '"' + (v === false || v === 'false' ? '' : ' checked') + '><span class="track"></span><span>' + esc(f.on || 'Aktif') + '</span></label>'; lab = '<span class="label">' + esc(f.l) + '</span>'; }
      else if (f.t === 'rich' || f.t === 'image' || f.t === 'icon') inp = '<div id="' + id + '" data-k="' + f.k + '" data-t="' + f.t + '"></div>';
      else inp = '<input class="input" id="' + id + '" data-k="' + f.k + '" type="' + ({ number: 'number', date: 'date', email: 'email', color: 'text' }[f.t] || 'text') + '" value="' + esc(v) + '" placeholder="' + esc(f.ph || '') + '"' + (f.max ? ' maxlength="' + f.max + '"' : '') + '>';
      return '<div class="field' + (full ? ' span-2' : '') + '">' + lab + inp + (f.help ? '<div class="help">' + f.help + '</div>' : '') + '</div>';
    }).join('') + '</div>';
  };
  /** Pasang editor kaya/gambar/ikon pada form generik; kembalikan pengumpul nilai. */
  Admin.formBind = function (rootEl, fields, item) {
    var widgets = {};
    fields.forEach(function (f) {
      var el = qs('#fx_' + f.k, rootEl); if (!el) return;
      if (f.t === 'rich') widgets[f.k] = Admin.richEditor(el, item[f.k] || '');
      if (f.t === 'image') widgets[f.k] = Admin.imageUploader(el, { value: item[f.k] || '', tujuan: f.tujuan, help: f.help2 });
      if (f.t === 'icon') widgets[f.k] = Admin.iconPicker(el, item[f.k]);
    });
    return function () {
      var o = {};
      fields.forEach(function (f) {
        if (widgets[f.k]) { o[f.k] = widgets[f.k].get(); return; }
        var el = qs('#fx_' + f.k, rootEl); if (!el) return;
        o[f.k] = f.t === 'switch' ? el.checked : f.t === 'number' ? (el.value === '' ? '' : Number(el.value)) : el.value.trim();
      });
      return o;
    };
  };
})();
