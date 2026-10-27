/* =====================================================================
   public.js — Landing page SPA + formulir PPDB + cek status + verifikasi
   Rute (hash): #/  #/profil  #/berita  #/berita/:slug  #/daftar  #/sukses
                #/status  #/v/:kode     · anchor (#profil, #biaya …) = gulir ke section
   ===================================================================== */
(function () {
  'use strict';
  var A = window.App, icon = A.icon, esc = A.esc, qs = A.qs, qsa = A.qsa, Api = A.Api;
  var app = qs('#app');
  var S = { boot: null, berita: null, form: null };
  var SECTIONS = ['beranda', 'profil', 'prestasi', 'fasilitas', 'kegiatan', 'berita', 'biaya', 'pendaftaran', 'kontak'];
  var STATUS_IKON = { Baru: 'inbox', Diverifikasi: 'shield-check', Diterima: 'award', Ditolak: 'alert-circle', Cadangan: 'clock' };
  var STATUS_TEKS = { Baru: 'Pendaftaran diterima sistem dan menunggu verifikasi berkas.', Diverifikasi: 'Berkas Anda sudah diverifikasi panitia.',
    Diterima: 'Selamat! Anda dinyatakan diterima.', Ditolak: 'Mohon maaf, pendaftaran belum dapat diterima.', Cadangan: 'Anda masuk daftar cadangan.' };

  /* ---------------- data dasar ---------------- */
  function logoSrc(s, gelap) { return s && s.logo_id ? A.thumb(s.logo_id, 240) : (gelap ? 'assets/logo-emblem.png' : 'assets/logo-emblem.png'); }
  function set() { return (S.boot && S.boot.settings) || {}; }
  function kontak() { return (S.boot && S.boot.kontak) || {}; }
  function namaSekolah() { return set().nama_sekolah || 'Profil Sekolah'; }

  function muatBoot(force) {
    return A.Swr.load('pub_boot', function () { return Api.get('pub.bootstrap').then(function (r) { return r.data; }); },
      { maxAge: 60000, force: force, onData: function (d) { S.boot = d; applyShell(); } });
  }

  /* ---------------- shell: navbar, top bar, drawer, footer ---------------- */
  function applyShell() {
    var s = set(), k = kontak();
    A.applyBrand(s);
    qs('#brandName').textContent = s.nama_singkat && window.innerWidth < 420 ? s.nama_singkat : namaSekolah();
    qs('#brandSub').textContent = s.tagline ? 'PPDB Online · ' + (s.yayasan || 'Profil Sekolah') : 'Profil Sekolah & PPDB Online';
    qs('#brandLogo').src = logoSrc(s);
    var wa = k.whatsapp ? A.waLink(k.whatsapp, 'Assalamu\'alaikum, saya ingin bertanya tentang PPDB ' + namaSekolah() + '.') : '';
    ['#navWa', '#mWa'].forEach(function (id) { var el = qs(id); el.innerHTML = icon('whatsapp') + '<span>WhatsApp</span>'; el.href = wa || '#kontak'; if (!wa) el.removeAttribute('target'); });
    var wf = qs('#waFloat'); wf.innerHTML = icon('whatsapp'); if (wa) { wf.href = wa; wf.classList.remove('hidden'); }
    var left = [];
    if (k.alamat) left.push('<span class="it">' + icon('map-pin') + esc(k.alamat) + '</span>');
    if (k.telepon) left.push('<a class="it" href="tel:' + esc(k.telepon.replace(/[^\d+]/g, '')) + '">' + icon('phone') + esc(k.telepon) + '</a>');
    if (k.email) left.push('<a class="it" href="mailto:' + esc(k.email) + '">' + icon('mail') + esc(k.email) + '</a>');
    qs('#topinfo .left').innerHTML = left.join('');
    qs('#topinfo .soc').innerHTML = sosial(k);
    var p = S.boot && S.boot.ppdb, nd = qs('#navDaftar');
    nd.textContent = p && p.open ? 'Daftar Sekarang' : 'Cek Status';
    nd.setAttribute('href', p && p.open ? '#/daftar' : '#/status');
    qs('#mmenu').innerHTML = qsa('#menu a').map(function (a) { return '<a href="' + a.getAttribute('href') + '" data-close-drawer>' + esc(a.textContent) + icon('chevron-right', 'ico-sm') + '</a>'; }).join('');
    qs('#footer').innerHTML = footer();
    A.Theme.sync();
  }
  function sosial(k) {
    return ['instagram', 'facebook', 'youtube', 'tiktok'].filter(function (x) { return k[x]; })
      .map(function (x) { return '<a href="' + esc(k[x]) + '" target="_blank" rel="noopener" aria-label="' + x + '">' + icon(x) + '</a>'; }).join('');
  }
  function footer() {
    var s = set(), k = kontak(), tahun = new Date().getFullYear();
    return '<div class="wrap"><div class="cols">' +
      '<div><div class="fb"><img src="' + logoSrc(s) + '" alt=""><div><b>' + esc(namaSekolah()) + '</b><span>' + esc(s.yayasan || '') + '</span></div></div>' +
      '<p style="font-size:14px;max-width:360px">' + esc(s.deskripsi || s.footer_teks || '') + '</p><div class="socrow">' + sosial(k) + '</div></div>' +
      '<div><h4>Tautan Cepat</h4><ul><li><a href="#/profil">Profil Sekolah</a></li><li><a href="#prestasi">Prestasi</a></li><li><a href="#fasilitas">Fasilitas</a></li><li><a href="#/berita">Berita & Informasi</a></li><li><a href="#biaya">Biaya Pendidikan</a></li></ul></div>' +
      '<div><h4>Kontak</h4><ul>' + (k.alamat ? '<li>' + esc(k.alamat) + '</li>' : '') + (k.telepon ? '<li>Telp. ' + esc(k.telepon) + '</li>' : '') +
      (k.whatsapp ? '<li>WhatsApp ' + esc(k.whatsapp) + '</li>' : '') + (k.email ? '<li><a href="mailto:' + esc(k.email) + '">' + esc(k.email) + '</a></li>' : '') +
      (k.jam_layanan ? '<li>' + esc(k.jam_layanan) + '</li>' : '') + '</ul></div>' +
      '<div><h4>PPDB Online</h4><ul><li><a href="#/daftar">Formulir Pendaftaran</a></li><li><a href="#/status">Cek Status</a></li><li><a href="#pendaftaran">Info Periode</a></li></ul></div>' +
      '</div><div class="bottom"><span>© ' + tahun + ' ' + esc(namaSekolah()) + '. Seluruh hak cipta dilindungi.</span><span>' + esc(s.footer_teks || '') + '</span></div></div>';
  }

  /* ---------------- router ---------------- */
  var _route = '';
  function parseHash() {
    var h = location.hash || '#/';
    if (h.indexOf('#/') !== 0) return { anchor: h.slice(1) };
    var parts = h.slice(2).split('?'), path = parts[0].replace(/\/+$/, ''), q = {};
    (parts[1] || '').split('&').forEach(function (kv) { if (!kv) return; var p = kv.split('='); q[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); });
    return { path: path, seg: path ? path.split('/') : [], q: q };
  }
  function router() {
    var r = parseHash();
    if (r.anchor !== undefined) {
      if (_route !== 'home') { _pendingAnchor = r.anchor; history.replaceState(null, '', '#/'); route('home', r); return; }
      gulirKe(r.anchor); history.replaceState(null, '', '#/'); return;
    }
    var s0 = r.seg[0] || '';
    var map = { '': 'home', profil: 'profil', berita: r.seg[1] ? 'beritaDetail' : 'berita', daftar: 'daftar', sukses: 'sukses', status: 'status', v: 'verify' };
    route(map[s0] || 'notfound', r);
  }
  var _pendingAnchor = null;
  function route(name, r) {
    _route = name;
    document.body.dataset.page = name;
    qsa('#menu a').forEach(function (a) { a.classList.toggle('active', (name === 'home' && a.dataset.nav === 'beranda') || (name.indexOf('berita') === 0 && a.dataset.nav === 'berita') || (name === 'profil' && a.dataset.nav === 'profil')); });
    tutupDrawer();
    var fn = { home: pageHome, profil: pageProfil, berita: pageBerita, beritaDetail: pageBeritaDetail, daftar: pageDaftar, sukses: pageSukses, status: pageStatus, verify: pageVerify, notfound: page404 }[name];
    fn(r || {});
    if (name !== 'home' || !_pendingAnchor) window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }
  function gulirKe(id) {
    var el = document.getElementById(id === 'beranda' ? 'beranda' : id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  window.addEventListener('hashchange', router);

  /* ---------------- HOME ---------------- */
  function skeletonHome() {
    app.innerHTML = '<section class="hero"><div class="wrap"><div><div class="sk" style="height:28px;width:180px;margin-bottom:18px"></div><div class="sk" style="height:46px;width:90%;margin-bottom:12px"></div><div class="sk" style="height:46px;width:70%;margin-bottom:22px"></div><div class="sk" style="height:18px;width:85%;margin-bottom:8px"></div><div class="sk" style="height:18px;width:60%"></div></div><div class="sk" style="aspect-ratio:5/4.4;border-radius:28px"></div></div></section>';
  }
  function pageHome() {
    document.title = namaSekolah() + ' — Profil Sekolah & PPDB Online';
    if (!S.boot) skeletonHome();
    var render = function () { if (_route === 'home' && S.boot) renderHome(); };
    if (S.boot) render();
    muatBoot().then(render).catch(function (e) { if (!S.boot) app.innerHTML = errorView(e, pageHome); });
  }
  function renderHome() {
    var d = S.boot, s = d.settings || {}, p = d.ppdb;
    var html = heroHtml(d) + advHtml(d.keunggulan) + aboutHtml(d) + facHtml(d.fasilitas) + presHtml(d.prestasi) + galHtml(d.kegiatan) + newsHtml(d.berita) + feeHtml(d.biaya) +
      '<section class="sec" id="pendaftaran" style="padding-top:20px"><div class="wrap">' + ppdbBand(p) + '</div></section>' + contactHtml(d.kontak);
    app.innerHTML = html;
    bindHero(d.hero || []);
    bindFee();
    qsa('.gallery .g').forEach(function (g) { g.onclick = function () { lightbox(d.kegiatan, +g.dataset.i); }; });
    reveal();
    if (_pendingAnchor) { var a = _pendingAnchor; _pendingAnchor = null; setTimeout(function () { gulirKe(a); }, 60); }
    scrollSpy();
  }
  function heroHtml(d) {
    var h = (d.hero && d.hero[0]) || { judul: namaSekolah(), subjudul: d.settings.deskripsi || '', cta_label: 'Jelajahi Sekolah', cta_link: '#profil' };
    var stats = (d.settings.statistik || []).slice(0, 4);
    var p = d.ppdb;
    return '<section class="hero" id="beranda"><div class="wrap">' +
      '<div class="hero-text"><div class="hero-slide" id="heroSlide">' + heroSlide(h) + '</div>' +
      (d.hero && d.hero.length > 1 ? '<div class="dots" role="tablist" aria-label="Slide">' + d.hero.map(function (x, i) { return '<button role="tab" aria-label="Slide ' + (i + 1) + '" data-i="' + i + '" class="' + (i ? '' : 'active') + '"></button>'; }).join('') + '</div>' : '') +
      (stats.length ? '<div class="stats">' + stats.map(function (x) { return '<div class="stat"><div class="v">' + esc(x.nilai) + '</div><div class="l">' + esc(x.label) + '</div></div>'; }).join('') + '</div>' : '') +
      '</div><div class="hero-vis"><div class="hero-card" id="heroCard">' + heroVisual(h) + '</div><div class="floats">' +
      (p ? '<div class="float-card a"><span class="fi">' + icon(p.open ? 'cap' : 'calendar') + '</span><div><b>' + esc(p.open ? 'PPDB Dibuka' : 'PPDB ' + (p.tahun_ajaran || '')) + '</b><span class="muted">' + esc(p.open ? (p.sisa != null ? 'Sisa kuota ' + A.angka(p.sisa) : 'Daftar online sekarang') : (p.alasan || 'Informasi segera')) + '</span></div></div>' : '') +
      (d.settings.tahun_berdiri ? '<div class="float-card b"><span class="fi">' + icon('award') + '</span><div><b>Sejak ' + esc(d.settings.tahun_berdiri) + '</b><span class="muted">Berpengalaman mendidik</span></div></div>' : '') +
      '</div></div></div></section>';
  }
  function heroSlide(h) {
    var link = h.cta_link || '#profil';
    return '<span class="eyebrow"><span class="dot"></span>' + esc(set().tagline || 'Selamat Datang') + '</span>' +
      '<h1>' + esc(h.judul) + '</h1><p class="lead">' + esc(h.subjudul || '') + '</p>' +
      '<div class="cta"><a class="btn btn-accent btn-lg" href="' + esc(link) + '">' + esc(h.cta_label || 'Jelajahi Sekolah') + icon('arrow-right') + '</a>' +
      '<a class="btn btn-outline btn-lg" href="#kontak">' + icon('phone') + 'Hubungi Kami</a></div>';
  }
  function heroVisual(h) {
    if (h.gambar_id) return A.media(h.gambar_id, 'image', 1200, h.judul);
    return '<div class="pattern" style="position:absolute;inset:0"></div><div class="ring"></div><div class="ring r2"></div><div class="emb"><img src="' + logoSrc(set()) + '" alt="Logo ' + esc(namaSekolah()) + '"></div>';
  }
  var _heroT = null;
  function bindHero(list) {
    clearInterval(_heroT);
    if (list.length < 2) return;
    var i = 0, slide = qs('#heroSlide'), card = qs('#heroCard');
    function go(n) {
      i = (n + list.length) % list.length;
      slide.classList.add('out');
      setTimeout(function () { slide.innerHTML = heroSlide(list[i]); if (list[i].gambar_id || card.dataset.img) { card.innerHTML = heroVisual(list[i]); card.dataset.img = list[i].gambar_id ? '1' : ''; } slide.classList.remove('out'); }, 260);
      qsa('.dots button').forEach(function (b, j) { b.classList.toggle('active', j === i); });
    }
    qsa('.dots button').forEach(function (b) { b.onclick = function () { go(+b.dataset.i); clearInterval(_heroT); }; });
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) _heroT = setInterval(function () { if (_route === 'home' && document.visibilityState === 'visible') go(i + 1); }, 7000);
  }
  function advHtml(list) {
    if (!list || !list.length) return '<div style="height:20px"></div>';
    return '<div class="adv"><div class="wrap"><div class="card">' + list.slice(0, 5).map(function (k) {
      return '<div class="adv-it"><span class="ai">' + icon(k.ikon || 'star') + '</span><div><b>' + esc(k.judul) + '</b><span>' + esc(k.deskripsi || '') + '</span></div></div>';
    }).join('') + '</div></div></div>';
  }
  function aboutHtml(d) {
    var pr = (d.profil || [])[0]; if (!pr) return '';
    var misi = String(pr.misi || '').split('\n').filter(String);
    var teks = String(pr.isi || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return '<section class="sec" id="profil"><div class="wrap about">' +
      '<div class="about-vis reveal">' + (pr.gambar_id ? A.media(pr.gambar_id, 'building', 1000, pr.judul) : '<div class="thumb pattern" style="border-radius:24px;aspect-ratio:4/3.3"><div class="ph"><img src="' + logoSrc(set()) + '" alt="" style="width:46%;filter:drop-shadow(0 12px 30px rgba(0,0,0,.35))"></div></div>') +
      (set().tahun_berdiri ? '<div class="badge-yr"><b>' + esc(set().tahun_berdiri) + '</b><span>Tahun Berdiri</span></div>' : '') + '</div>' +
      '<div class="reveal"><div class="sec-h" style="margin-bottom:14px"><div><span class="kick">Profil Sekolah</span><h2>' + esc(pr.judul) + '</h2></div></div>' +
      '<p class="muted" style="font-size:15.5px">' + esc(teks.length > 420 ? teks.substring(0, 420) + '…' : teks) + '</p>' +
      '<div class="vm">' + (pr.visi ? '<div class="card"><h4>' + icon('target', 'ico-sm') + 'Visi</h4><p>' + esc(pr.visi) + '</p></div>' : '') +
      (misi.length ? '<div class="card"><h4>' + icon('list', 'ico-sm') + 'Misi</h4><ol>' + misi.slice(0, 3).map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + (misi.length > 3 ? '<li class="muted">dan ' + (misi.length - 3) + ' lainnya…</li>' : '') + '</ol></div>' : '') + '</div>' +
      '<a class="btn btn-outline" href="#/profil">Selengkapnya ' + icon('arrow-right') + '</a></div></div></section>';
  }
  function facHtml(list) {
    if (!list || !list.length) return '';
    return '<section class="sec alt" id="fasilitas"><div class="wrap"><div class="sec-h"><div><span class="kick">Fasilitas</span><h2>Sarana Penunjang Belajar</h2><p>Lingkungan belajar yang nyaman, aman, dan lengkap untuk tumbuh kembang santri.</p></div></div>' +
      '<div class="grid-fac">' + list.map(function (f) {
        return '<article class="card fac reveal">' + (f.gambar_id ? A.media(f.gambar_id, f.ikon || 'building', 600, f.nama, 'fimg') : '<span class="fi">' + icon(f.ikon || 'building') + '</span>') +
          '<h3>' + esc(f.nama) + '</h3><p>' + esc(f.deskripsi || '') + '</p></article>';
      }).join('') + '</div></div></section>';
  }
  var LVL = { Internasional: 'b-violet', Nasional: 'b-gold', Provinsi: 'b-info', Kabupaten: 'b-ok', Kota: 'b-ok' };
  function presHtml(list) {
    if (!list || !list.length) return '';
    return '<section class="sec" id="prestasi"><div class="wrap"><div class="sec-h"><div><span class="kick">Prestasi</span><h2>Jejak Prestasi Santri</h2><p>Capaian akademik dan non-akademik di berbagai tingkat kompetisi.</p></div></div>' +
      '<div class="grid-3">' + list.slice(0, 6).map(function (p) {
        return '<article class="card mcard reveal"><div style="position:relative">' + A.media(p.gambar_id, 'trophy', 700, p.judul) +
          (p.tingkat ? '<span class="badge lvl ' + (LVL[p.tingkat] || 'b-brand') + '" style="position:absolute;left:12px;top:12px;z-index:2">' + esc(p.tingkat) + '</span>' : '') + '</div>' +
          '<div class="mb"><div class="meta">' + icon('calendar', 'ico-sm') + esc(p.tahun || '') + '</div><h3>' + esc(p.judul) + '</h3><p>' + esc(p.deskripsi || '') + '</p></div></article>';
      }).join('') + '</div></div></section>';
  }
  function galHtml(list) {
    if (!list || !list.length) return '';
    return '<section class="sec alt" id="kegiatan"><div class="wrap"><div class="sec-h"><div><span class="kick">Kegiatan</span><h2>Galeri Kegiatan</h2><p>Dokumentasi kegiatan belajar, ibadah, ekstrakurikuler, dan acara sekolah.</p></div></div>' +
      '<div class="gallery">' + list.slice(0, 5).map(function (k, i) {
        return '<button class="g reveal" type="button" data-i="' + i + '" aria-label="Lihat ' + esc(k.nama) + '">' + A.media(k.gambar_id, ['calendar', 'users', 'star', 'flask', 'activity', 'book-open'][i % 6], 800, k.nama) +
          '<div class="cap"><b>' + esc(k.nama) + '</b><span>' + esc(A.tgl(k.tanggal)) + '</span></div></button>';
      }).join('') + '</div></div></section>';
  }
  function lightbox(list, i) {
    var m = A.modal({ title: list[i].nama, size: 'wide', body: '<div class="lightbox-in"></div>',
      foot: '<button class="btn btn-light" data-prev>' + icon('chevron-left') + 'Sebelumnya</button><button class="btn btn-light" data-next>Berikutnya' + icon('chevron-right') + '</button>' });
    m.el.querySelector('.modal').classList.add('lightbox');
    function show() {
      var k = list[i];
      m.el.querySelector('.modal-head h3').textContent = k.nama;
      m.el.querySelector('.lightbox-in').innerHTML = A.media(k.gambar_id, 'image', 1600, k.nama) + '<div class="lb-cap"><div class="muted" style="font-size:13px">' + esc(A.tgl(k.tanggal)) + '</div><p style="margin:6px 0 0">' + esc(k.deskripsi || '') + '</p></div>';
    }
    m.el.querySelector('[data-prev]').onclick = function () { i = (i - 1 + list.length) % list.length; show(); };
    m.el.querySelector('[data-next]').onclick = function () { i = (i + 1) % list.length; show(); };
    show();
  }
  function newsHtml(list) {
    if (!list || !list.length) return '';
    return '<section class="sec" id="berita"><div class="wrap"><div class="sec-h"><div><span class="kick">Berita</span><h2>Berita & Informasi Terbaru</h2></div><a class="btn btn-outline btn-sm" href="#/berita">Semua Berita ' + icon('arrow-right') + '</a></div>' +
      '<div class="grid-3">' + list.slice(0, 3).map(kartuBerita).join('') + '</div></div></section>';
  }
  function kartuBerita(b) {
    return '<a class="card mcard reveal" href="#/berita/' + encodeURIComponent(b.slug) + '">' + A.media(b.gambar_id, 'file-text', 700, b.judul) +
      '<div class="mb"><div class="meta">' + (b.kategori ? '<span class="badge b-brand no-dot">' + esc(b.kategori) + '</span>' : '') + '<span>' + esc(A.tgl(b.tanggal)) + '</span></div>' +
      '<h3>' + esc(b.judul) + '</h3><p>' + esc(b.ringkasan || '') + '</p><span class="more">Baca selengkapnya ' + icon('arrow-right', 'ico-sm') + '</span></div></a>';
  }
  function feeHtml(list) {
    if (!list || !list.length) return '';
    var jenjang = []; list.forEach(function (b) { if (jenjang.indexOf(b.jenjang) < 0) jenjang.push(b.jenjang); });
    return '<section class="sec alt" id="biaya"><div class="wrap"><div class="sec-h"><div><span class="kick">Biaya</span><h2>Biaya Pendidikan</h2><p>Rincian biaya per jenjang tahun ajaran berjalan. Hubungi panitia untuk informasi beasiswa dan keringanan.</p></div>' +
      (jenjang.length > 1 ? '<div class="seg" role="tablist" id="feeTabs">' + jenjang.map(function (j, i) { return '<button role="tab" class="' + (i ? '' : 'active') + '" data-j="' + esc(j) + '">' + esc(j) + '</button>'; }).join('') + '</div>' : '') + '</div>' +
      '<div class="fee"><div class="card" id="feeBox" data-list="' + esc(JSON.stringify(list)) + '"></div>' +
      '<div class="card fee-note"><h3>' + icon('info', 'ico-sm') + ' Catatan Biaya</h3><ul><li>' + icon('check') + 'Pembayaran dapat diangsur sesuai kesepakatan.</li><li>' + icon('check') + 'Tersedia beasiswa prestasi & yatim/dhuafa.</li><li>' + icon('check') + 'Biaya dapat berubah sewaktu-waktu sesuai kebijakan yayasan.</li></ul>' +
      '<a class="btn btn-accent btn-block" href="#/daftar">Daftar Sekarang ' + icon('arrow-right') + '</a></div></div></div></section>';
  }
  function bindFee() {
    var box = qs('#feeBox'); if (!box) return;
    var list = JSON.parse(box.dataset.list), cur = list[0].jenjang;
    function draw() {
      var rows = list.filter(function (b) { return b.jenjang === cur; }), total = rows.reduce(function (a, b) { return a + (Number(b.nominal) || 0); }, 0);
      box.innerHTML = '<div class="table-wrap"><table class="table"><thead><tr><th>No</th><th>Komponen</th><th class="num">Nominal</th><th>Keterangan</th></tr></thead><tbody>' +
        rows.map(function (b, i) { return '<tr><td>' + (i + 1) + '</td><td><b>' + esc(b.komponen) + '</b></td><td class="num">' + A.rp(b.nominal) + '</td><td class="muted">' + esc(b.keterangan || '') + '</td></tr>'; }).join('') +
        '<tr class="total"><td></td><td>Total seluruh komponen</td><td class="num">' + A.rp(total) + '</td><td></td></tr></tbody></table></div>' +
        '<div class="fee-cards" style="padding:14px">' + rows.map(function (b) { return '<div class="fee-card"><div><b>' + esc(b.komponen) + '</b><span>' + esc(b.keterangan || '') + '</span></div><div class="n">' + A.rp(b.nominal) + '</div></div>'; }).join('') +
        '<div class="fee-card" style="background:var(--brand-50)"><b>Total seluruh komponen</b><div class="n">' + A.rp(total) + '</div></div></div>';
    }
    qsa('#feeTabs button').forEach(function (b) { b.onclick = function () { cur = b.dataset.j; qsa('#feeTabs button').forEach(function (x) { x.classList.toggle('active', x === b); }); draw(); }; });
    draw();
  }
  function ppdbBand(p) {
    if (!p) return '';
    var persen = p.kuota ? Math.min(100, Math.round(p.terisi / p.kuota * 100)) : 0;
    return '<div class="ppdb-band reveal ' + (p.open ? '' : 'closed') + '"><div><span class="pill">' + icon(p.open ? 'cap' : 'lock', 'ico-sm') + esc(p.nama || 'PPDB') + '</span>' +
      '<h2>' + (p.open ? 'Pendaftaran Dibuka!' : 'Pendaftaran Ditutup') + '</h2>' +
      '<p>' + (p.open ? 'Periode ' + esc(A.tgl(p.buka)) + ' – ' + esc(A.tgl(p.tutup)) + '. Isi formulir online, unggah berkas, dan simpan token untuk memantau status.' : esc(p.alasan || 'Nantikan pembukaan gelombang berikutnya.')) + '</p></div>' +
      '<div class="side">' + (p.kuota ? '<div class="quota"><div style="display:flex;justify-content:space-between;font-size:13.5px"><span>Kuota terisi</span><b>' + A.angka(p.terisi) + ' / ' + A.angka(p.kuota) + '</b></div><div class="qbar"><span style="width:' + persen + '%"></span></div><span style="font-size:12.5px;opacity:.8">' + (p.sisa != null ? 'Sisa ' + A.angka(p.sisa) + ' kursi' : '') + '</span></div>' : '') +
      (p.open ? '<a class="btn btn-accent btn-lg btn-block" href="#/daftar">' + icon('edit') + 'Daftar Sekarang</a>' : '<button class="btn btn-lg btn-block" disabled>' + icon('lock') + 'Pendaftaran Ditutup</button>') +
      '<a class="btn btn-light btn-block" href="#/status">' + icon('search') + 'Cek Status Pendaftaran</a></div></div>';
  }
  function contactHtml(k) {
    k = k || {};
    var peta = k.maps_embed ? '<iframe src="' + esc(k.maps_embed) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Peta lokasi" allowfullscreen></iframe>'
      : '<div class="mapph"><div><div class="empty" style="padding:0"><div class="ico-wrap">' + icon('map-pin', 'ico-lg') + '</div><h3>Lokasi Kami</h3><p class="muted">' + esc(k.alamat || '') + '</p>' +
        (k.lat && k.lng ? '<a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="https://www.google.com/maps?q=' + encodeURIComponent(k.lat + ',' + k.lng) + '">' + icon('external') + 'Buka di Google Maps</a>' : '') + '</div></div></div>';
    var it = function (ic, label, val, href) { return val ? '<div class="ci"><span class="cii">' + icon(ic) + '</span><div><b>' + label + '</b>' + (href ? '<a href="' + href + '" target="' + (href.indexOf('http') === 0 ? '_blank' : '_self') + '" rel="noopener">' + esc(val) + '</a>' : '<span>' + esc(val) + '</span>') + '</div></div>' : ''; };
    return '<section class="sec" id="kontak" style="padding-top:24px"><div class="wrap"><div class="sec-h"><div><span class="kick">Kontak</span><h2>Hubungi Kami</h2><p>Panitia siap membantu pertanyaan seputar sekolah dan pendaftaran.</p></div></div>' +
      '<div class="contact"><div class="card cinfo reveal">' + it('map-pin', 'Alamat', k.alamat) + it('phone', 'Telepon', k.telepon, k.telepon ? 'tel:' + String(k.telepon).replace(/[^\d+]/g, '') : '') +
      it('whatsapp', 'WhatsApp', k.whatsapp, k.whatsapp ? A.waLink(k.whatsapp) : '') + it('mail', 'Email', k.email, k.email ? 'mailto:' + k.email : '') + it('clock', 'Jam Layanan', k.jam_layanan) +
      (k.whatsapp ? '<a class="btn btn-block" style="background:#1FAF54" target="_blank" rel="noopener" href="' + A.waLink(k.whatsapp, 'Assalamu\'alaikum, saya ingin bertanya.') + '">' + icon('whatsapp') + 'Chat WhatsApp</a>' : '') +
      '<div class="socrow">' + sosial(k) + '</div></div><div class="mapbox reveal">' + peta + '</div></div></div></section>';
  }

  /* animasi muncul + scrollspy */
  var _io = null;
  function reveal() {
    if (!('IntersectionObserver' in window)) { qsa('.reveal').forEach(function (e) { e.classList.add('in'); }); return; }
    if (_io) _io.disconnect();
    _io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); _io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -40px 0px' });
    qsa('.reveal').forEach(function (e) { _io.observe(e); });
  }
  var _spy = null;
  function scrollSpy() {
    if (_spy) _spy.disconnect();
    if (!('IntersectionObserver' in window)) return;
    _spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && _route === 'home') qsa('#menu a').forEach(function (a) { a.classList.toggle('active', a.dataset.nav === e.target.id); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    SECTIONS.forEach(function (id) { var el = document.getElementById(id); if (el) _spy.observe(el); });
  }

  /* ---------------- PROFIL ---------------- */
  function pageHead(crumbs, judul, sub) {
    return '<section class="page-head"><div class="wrap"><nav class="crumb" aria-label="Breadcrumb"><a href="#/">Beranda</a>' + crumbs.map(function (c) { return icon('chevron-right') + (c[1] ? '<a href="' + c[1] + '">' + esc(c[0]) + '</a>' : '<span>' + esc(c[0]) + '</span>'); }).join('') +
      '</nav><h1>' + esc(judul) + '</h1>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div></section>';
  }
  function pageProfil() {
    if (!S.boot) { app.innerHTML = pageHead([['Profil']], 'Profil Sekolah') + '<div class="wrap" style="padding:40px 0"><div class="sk" style="height:300px"></div></div>'; }
    muatBoot().then(function () { if (_route === 'profil') renderProfil(); }).catch(function (e) { app.innerHTML = errorView(e, pageProfil); });
    if (S.boot) renderProfil();
  }
  function renderProfil() {
    var d = S.boot, list = d.profil || [], pr = list[0] || {}, misi = String(pr.misi || '').split('\n').filter(String);
    document.title = 'Profil — ' + namaSekolah();
    app.innerHTML = pageHead([['Profil']], 'Profil ' + namaSekolah(), set().deskripsi) +
      '<div class="wrap two-col"><article>' +
      (pr.gambar_id ? A.media(pr.gambar_id, 'building', 1400, pr.judul, 'art-cover') : '') +
      (pr.visi || misi.length ? '<div class="card card-pad" id="visi-misi" style="margin-bottom:22px"><span class="badge b-gold no-dot" style="margin-bottom:10px">Visi & Misi</span>' +
        (pr.visi ? '<blockquote style="margin:0 0 18px;font-size:19px;font-weight:600;line-height:1.5;border-left:4px solid var(--accent);padding-left:16px">“' + esc(pr.visi) + '”</blockquote>' : '') +
        (misi.length ? '<div style="display:grid;gap:10px">' + misi.map(function (m, i) { return '<div style="display:flex;gap:12px;align-items:flex-start"><span class="badge b-brand no-dot" style="min-width:34px;justify-content:center">' + String(i + 1).padStart(2, '0') + '</span><span>' + esc(m) + '</span></div>'; }).join('') + '</div>' : '') + '</div>' : '') +
      list.map(function (b, i) {
        return '<section class="card card-pad" id="p-' + i + '" style="margin-bottom:18px"><h2 style="font-size:22px">' + esc(b.judul) + '</h2>' + (i && b.gambar_id ? A.media(b.gambar_id, 'image', 1200, b.judul, 'art-cover') : '') + '<div class="rich rich-art">' + bersihHtml(b.isi) + '</div></section>';
      }).join('') + '</article><aside><div class="card card-pad" style="margin-bottom:16px"><h3 style="font-size:15px">Daftar Isi</h3><nav style="display:grid;gap:4px">' +
      (pr.visi ? '<a class="mini" href="javascript:void 0" data-go="visi-misi">' + icon('target', 'ico-sm') + '<b>Visi & Misi</b></a>' : '') +
      list.map(function (b, i) { return '<a class="mini" href="javascript:void 0" data-go="p-' + i + '">' + icon('chevron-right', 'ico-sm') + '<b>' + esc(b.judul) + '</b></a>'; }).join('') + '</nav></div>' +
      ppdbMini(d.ppdb) + '</aside></div>';
    qsa('[data-go]').forEach(function (a) { a.onclick = function () { var el = document.getElementById(a.dataset.go); if (el) el.scrollIntoView({ behavior: 'smooth' }); }; });
  }
  function ppdbMini(p) {
    if (!p) return '';
    return '<div class="card card-pad" style="background:linear-gradient(160deg,var(--brand),var(--brand-700));color:#fff;border:0"><span class="badge no-dot" style="background:rgba(255,255,255,.14);color:#fff;border:0">' + esc(p.nama || 'PPDB') + '</span>' +
      '<h3 style="color:#fff;margin:12px 0 6px">' + (p.open ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup') + '</h3><p style="color:rgba(255,255,255,.82);font-size:13.5px">' + (p.open ? 'Daftar online sebelum ' + esc(A.tgl(p.tutup)) + '.' : esc(p.alasan || '')) + '</p>' +
      (p.open ? '<a class="btn btn-accent btn-block" href="#/daftar">Daftar Sekarang</a>' : '') + '<a class="btn btn-block" style="background:transparent;border-color:rgba(255,255,255,.35);margin-top:8px" href="#/status">Cek Status</a></div>';
  }
  /** Lapisan kedua pembersih HTML (server sudah membersihkan). */
  function bersihHtml(html) {
    var doc = new DOMParser().parseFromString('<div>' + (html || '') + '</div>', 'text/html');
    qsa('script,style,iframe,object,embed,form,input,button', doc).forEach(function (n) { n.remove(); });
    qsa('*', doc).forEach(function (n) { Array.prototype.slice.call(n.attributes).forEach(function (a) { if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value) || a.name === 'style') n.removeAttribute(a.name); }); if (n.tagName === 'A') { n.setAttribute('rel', 'noopener'); n.setAttribute('target', '_blank'); } });
    return doc.body.firstChild.innerHTML;
  }

  /* ---------------- BERITA ---------------- */
  function pageBerita(r) {
    document.title = 'Berita — ' + namaSekolah();
    app.innerHTML = pageHead([['Berita']], 'Berita & Informasi', 'Kabar terbaru kegiatan, prestasi, dan pengumuman resmi sekolah.') +
      '<div class="wrap" style="padding:30px 0 72px"><div class="toolbar"><label class="search"><span class="sr-only">Cari berita</span>' + icon('search') + '<input class="input" id="bq" type="search" placeholder="Cari berita…"></label><div class="seg" id="bkat"></div></div><div id="blist"><div class="grid-3">' +
      [1, 2, 3].map(function () { return '<div class="card" style="overflow:hidden"><div class="sk" style="aspect-ratio:16/9.5;border-radius:0"></div><div style="padding:18px"><div class="sk" style="height:18px;margin-bottom:10px"></div><div class="sk" style="height:14px;width:70%"></div></div></div>'; }).join('') + '</div></div></div>';
    var state = { q: '', kat: '', n: 9 };
    A.Swr.load('pub_berita', function () { return Api.get('pub.berita').then(function (x) { return x.data.list; }); }, { maxAge: 60000, onData: function (list) { S.berita = list; draw(); } })
      .catch(function (e) { if (!S.berita) qs('#blist').innerHTML = errorView(e, function () { pageBerita(r); }); });
    function draw() {
      if (_route !== 'berita' || !S.berita) return;
      var kats = []; S.berita.forEach(function (b) { if (b.kategori && kats.indexOf(b.kategori) < 0) kats.push(b.kategori); });
      qs('#bkat').innerHTML = ['Semua'].concat(kats).map(function (k) { return '<button type="button" class="' + ((state.kat || 'Semua') === k ? 'active' : '') + '" data-k="' + esc(k) + '">' + esc(k) + '</button>'; }).join('');
      qsa('#bkat button').forEach(function (b) { b.onclick = function () { state.kat = b.dataset.k === 'Semua' ? '' : b.dataset.k; state.n = 9; draw(); }; });
      var list = S.berita.filter(function (b) { return (!state.kat || b.kategori === state.kat) && (!state.q || (b.judul + ' ' + b.ringkasan).toLowerCase().indexOf(state.q) >= 0); });
      if (!list.length) { qs('#blist').innerHTML = '<div class="empty card"><div class="ico-wrap">' + icon('search', 'ico-lg') + '</div><h3>Tidak ada berita</h3><p>Coba kata kunci atau kategori lain.</p></div>'; return; }
      var f = list[0];
      qs('#blist').innerHTML = (!state.q && !state.kat ? '<a class="card featured" href="#/berita/' + encodeURIComponent(f.slug) + '">' + A.media(f.gambar_id, 'file-text', 1200, f.judul) +
        '<div class="fb"><div class="meta" style="display:flex;gap:10px;color:var(--muted);font-size:13px"><span class="badge b-gold no-dot">Terbaru</span>' + esc(A.tgl(f.tanggal)) + '</div><h2>' + esc(f.judul) + '</h2><p class="muted">' + esc(f.ringkasan || '') + '</p><span class="btn btn-sm" style="align-self:flex-start">Baca selengkapnya ' + icon('arrow-right', 'ico-sm') + '</span></div></a>' : '') +
        '<div class="grid-3">' + list.slice(!state.q && !state.kat ? 1 : 0, state.n).map(kartuBerita).join('') + '</div>' +
        (list.length > state.n ? '<div style="text-align:center;margin-top:24px"><button class="btn btn-outline" id="bmore">Muat lebih banyak</button></div>' : '');
      reveal();
      var more = qs('#bmore'); if (more) more.onclick = function () { state.n += 9; draw(); };
    }
    qs('#bq').addEventListener('input', A.debounce(function (e) { state.q = e.target.value.trim().toLowerCase(); draw(); }, 250));
  }
  function pageBeritaDetail(r) {
    var slug = decodeURIComponent(r.seg[1]);
    app.innerHTML = pageHead([['Berita', '#/berita'], ['Memuat…']], 'Memuat berita…') + '<div class="wrap two-col"><div><div class="sk" style="aspect-ratio:16/9;border-radius:22px;margin-bottom:20px"></div><div class="sk" style="height:16px;margin-bottom:10px"></div><div class="sk" style="height:16px;width:80%"></div></div></div>';
    A.Swr.load('pub_berita_' + slug, function () { return Api.get('pub.berita', { slug: slug }).then(function (x) { return x.data; }); }, { maxAge: 120000, onData: draw })
      .catch(function (e) { if (_route === 'beritaDetail') app.innerHTML = pageHead([['Berita', '#/berita']], 'Berita tidak ditemukan') + '<div class="wrap">' + errorView(e) + '</div>'; });
    function draw(d) {
      if (_route !== 'beritaDetail') return;
      var b = d.berita, url = location.href.split('#')[0] + '#/berita/' + encodeURIComponent(b.slug);
      document.title = b.judul + ' — ' + namaSekolah();
      app.innerHTML = pageHead([['Berita', '#/berita'], [b.kategori || 'Artikel']], b.judul) +
        '<div class="wrap two-col"><article><div class="art-meta"><span>' + icon('calendar', 'ico-sm') + esc(A.tgl(b.tanggal)) + '</span>' + (b.penulis ? '<span>' + icon('user', 'ico-sm') + esc(b.penulis) + '</span>' : '') +
        '<a class="btn btn-light btn-xs" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(b.judul + ' — ' + url) + '">' + icon('whatsapp', 'ico-sm') + 'Bagikan</a>' +
        '<button class="btn btn-light btn-xs" id="cpLink">' + icon('link', 'ico-sm') + 'Salin Tautan</button></div>' +
        (b.gambar_id ? A.media(b.gambar_id, 'image', 1400, b.judul, 'art-cover') : '') +
        '<div class="rich rich-art">' + (bersihHtml(b.isi) || '<p>' + esc(b.ringkasan) + '</p>') + '</div>' +
        '<div style="margin-top:28px"><a class="btn btn-outline" href="#/berita">' + icon('arrow-left') + 'Kembali ke Berita</a></div></article>' +
        '<aside>' + (d.lainnya.length ? '<div class="card card-pad" style="margin-bottom:16px"><h3 style="font-size:15px">Berita Lainnya</h3>' + d.lainnya.map(function (x) {
          return '<a class="mini" href="#/berita/' + encodeURIComponent(x.slug) + '">' + A.media(x.gambar_id, 'file-text', 200, x.judul) + '<div><b>' + esc(x.judul) + '</b><span>' + esc(A.tgl(x.tanggal)) + '</span></div></a>';
        }).join('') + '</div>' : '') + ppdbMini(S.boot && S.boot.ppdb) + '</aside></div>';
      qs('#cpLink').onclick = function () { A.copyText(url).then(function () { A.toast('Tautan disalin.', 'ok'); }); };
    }
  }

  /* ---------------- FORMULIR PPDB ---------------- */
  var F = null;
  var TIPE_IKON = { 'Data Calon Siswa': 'user', 'Data Orang Tua / Wali': 'users', 'Minat & Bakat': 'star', 'Unggah Berkas': 'upload-cloud' };
  function pageDaftar() {
    document.title = 'Formulir Pendaftaran — ' + namaSekolah();
    app.innerHTML = '<div class="form-wrap form-top"><div class="sk" style="height:34px;width:70%;margin-bottom:12px"></div><div class="sk" style="height:16px;width:50%;margin-bottom:24px"></div><div class="sk" style="height:56px;margin-bottom:20px"></div><div class="sk" style="height:420px;border-radius:18px"></div></div>';
    Api.warm('pub');
    Api.get('pub.form').then(function (r) {
      if (_route !== 'daftar') return;
      var d = r.data;
      if (!d.periode || !d.periode.open || !d.fields.length) return renderTutup(d.periode);
      initForm(d);
    }).catch(function (e) { app.innerHTML = '<div class="form-wrap">' + errorView(e, pageDaftar) + '</div>'; });
  }
  function renderTutup(p) {
    document.title = 'Pendaftaran Ditutup — ' + namaSekolah();
    var k = kontak();
    app.innerHTML = '<div class="center-card card card-pad"><div class="big-ico lock">' + icon('lock') + '</div><span class="badge b-warn">Status: Pendaftaran Ditutup</span>' +
      '<h1 style="font-size:28px;margin-top:14px">Pendaftaran Belum Dapat Diterima</h1><p class="muted">' + esc((p && p.alasan) || 'Periode pendaftaran belum dibuka atau telah berakhir.') + '</p>' +
      (p ? '<div class="note-box"><b>' + esc(p.nama || '') + '</b><br>Jadwal: ' + esc(A.tgl(p.buka)) + ' – ' + esc(A.tgl(p.tutup)) + (p.keterangan ? '<br><span class="muted">' + esc(p.keterangan) + '</span>' : '') + '</div>' : '') +
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:22px"><a class="btn" href="#/status">' + icon('search') + 'Cek Status Pendaftaran</a>' +
      (k.whatsapp ? '<a class="btn btn-outline" target="_blank" rel="noopener" href="' + A.waLink(k.whatsapp, 'Assalamu\'alaikum, kapan pendaftaran dibuka kembali?') + '">' + icon('whatsapp') + 'Tanya Panitia</a>' : '') + '</div></div>';
  }
  function draftKey(pid) { return 'ppdb_draft_' + pid; }
  function initForm(d) {
    var steps = [], idx = {};
    d.fields.forEach(function (f) { if (idx[f.bagian] === undefined) { idx[f.bagian] = steps.length; steps.push({ judul: f.bagian, fields: [] }); } steps[idx[f.bagian]].fields.push(f); });
    steps.push({ judul: 'Periksa & Kirim', review: true, fields: [] });
    var draft = A.Store.json(draftKey(d.periode.id), null);
    F = { d: d, steps: steps, i: 0, jaw: {}, berkas: {}, err: {}, setuju: false };
    if (draft && draft.jawaban) { F.jaw = draft.jawaban; A.toast('Melanjutkan isian yang tersimpan di perangkat ini. Berkas perlu diunggah ulang.', 'info', 6000); }
    renderForm();
  }
  function simpanDraft() {
    if (!F) return;
    A.Store.setJson(draftKey(F.d.periode.id), { versi: F.d.versi, jawaban: F.jaw, t: Date.now() });
    var el = qs('#draftInfo'); if (el) el.innerHTML = icon('check', 'ico-sm') + 'Isian tersimpan otomatis di perangkat ini';
  }
  var simpanDraftLambat = A.debounce(simpanDraft, 600);
  function renderForm() {
    var p = F.d.periode, st = F.steps[F.i], n = F.steps.length;
    app.innerHTML = '<div class="ppdb-shell"><div class="form-wrap form-top">' +
      '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap"><div><span class="badge b-gold no-dot" style="margin-bottom:10px">' + esc(p.nama) + (p.sisa != null ? ' · Sisa kuota ' + A.angka(p.sisa) : '') + '</span>' +
      '<h1 style="font-size:clamp(24px,3.6vw,34px);margin-bottom:6px">Formulir Pendaftaran Peserta Didik Baru</h1><p class="muted" style="margin:0">Tahun Ajaran ' + esc(p.tahun_ajaran || '') + ' · Ditutup ' + esc(A.tgl(p.tutup)) + '</p></div>' +
      '<a class="btn btn-light btn-sm" href="#/">' + icon('arrow-left', 'ico-sm') + 'Beranda</a></div>' +
      '<div class="stepper" role="list">' + F.steps.map(function (s, i) {
        var punyaErr = s.fields.some(function (f) { return F.err[f.id]; });
        var cls = i === F.i ? 'active' : i < F.i ? 'done' : '';
        return '<button type="button" role="listitem" class="stp ' + cls + (punyaErr ? ' has-err' : '') + '" data-s="' + i + '" ' + (i < F.i ? '' : 'disabled') + ' aria-current="' + (i === F.i ? 'step' : 'false') + '"><span class="n">' + (i < F.i && !punyaErr ? icon('check', 'ico-sm') : i + 1) + '</span><span class="t">' + esc(s.judul) + '</span></button>';
      }).join('') + '</div><div class="pbar" aria-hidden="true"><span style="width:' + Math.round((F.i + 1) / n * 100) + '%"></span></div><div class="ptext"><span>Langkah ' + (F.i + 1) + ' dari ' + n + '</span><span>' + Math.round((F.i + 1) / n * 100) + '% selesai</span></div></div>' +
      '<div class="form-wrap"><form class="card card-pad form-card" id="ppdbForm" novalidate>' + (st.review ? reviewHtml() : stepHtml(st)) + '</form></div>' +
      '<div class="sticky-bar"><div class="form-wrap"><button type="button" class="btn btn-light" id="fPrev" ' + (F.i ? '' : 'disabled') + '>' + icon('arrow-left') + 'Sebelumnya</button>' +
      '<span class="draft" id="draftInfo">' + icon('save', 'ico-sm') + 'Isian disimpan otomatis di perangkat ini</span>' +
      (st.review ? '<button type="button" class="btn btn-accent" id="fSubmit">' + icon('send') + 'Kirim Pendaftaran</button>' : '<button type="button" class="btn" id="fNext">Selanjutnya' + icon('arrow-right') + '</button>') + '</div></div></div>';
    bindForm();
    qs('#ppdbForm').addEventListener('submit', function (e) { e.preventDefault(); });
  }
  function stepHtml(st) {
    var ikon = TIPE_IKON[st.judul] || (st.fields.some(function (f) { return f.tipe === 'file'; }) ? 'upload-cloud' : 'clipboard');
    var adaFile = st.fields.some(function (f) { return f.tipe === 'file'; });
    return '<div class="fsec-h"><span class="si">' + icon(ikon) + '</span><div><h2>' + esc(st.judul) + '</h2><p>' + (adaFile ? 'Format PDF/JPG/PNG. Foto dikompres otomatis sebelum diunggah.' : 'Kolom bertanda <span class="req">*</span> wajib diisi.') + '</p></div></div>' +
      '<div class="grid-2">' + st.fields.map(fieldHtml).join('') + '</div>';
  }
  var LEBAR = { paragraf: 1, radio: 1, checkbox: 1, file: 1 };
  function fieldHtml(f) {
    var v = F.jaw[f.id], id = 'f_' + f.id, err = F.err[f.id], val = f.validasi || {};
    var lab = '<label for="' + id + '">' + esc(f.label) + (f.wajib ? '<span class="req" aria-hidden="true">*</span>' : '') + '</label>';
    var help = f.bantuan ? '<div class="help" id="' + id + '_h">' + esc(f.bantuan) + '</div>' : '';
    var aria = ' aria-invalid="' + (err ? 'true' : 'false') + '" aria-describedby="' + id + '_e' + (f.bantuan ? ' ' + id + '_h' : '') + '"' + (f.wajib ? ' aria-required="true"' : '');
    var inp;
    switch (f.tipe) {
      case 'paragraf': inp = '<textarea class="textarea" id="' + id + '" data-f="' + f.id + '" maxlength="' + (val.maxLen || 2000) + '"' + aria + '>' + esc(v || '') + '</textarea><div class="help" style="text-align:right"><span data-cnt="' + f.id + '">' + String(v || '').length + '</span> / ' + (val.maxLen || 2000) + '</div>'; break;
      case 'dropdown': inp = '<select class="select" id="' + id + '" data-f="' + f.id + '"' + aria + '><option value="">— Pilih —</option>' + f.opsi.map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>'; break;
      case 'radio': inp = '<div class="choices" role="radiogroup" aria-labelledby="' + id + '_l">' + f.opsi.map(function (o, i) { return '<label class="choice"><input type="radio" name="' + id + '" value="' + esc(o) + '" data-f="' + f.id + '"' + (o === v ? ' checked' : '') + (i === 0 ? ' id="' + id + '"' : '') + '>' + esc(o) + '</label>'; }).join('') + '</div>'; lab = '<span class="label" id="' + id + '_l">' + esc(f.label) + (f.wajib ? '<span class="req">*</span>' : '') + '</span>'; break;
      case 'checkbox': var arr = Array.isArray(v) ? v : []; inp = '<div class="choices">' + f.opsi.map(function (o, i) { return '<label class="choice"><input type="checkbox" value="' + esc(o) + '" data-f="' + f.id + '"' + (arr.indexOf(o) >= 0 ? ' checked' : '') + (i === 0 ? ' id="' + id + '"' : '') + '>' + esc(o) + '</label>'; }).join('') + '</div>'; lab = '<span class="label">' + esc(f.label) + (f.wajib ? '<span class="req">*</span>' : '') + '</span>'; break;
      case 'file': return fileFieldHtml(f);
      default:
        var t = { email: 'email', telepon: 'tel', angka: 'number', tanggal: 'date' }[f.tipe] || 'text';
        var ph = { email: 'nama@contoh.com', telepon: '08xxxxxxxxxx' }[f.tipe] || '';
        var extra = (t === 'number' ? (val.min !== undefined ? ' min="' + val.min + '"' : '') + (val.max !== undefined ? ' max="' + val.max + '"' : '') + ' inputmode="numeric"' : '') +
          (t === 'tel' ? ' inputmode="tel" autocomplete="tel"' : '') + (t === 'email' ? ' autocomplete="email" inputmode="email"' : '') + (f.peran === 'nama' ? ' autocomplete="name"' : '') + (val.maxLen ? ' maxlength="' + val.maxLen + '"' : '');
        inp = '<input class="input" type="' + t + '" id="' + id + '" data-f="' + f.id + '" value="' + esc(v || '') + '" placeholder="' + ph + '"' + extra + aria + '>';
    }
    return '<div class="field ' + (LEBAR[f.tipe] ? 'span-2 ' : '') + (err ? 'is-invalid' : '') + '" data-wrap="' + f.id + '">' + lab + inp + help + '<div class="err" id="' + id + '_e" role="alert">' + (err ? icon('alert-circle', 'ico-sm') + esc(err) : '') + '</div></div>';
  }
  function fileFieldHtml(f) {
    var b = F.berkas[f.id], err = F.err[f.id], val = f.validasi || {}, acc = (val.accept || ['pdf', 'jpg', 'png']);
    var accept = acc.map(function (a) { return a === 'jpg' ? '.jpg,.jpeg,image/jpeg' : a === 'png' ? '.png,image/png' : a === 'pdf' ? '.pdf,application/pdf' : a === 'webp' ? '.webp,image/webp' : '.doc,.docx'; }).join(',');
    var isi = b ? '<div class="fcard"><div class="fp">' + (b.preview ? '<img src="' + b.preview + '" alt="">' : icon('file-text', 'ico-lg')) + '</div><div class="fm"><b>' + esc(b.nama) + '</b><span>' + A.ukuran(b.ukuran) + ' · siap dikirim</span></div>' +
      '<button type="button" class="btn btn-ghost btn-icon btn-sm" data-rm="' + f.id + '" aria-label="Hapus berkas ' + esc(f.label) + '">' + icon('x') + '</button></div>'
      : '<label class="drop" for="fi_' + f.id + '" data-drop="' + f.id + '"><div class="di">' + icon('upload-cloud') + '</div><b>Seret berkas ke sini atau pilih berkas</b><span>' + acc.join(', ').toUpperCase() + ' · maks ' + (val.maxMB || 2) + ' MB</span></label>';
    return '<div class="field span-2 ' + (err ? 'is-invalid' : '') + '" data-wrap="' + f.id + '"><span class="label">' + esc(f.label) + (f.wajib ? '<span class="req-pill">WAJIB</span>' : '<span class="opt-pill">Opsional</span>') + '</span>' +
      isi + '<input type="file" id="fi_' + f.id + '" class="sr-only" accept="' + accept + '" data-file="' + f.id + '">' + (f.bantuan ? '<div class="help">' + esc(f.bantuan) + '</div>' : '') +
      '<div class="err" role="alert">' + (err ? icon('alert-circle', 'ico-sm') + esc(err) : '') + '</div></div>';
  }
  function reviewHtml() {
    var html = '<div class="fsec-h"><span class="si">' + icon('clipboard') + '</span><div><h2>Periksa & Kirim</h2><p>Pastikan seluruh data sudah benar sebelum dikirim.</p></div></div>';
    var errN = Object.keys(F.err).length;
    if (errN) html += '<div class="err-box">' + icon('alert-triangle') + '<div>Masih ada ' + errN + ' isian yang perlu diperbaiki. Klik "Ubah" pada bagian bertanda.</div></div>';
    F.steps.forEach(function (s, i) {
      if (s.review) return;
      html += '<div class="review-sec"><div class="rh"><span>' + esc(s.judul) + '</span><button type="button" class="btn btn-ghost btn-xs" data-goto="' + i + '">' + icon('edit', 'ico-sm') + 'Ubah</button></div><dl>' +
        s.fields.map(function (f) {
          var v = f.tipe === 'file' ? (F.berkas[f.id] ? '✓ ' + F.berkas[f.id].nama : (f.wajib ? '' : 'Tidak diunggah')) : F.jaw[f.id];
          if (Array.isArray(v)) v = v.join(', ');
          if (f.tipe === 'tanggal' && v) v = A.tgl(v);
          var salah = F.err[f.id];
          return '<dt>' + esc(f.label) + '</dt><dd' + (salah ? ' style="color:var(--bad)"' : '') + '>' + (salah ? esc(salah) : esc(v || '—')) + '</dd>';
        }).join('') + '</dl></div>';
    });
    html += '<label class="consent"><input type="checkbox" id="setuju"' + (F.setuju ? ' checked' : '') + '><span>Saya menyatakan bahwa data yang saya isi adalah <b>benar</b> dan dapat dipertanggungjawabkan. Saya bersedia dihubungi panitia melalui email dan WhatsApp.</span></label>' +
      '<input type="text" name="website" id="hpot" tabindex="-1" autocomplete="off" class="sr-only" aria-hidden="true">';
    return html;
  }
  function fieldById(id) { return F.d.fields.filter(function (f) { return f.id === id; })[0]; }
  function nilaiInput(f) {
    if (f.tipe === 'radio') { var r = qs('input[name="f_' + f.id + '"]:checked'); return r ? r.value : ''; }
    if (f.tipe === 'checkbox') return qsa('input[type=checkbox][data-f="' + f.id + '"]').filter(function (c) { return c.checked; }).map(function (c) { return c.value; });
    var el = qs('#f_' + f.id); return el ? el.value : '';
  }
  function validasi(f) {
    var v = f.tipe === 'file' ? F.berkas[f.id] : F.jaw[f.id], val = f.validasi || {};
    if (f.tipe === 'file') return !v && f.wajib ? f.label + ' wajib diunggah.' : '';
    if (f.tipe === 'checkbox') { v = v || []; if (f.wajib && !v.length) return 'Pilih minimal satu.'; if (val.max && v.length > val.max) return 'Maksimal ' + val.max + ' pilihan.'; return ''; }
    var s = String(v == null ? '' : v).trim();
    if (!s) return f.wajib ? f.label + ' wajib diisi.' : '';
    if (f.tipe === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)) return 'Format email tidak valid.';
    if (f.tipe === 'telepon' && !/^08\d{8,12}$/.test(A.hp08(s))) return 'Nomor tidak valid (contoh: 081234567890).';
    if (f.tipe === 'angka') { if (isNaN(Number(s))) return 'Harus berupa angka.'; if (val.min !== undefined && Number(s) < val.min) return 'Minimal ' + val.min + '.'; if (val.max !== undefined && Number(s) > val.max) return 'Maksimal ' + val.max + '.'; }
    if (f.tipe === 'tanggal' && !A.toDate(s)) return 'Tanggal tidak valid.';
    if (val.minLen && s.length < val.minLen) return 'Minimal ' + val.minLen + ' karakter.';
    if (val.pattern) { try { if (!new RegExp('^(?:' + val.pattern + ')$').test(s)) return val.pesan || 'Format tidak sesuai.'; } catch (e) {} }
    return '';
  }
  function tampilErr(f) {
    var w = qs('[data-wrap="' + f.id + '"]'); if (!w) return;
    var e = F.err[f.id];
    w.classList.toggle('is-invalid', !!e);
    w.classList.toggle('is-valid', !e && f.tipe !== 'file' && !!String(F.jaw[f.id] || '').trim());
    var box = w.querySelector('.err'); if (box) box.innerHTML = e ? icon('alert-circle', 'ico-sm') + esc(e) : '';
    var inp = qs('#f_' + f.id); if (inp) inp.setAttribute('aria-invalid', e ? 'true' : 'false');
  }
  function bindForm() {
    var st = F.steps[F.i];
    qsa('[data-f]').forEach(function (el) {
      var f = fieldById(el.dataset.f);
      var ev = el.type === 'radio' || el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(ev, function () {
        F.jaw[f.id] = nilaiInput(f);
        if (f.tipe === 'telepon' && F.jaw[f.id]) F.jaw[f.id] = F.jaw[f.id].replace(/[^\d+ ]/g, '');
        var c = qs('[data-cnt="' + f.id + '"]'); if (c) c.textContent = String(F.jaw[f.id]).length;
        if (F.err[f.id]) { var e = validasi(f); if (e) F.err[f.id] = e; else delete F.err[f.id]; tampilErr(f); }
        simpanDraftLambat();
      });
      el.addEventListener('blur', function () { var e = validasi(f); if (e) F.err[f.id] = e; else delete F.err[f.id]; tampilErr(f); });
    });
    qsa('[data-file]').forEach(function (inp) { inp.addEventListener('change', function () { if (inp.files[0]) pilihFile(fieldById(inp.dataset.file), inp.files[0]); }); });
    qsa('[data-drop]').forEach(function (z) {
      ['dragenter', 'dragover'].forEach(function (t) { z.addEventListener(t, function (e) { e.preventDefault(); z.classList.add('over'); }); });
      ['dragleave', 'drop'].forEach(function (t) { z.addEventListener(t, function (e) { e.preventDefault(); z.classList.remove('over'); }); });
      z.addEventListener('drop', function (e) { var fl = e.dataTransfer.files[0]; if (fl) pilihFile(fieldById(z.dataset.drop), fl); });
    });
    qsa('[data-rm]').forEach(function (b) { b.onclick = function () { delete F.berkas[b.dataset.rm]; renderForm(); }; });
    qsa('.stp.done').forEach(function (b) { b.onclick = function () { F.i = +b.dataset.s; renderForm(); window.scrollTo(0, 0); }; });
    qsa('[data-goto]').forEach(function (b) { b.onclick = function () { F.i = +b.dataset.goto; renderForm(); window.scrollTo(0, 0); }; });
    var prev = qs('#fPrev'); if (prev) prev.onclick = function () { if (F.i) { F.i--; renderForm(); window.scrollTo(0, 0); } };
    var next = qs('#fNext'); if (next) next.onclick = function () {
      var bad = null;
      st.fields.forEach(function (f) { if (f.tipe !== 'file') F.jaw[f.id] = nilaiInput(f); var e = validasi(f); if (e) { F.err[f.id] = e; if (!bad) bad = f; } else delete F.err[f.id]; tampilErr(f); });
      simpanDraft();
      if (bad) { var el = qs('[data-wrap="' + bad.id + '"]'); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); var i = el.querySelector('input,select,textarea'); if (i) setTimeout(function () { i.focus({ preventScroll: true }); }, 350); } A.toast('Periksa kembali isian yang ditandai merah.', 'warn'); return; }
      F.i++; renderForm(); window.scrollTo(0, 0);
    };
    var sub = qs('#fSubmit'); if (sub) {
      qs('#setuju').onchange = function (e) { F.setuju = e.target.checked; };
      sub.onclick = kirim;
    }
  }
  function pilihFile(f, file) {
    var val = f.validasi || {}, acc = val.accept || ['pdf', 'jpg', 'png'], maks = (val.maxMB || 2) * 1048576;
    var ext = (file.name.match(/\.([a-z0-9]+)$/i) || [])[1] || ''; ext = ext.toLowerCase() === 'jpeg' ? 'jpg' : ext.toLowerCase();
    var mimeOk = { pdf: ['application/pdf'], jpg: ['image/jpeg'], png: ['image/png'], webp: ['image/webp'], doc: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] };
    var ok = acc.some(function (a) { return (mimeOk[a] || []).indexOf(file.type) >= 0 || a === ext; });
    if (!ok) { F.err[f.id] = 'Format harus ' + acc.join('/').toUpperCase() + '.'; tampilErr(f); return; }
    var proses = /^image\//.test(file.type) && (file.size > 900 * 1024 || file.size > maks) ? A.compressImage(file, 1800, 0.82) : Promise.resolve(file);
    var w = qs('[data-wrap="' + f.id + '"] .err'); if (w) w.innerHTML = '<span class="muted">Memproses berkas…</span>';
    proses.then(function (fl) {
      if (fl.size > maks) { F.err[f.id] = 'Ukuran berkas ' + A.ukuran(fl.size) + ' melebihi batas ' + (val.maxMB || 2) + ' MB.'; tampilErr(f); return; }
      return A.fileToBase64(fl).then(function (b64) {
        F.berkas[f.id] = { nama: fl.name, mime: fl.type, data: b64, ukuran: fl.size, preview: /^image\//.test(fl.type) ? URL.createObjectURL(fl) : '' };
        delete F.err[f.id]; renderForm();
      });
    }).catch(function (e) { F.err[f.id] = e.message; tampilErr(f); });
  }
  function kirim() {
    // validasi semua langkah
    var errStep = -1;
    F.steps.forEach(function (s, i) { s.fields.forEach(function (f) { var e = validasi(f); if (e) { F.err[f.id] = e; if (errStep < 0) errStep = i; } else delete F.err[f.id]; }); });
    if (errStep >= 0) { A.toast('Ada isian yang belum lengkap.', 'warn'); F.i = errStep; renderForm(); return; }
    if (!F.setuju) { A.toast('Centang pernyataan kebenaran data terlebih dahulu.', 'warn'); qs('.consent').focus && qs('#setuju').focus(); return; }
    var berkas = {}; Object.keys(F.berkas).forEach(function (k) { var b = F.berkas[k]; berkas[k] = { nama: b.nama, mime: b.mime, data: b.data }; });
    var payload = { periode_id: F.d.periode.id, versi: F.d.versi, jawaban: F.jaw, berkas: berkas, website: (qs('#hpot') || {}).value || '' };
    A.loader(Object.keys(berkas).length ? 'Mengunggah berkas & mengirim pendaftaran…\nMohon jangan menutup halaman.' : 'Mengirim pendaftaran…');
    Api.post('pub.daftar', payload, { publik: true }).then(function (r) {
      A.loader(false);
      A.Store.del(draftKey(F.d.periode.id));
      A.Store.sset('ppdb_sukses', JSON.stringify(r.data));
      F = null;
      location.hash = '#/sukses';
    }).catch(function (e) {
      A.loader(false);
      if (e.code === 'VALIDATION' && e.data && e.data.errors) {
        F.err = e.data.errors; var first = -1;
        F.steps.forEach(function (s, i) { if (first < 0 && s.fields.some(function (f) { return F.err[f.id]; })) first = i; });
        F.i = first >= 0 ? first : F.i; renderForm(); A.toast(e.message, 'bad');
      } else if (e.code === 'FORM_CHANGED') { simpanDraft(); A.toast(e.message, 'warn', 8000); pageDaftar(); }
      else if (e.code === 'CLOSED') { renderTutup({ alasan: e.message }); }
      else A.toast(e.message, 'bad', 8000);
    });
  }
  function pageSukses() {
    var d = null; try { d = JSON.parse(A.Store.sget('ppdb_sukses') || 'null'); } catch (e) {}
    if (!d) { location.hash = '#/status'; return; }
    document.title = 'Pendaftaran Berhasil — ' + namaSekolah();
    app.innerHTML = '<div class="center-card card card-pad"><div class="big-ico ok">' + icon('check-circle') + '</div><h1 style="font-size:30px">Pendaftaran Berhasil!</h1>' +
      '<p class="muted">Terima kasih, <b style="color:var(--ink)">' + esc(d.nama) + '</b>. Data pendaftaran ' + esc(d.periode || '') + ' telah kami terima.</p>' +
      '<div class="token-box"><div class="muted" style="font-size:13px;font-weight:600;letter-spacing:.08em">TOKEN PENDAFTARAN ANDA</div><div class="tk" id="tk">' + esc(d.token) + '</div>' +
      '<button class="btn btn-sm" id="cpTk">' + icon('copy', 'ico-sm') + 'Salin Token</button></div>' +
      '<div class="info-rows">' + (d.email ? '<div class="info-row">' + icon('mail') + '<div>Konfirmasi ' + (d.notif && d.notif.email ? 'dikirim' : 'akan dikirim') + ' ke <b>' + esc(d.email) + '</b></div></div>' : '') +
      (d.wa ? '<div class="info-row">' + icon('whatsapp') + '<div>' + (d.notif && d.notif.wa ? 'Notifikasi WhatsApp dikirim ke' : 'Nomor WhatsApp terdaftar:') + ' <b>' + esc(d.wa) + '</b></div></div>' : '') + '</div>' +
      '<div class="note-box">' + icon('info', 'ico-sm') + ' <b>Penting:</b> simpan token ini (foto layar atau salin). Token dan email digunakan untuk mengecek status pendaftaran.</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:22px"><a class="btn" href="#/status?t=' + encodeURIComponent(d.token) + '">' + icon('search') + 'Cek Status Pendaftaran</a><a class="btn btn-outline" href="#/">Kembali ke Beranda</a></div></div>';
    qs('#cpTk').onclick = function () { A.copyText(d.token).then(function () { A.toast('Token disalin.', 'ok'); }); };
  }

  /* ---------------- CEK STATUS ---------------- */
  function pageStatus(r) {
    document.title = 'Cek Status Pendaftaran — ' + namaSekolah();
    var mode = r.q && r.q.t ? 'token' : 'token';
    app.innerHTML = '<div class="center-card" style="text-align:left"><div style="text-align:center;margin-bottom:22px"><div class="big-ico" style="background:var(--brand-50);color:var(--brand-text)">' + icon('search') + '</div>' +
      '<h1 style="font-size:30px">Cek Status Pendaftaran</h1><p class="muted">Masukkan token pendaftaran atau email yang digunakan saat mendaftar.</p></div>' +
      '<form class="card card-pad" id="stForm"><div class="seg" style="margin-bottom:16px;width:100%" role="tablist"><button type="button" class="active" data-m="token" style="flex:1">Token</button><button type="button" data-m="email" style="flex:1">Email</button></div>' +
      '<div class="field"><label for="stq" id="stLab">Token pendaftaran</label><input class="input mono" id="stq" placeholder="PPDB-27-XXXXXX" autocomplete="off" value="' + esc((r.q && r.q.t) || '') + '" style="font-size:17px"></div>' +
      '<button class="btn btn-block btn-lg" id="stBtn">' + icon('search') + 'Cek Status</button>' +
      '<p class="help" style="margin:12px 0 0;text-align:center">' + icon('shield', 'ico-sm') + ' Demi privasi, data pribadi lengkap tidak ditampilkan. Percobaan dibatasi untuk mencegah penebakan.</p></form><div id="stRes" style="margin-top:18px" aria-live="polite"></div></div>';
    qsa('[data-m]').forEach(function (b) { b.onclick = function () { mode = b.dataset.m; qsa('[data-m]').forEach(function (x) { x.classList.toggle('active', x === b); }); var i = qs('#stq'); i.value = ''; i.placeholder = mode === 'email' ? 'nama@contoh.com' : 'PPDB-27-XXXXXX'; i.type = mode === 'email' ? 'email' : 'text'; i.classList.toggle('mono', mode !== 'email'); qs('#stLab').textContent = mode === 'email' ? 'Email pendaftar' : 'Token pendaftaran'; i.focus(); }; });
    qs('#stForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var q = qs('#stq').value.trim(); if (!q) { qs('#stq').focus(); return; }
      if (mode === 'token') q = q.toUpperCase();
      var btn = qs('#stBtn'); A.btnBusy(btn, true, 'Memeriksa…');
      Api.post('pub.status', { q: q }, { publik: true }).then(function (x) { qs('#stRes').innerHTML = x.data.hasil.map(hasilStatus).join(''); })
        .catch(function (err) {
          qs('#stRes').innerHTML = '<div class="card card-pad" style="display:flex;gap:14px;align-items:flex-start"><span class="big-ico ' + (err.code === 'RATE' ? 'lock' : 'bad') + '" style="width:48px;height:48px;margin:0;border-radius:14px">' + icon(err.code === 'RATE' ? 'clock' : 'alert-circle') + '</span><div><b>' + (err.code === 'RATE' ? 'Terlalu banyak percobaan' : err.code === 'NOT_FOUND' ? 'Data tidak ditemukan' : 'Tidak dapat memeriksa') + '</b><p class="muted" style="margin:4px 0 0">' + esc(err.message) + '</p></div></div>';
        }).finally(function () { A.btnBusy(btn, false); });
    });
    if (r.q && r.q.t) setTimeout(function () { qs('#stForm').requestSubmit ? qs('#stForm').requestSubmit() : qs('#stBtn').click(); }, 50);
  }
  function hasilStatus(h) {
    var urut = ['Baru', 'Diverifikasi', 'Diterima'], pos = urut.indexOf(h.status), gagal = h.status === 'Ditolak', cad = h.status === 'Cadangan';
    var tahap = ['Terdaftar', 'Diverifikasi', gagal ? 'Ditolak' : cad ? 'Cadangan' : 'Diterima'];
    var level = gagal || cad ? 2 : pos;
    return '<div class="card card-pad status-card" style="margin-bottom:14px"><div class="status-hero st-' + esc(h.status) + '">' + icon(STATUS_IKON[h.status] || 'info') + '<div><span>Status pendaftaran</span><b>' + esc(h.status) + '</b><span>' + esc(STATUS_TEKS[h.status] || '') + '</span></div></div>' +
      '<div class="track">' + tahap.map(function (t, i) { var on = i <= level; return '<div class="tp ' + (on ? 'on' : '') + (i === level ? ' cur' : '') + (i === 2 && gagal ? ' bad' : '') + '"><div class="n">' + (on ? icon(i === 2 && gagal ? 'x' : 'check', 'ico-sm') : i + 1) + '</div>' + t + '</div>'; }).join('') + '</div>' +
      '<dl class="kv" style="margin-top:18px"><dt>Token</dt><dd class="mono">' + esc(h.token) + '</dd><dt>Nama</dt><dd>' + esc(h.nama) + '</dd><dt>Periode</dt><dd>' + esc(h.periode) + '</dd>' +
      (h.jenjang ? '<dt>Jenjang</dt><dd>' + esc(h.jenjang) + '</dd>' : '') + '<dt>Tanggal daftar</dt><dd>' + esc(A.tglJam(h.tanggal)) + '</dd><dt>Diperbarui</dt><dd>' + esc(A.tglJam(h.diperbarui)) + '</dd></dl>' +
      (h.catatan ? '<div class="note-box"><b>' + icon('message', 'ico-sm') + ' Catatan dari panitia</b><p style="margin:6px 0 0">' + esc(h.catatan) + '</p></div>' : '') + '</div>';
  }

  /* ---------------- VERIFIKASI DOKUMEN ---------------- */
  function pageVerify(r) {
    var kode = (r.seg[1] || '').toUpperCase();
    document.title = 'Verifikasi Dokumen — ' + namaSekolah();
    app.innerHTML = '<div class="center-card card card-pad"><div class="spin" style="width:40px;height:40px;margin:20px auto;border:4px solid var(--brand-100);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite"></div><p class="muted">Memeriksa keaslian dokumen…</p></div>';
    Api.get('pub.verify', { k: kode }).then(function (x) {
      var d = x.data, sah = d.status === 'SAH';
      app.innerHTML = '<div class="center-card card card-pad"><div class="big-ico ' + (sah ? 'ok' : 'bad') + '">' + icon(sah ? 'shield-check' : 'slash') + '</div>' +
        '<span class="verify-badge ' + (sah ? 'ok' : 'bad') + '">' + icon(sah ? 'check-circle' : 'alert-triangle') + (sah ? 'DOKUMEN SAH' : 'DOKUMEN DITARIK') + '</span>' +
        '<h1 style="font-size:24px;margin-top:18px">' + esc(d.jenis || 'Dokumen') + '</h1><p class="muted">' + esc(d.instansi || '') + '</p>' +
        (!sah && d.alasanTarik ? '<div class="err-box" style="text-align:left">' + icon('info') + '<div>Alasan penarikan: ' + esc(d.alasanTarik) + '</div></div>' : '') +
        '<dl class="kv" style="text-align:left;margin-top:16px"><dt>Nomor</dt><dd>' + esc(d.nomor) + '</dd><dt>Tanggal terbit</dt><dd>' + esc(A.tglJam(d.tanggal)) + '</dd><dt>Kode verifikasi</dt><dd class="mono" style="font-size:12.5px">' + esc(kode.replace(/-\d+$/, '')) + '</dd></dl>' +
        (d.penandatangan.length ? '<div class="signers">' + d.penandatangan.map(function (s) { return '<div class="signer"><span class="si">' + icon('pen') + '</span><div><b>' + esc(s.nama || '-') + '</b><div class="muted" style="font-size:12.5px">' + esc(s.jabatan || s.label || '') + ' · ' + esc(s.metode === 'BYPASS' ? 'Disetujui superadmin (bypass)' : s.metode === 'GOOGLE+PIN' ? 'Tanda tangan elektronik (Google + PIN)' : 'Diterbitkan operator') + (s.waktu ? ' · ' + esc(A.tglJam(s.waktu)) : '') + '</div></div></div>'; }).join('') + '</div>' : '') +
        (d.hashPdf ? '<div class="note-box"><b>' + icon('file', 'ico-sm') + ' Cek keaslian berkas PDF</b><p style="margin:6px 0 10px;font-size:13px" class="muted">Unggah PDF yang Anda terima untuk memastikan isinya tidak diubah. Berkas diperiksa di perangkat Anda, tidak dikirim ke server.</p><input type="file" accept="application/pdf" id="hashIn" class="input" style="padding:8px"><div id="hashRes" style="margin-top:10px"></div></div>' : '') +
        '<p class="help" style="margin-top:18px">Tanda tangan elektronik tidak tersertifikasi — keaslian diverifikasi melalui halaman resmi ini.</p></div>';
      var hi = qs('#hashIn');
      if (hi) hi.onchange = function () {
        var f = hi.files[0]; if (!f) return;
        f.arrayBuffer().then(function (buf) { return crypto.subtle.digest('SHA-256', buf); }).then(function (h) {
          var hex = Array.prototype.map.call(new Uint8Array(h), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
          qs('#hashRes').innerHTML = hex === d.hashPdf ? '<span class="badge b-ok">' + icon('check', 'ico-sm') + 'Berkas identik dengan dokumen resmi</span>' : '<span class="badge b-bad">Berkas BERBEDA dari dokumen resmi (mungkin telah diubah)</span>';
        }).catch(function () { qs('#hashRes').innerHTML = '<span class="badge b-warn">Peramban tidak mendukung pemeriksaan ini.</span>'; });
      };
    }).catch(function (e) {
      app.innerHTML = '<div class="center-card card card-pad"><div class="big-ico bad">' + icon('alert-triangle') + '</div><span class="verify-badge bad">' + icon('slash') + 'TIDAK TERVERIFIKASI</span><h1 style="font-size:24px;margin-top:16px">Dokumen tidak ditemukan</h1><p class="muted">' + esc(e.message) + '</p><a class="btn btn-outline" href="#/">Kembali ke Beranda</a></div>';
    });
  }

  function page404() { app.innerHTML = '<div class="err-page"><div class="big-ico lock">' + icon('search') + '</div><h1>Halaman tidak ditemukan</h1><p class="muted">Tautan yang Anda buka tidak tersedia.</p><a class="btn" href="#/">Ke Beranda</a></div>'; }
  function errorView(e, retry) {
    var id = 'rt' + Date.now();
    setTimeout(function () { var b = document.getElementById(id); if (b && retry) b.onclick = function () { retry(); }; }, 0);
    return '<div class="empty card" style="margin:40px auto;max-width:520px"><div class="ico-wrap">' + icon(e.code === 'NET' ? 'globe' : 'alert-triangle', 'ico-lg') + '</div><h3>' + (e.code === 'CONFIG' ? 'Website belum dikonfigurasi' : 'Gagal memuat data') + '</h3><p>' + esc(e.message) + '</p>' + (retry ? '<button class="btn" id="' + id + '">' + icon('refresh') + 'Coba Lagi</button>' : '') + '</div>';
  }

  /* ---------------- drawer & interaksi global ---------------- */
  function bukaDrawer() { var d = qs('#mdrawer'); d.classList.add('open'); d.setAttribute('aria-hidden', 'false'); qs('#burger').setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; }
  function tutupDrawer() { var d = qs('#mdrawer'); if (!d.classList.contains('open')) return; d.classList.remove('open'); d.setAttribute('aria-hidden', 'true'); qs('#burger').setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  qs('#burger').innerHTML = icon('menu');
  qs('#burger').onclick = bukaDrawer;
  qsa('[data-close-drawer]').forEach(function (b) { if (b.tagName === 'BUTTON') b.innerHTML = icon('x'); });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-close-drawer]'); if (t) tutupDrawer();
    var tg = e.target.closest('[data-theme-toggle]'); if (tg) A.Theme.toggle();
  });
  document.addEventListener('change', function (e) { if (e.target.matches('[data-theme-switch]')) { if ((A.Theme.current() === 'dark') !== e.target.checked) A.Theme.toggle(); } });
  var toTop = qs('#toTop'); toTop.innerHTML = icon('arrow-up'); toTop.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  window.addEventListener('scroll', function () { var y = window.scrollY; qs('#nav').classList.toggle('scrolled', y > 8); toTop.classList.toggle('show', y > 800); }, { passive: true });

  /* ---------------- start ---------------- */
  A.Theme.init();
  var cached = A.Swr.get('pub_boot');
  if (cached) { S.boot = cached.d; A.Theme.init(S.boot.settings && S.boot.settings.mode_default); applyShell(); }
  if (!Api.configured()) { applyShellKosong(); app.innerHTML = errorView({ code: 'CONFIG', message: 'Isi GAS_URL di berkas js/config.js dengan URL Web App Apps Script (diakhiri /exec), lalu muat ulang.' }); return; }
  Api.warm('pub');
  router();
  muatBoot().then(function () { if (S.boot && !A.Store.get('ppdb_theme')) A.Theme.init(S.boot.settings.mode_default); }).catch(function () {});
  function applyShellKosong() { qs('#brandName').textContent = 'Website Sekolah'; qs('#footer').innerHTML = ''; }
})();
