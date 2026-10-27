/* =====================================================================
   admin-ppdb.js — Ringkasan, Pendaftar (daftar & detail), Periode, Form Builder
   ===================================================================== */
(function () {
  'use strict';
  var A = window.App, Admin = window.Admin, icon = A.icon, esc = A.esc, qs = A.qs, qsa = A.qsa, Api = A.Api;

  /* =================== RINGKASAN =================== */
  Admin.page('ringkasan', {
    roles: Admin.SA,
    render: function (view) {
      var st = { periode_id: '' };
      view.innerHTML = '<div id="dh"></div><div id="db">' + '<div class="kpis">' + [1, 2, 3, 4].map(function () { return '<div class="card kpi"><div class="sk" style="height:90px"></div></div>'; }).join('') + '</div><div class="sk" style="height:300px;border-radius:18px"></div></div>';
      function muat() {
        Admin.load('dash.summary', st, draw).catch(function (e) { Admin.fail(qs('#db'), e, muat); });
      }
      function draw(d) {
        if (Admin.cur !== 'ringkasan') return;
        Admin.setBadge('baru', d.perStatus.Baru); Admin.setBadge('gagal', d.notif.email.gagal + d.notif.wa.gagal);
        var p = d.periode, sp = p && p.status;
        qs('#dh').innerHTML = Admin.head('Ringkasan PPDB', p ? esc(p.nama) + ' · ' + esc(A.tgl(p.buka, true)) + ' – ' + esc(A.tgl(p.tutup, true)) : 'Belum ada periode',
          '<select class="select" id="dper" style="min-height:40px;width:auto" aria-label="Pilih periode">' + d.periodes.map(function (x) { return '<option value="' + esc(x.id) + '"' + (p && x.id === p.id ? ' selected' : '') + '>' + esc(x.nama) + '</option>'; }).join('') + '</select>' +
          '<button class="btn btn-sm" id="dxl">' + icon('download', 'ico-sm') + 'Unduh Excel</button>');
        var naik = d.seri.length > 1 ? d.hariIni - d.seri[d.seri.length - 2].jumlah : 0, persen = d.kuota ? Math.round(d.terisi / d.kuota * 100) : 0;
        qs('#db').innerHTML =
          '<div class="kpis">' +
          kpi('users', 'Total Pendaftar', A.angka(d.total), '<span class="' + (d.hariIni ? 'up' : '') + '">+' + d.hariIni + '</span> hari ini') +
          kpi('trending-up', 'Pendaftar Hari Ini', A.angka(d.hariIni), naik === 0 ? 'sama dengan kemarin' : '<span class="' + (naik > 0 ? 'up' : 'down') + '">' + (naik > 0 ? '▲ ' : '▼ ') + Math.abs(naik) + '</span> dibanding kemarin') +
          kpi('target', 'Kuota Terisi', d.kuota ? persen + '%' : '—', d.kuota ? '<div style="flex:1"><div class="prog"><span style="width:' + Math.min(100, persen) + '%"></span></div><div style="margin-top:4px">' + A.angka(d.terisi) + ' / ' + A.angka(d.kuota) + ' kursi</div></div>' : 'Kuota tidak dibatasi') +
          kpi(sp && sp.open ? 'unlock' : 'lock', 'Status Periode', sp ? (sp.open ? 'DIBUKA' : 'DITUTUP') : '—', sp ? (sp.open ? 'Tutup ' + esc(A.tgl(p.tutup)) + ' · ' + sisaHari(p.tutup) : esc(sp.alasan || '')) : '<a href="#/periode">Buat periode</a>') +
          '</div><div class="status-cards">' + Admin.STATUS.map(function (s) {
            var v = Admin.STATUS_VAR[s];
            return '<a class="sc" href="#/pendaftar?status=' + encodeURIComponent(s) + '" style="background:var(' + v + '-bg);color:var(' + v + ')"><span>' + esc(s) + '</span><b>' + A.angka(d.perStatus[s] || 0) + '</b></a>';
          }).join('') + '</div>' +
          '<div class="grid-dash"><div class="card"><div class="card-h"><h3>' + icon('bar-chart', 'ico-sm') + 'Tren Pendaftar per Hari</h3><span class="muted" style="font-size:12.5px">' + d.seri.length + ' hari terakhir</span></div><div class="card-b"><div class="chart" id="cLine"></div></div></div>' +
          '<div class="card"><div class="card-h"><h3>' + icon('pie-chart', 'ico-sm') + 'Komposisi Status</h3></div><div class="card-b" id="cDonut"></div></div></div>' +
          '<div class="grid-dash"><div class="card"><div class="card-h"><h3>' + icon('users', 'ico-sm') + 'Pendaftar Terbaru</h3><a class="btn btn-ghost btn-xs" href="#/pendaftar">Lihat semua ' + icon('arrow-right', 'ico-sm') + '</a></div>' +
          (d.terbaru.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Pendaftar</th><th>Jenjang</th><th>Tanggal</th><th>Status</th></tr></thead><tbody>' + d.terbaru.map(function (r) {
            return '<tr style="cursor:pointer" data-go="' + esc(r.id) + '"><td><div class="cell-main"><span class="ini">' + esc(Admin.inisial(r.nama)) + '</span><div><b>' + esc(r.nama) + '</b><span class="mono">' + esc(r.token) + '</span></div></div></td><td>' + esc(r.jenjang || '-') + '</td><td>' + esc(A.relatif(r.tanggal)) + '</td><td>' + Admin.badgeStatus(r.status) + '</td></tr>';
          }).join('') + '</tbody></table></div>' : Admin.empty('inbox', 'Belum ada pendaftar', 'Bagikan tautan pendaftaran.')) + '</div>' +
          '<div style="display:grid;gap:18px;align-content:start"><div class="card"><div class="card-h"><h3>' + icon('sparkles', 'ico-sm') + 'Insight Otomatis</h3></div><div class="card-b insight">' +
          d.insight.map(function (x) { return '<div class="ins ' + esc(x.tipe) + '">' + icon({ naik: 'trending-up', turun: 'trending-down', peringatan: 'alert-triangle', info: 'info' }[x.tipe] || 'info') + '<span>' + esc(x.teks) + '</span></div>'; }).join('') + '</div></div>' +
          '<div class="card"><div class="card-h"><h3>' + icon('send', 'ico-sm') + 'Status Notifikasi (30 hari)</h3><a class="btn btn-ghost btn-xs" href="#/log">Buka log</a></div><div class="card-b"><dl class="dl">' +
          '<dt>' + icon('mail', 'ico-sm') + ' Email</dt><dd>' + d.notif.email.terkirim + ' terkirim · <span style="color:' + (d.notif.email.gagal ? 'var(--bad)' : 'inherit') + '">' + d.notif.email.gagal + ' gagal</span>' + (d.notif.email.antri ? ' · ' + d.notif.email.antri + ' antre' : '') + '</dd>' +
          '<dt>' + icon('whatsapp', 'ico-sm') + ' WhatsApp</dt><dd>' + d.notif.wa.terkirim + ' terkirim · <span style="color:' + (d.notif.wa.gagal ? 'var(--bad)' : 'inherit') + '">' + d.notif.wa.gagal + ' gagal</span>' + (d.notif.wa.antri ? ' · ' + d.notif.wa.antri + ' antre' : '') + '</dd></dl>' +
          (Object.keys(d.perJenjang).length ? '<div class="sec-title">Per Jenjang</div>' + Object.keys(d.perJenjang).map(function (j) { var n = d.perJenjang[j], pc = d.total ? Math.round(n / d.total * 100) : 0; return '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:13px"><span>' + esc(j) + '</span><b>' + n + ' · ' + pc + '%</b></div><div class="prog" style="margin-top:4px"><span style="width:' + pc + '%"></span></div></div>'; }).join('') : '') +
          '</div></div></div></div><p class="help" style="text-align:right">Diperbarui ' + esc(A.tglJam(d.dibuat)) + ' · tekan ' + icon('refresh', 'ico-sm') + ' untuk membaca ulang dari Sheets</p>';
        Admin.lineChart(qs('#cLine'), d.seri.map(function (x) { var dt = A.toDate(x.tanggal); return { label: A.tgl(x.tanggal, true), short: dt ? dt.getDate() + '/' + (dt.getMonth() + 1) : x.tanggal, value: x.jumlah }; }), { label: 'Pendaftar per hari', unit: ' pendaftar' });
        Admin.donut(qs('#cDonut'), Admin.STATUS.map(function (s) { return { label: s, value: d.perStatus[s] || 0, color: Admin.cssVar(Admin.STATUS_VAR[s]) }; }), { center: 'Pendaftar' });
        qsa('[data-go]').forEach(function (tr) { tr.onclick = function () { Admin.go('pendaftar/' + tr.dataset.go); }; });
        qs('#dper').onchange = function (e) { st.periode_id = e.target.value; muat(); };
        qs('#dxl').onclick = function () { eksporPendaftar({ periode_id: st.periode_id || (p && p.id) }, this); };
      }
      muat();
      Admin._poll = setInterval(function () { if (document.visibilityState === 'visible' && Admin.cur === 'ringkasan') Admin.load('dash.summary', st, draw, { maxAge: 55000 }).catch(function () {}); }, 60000);
    }
  });
  function kpi(ic, label, val, sub) { return '<div class="card kpi"><div class="kh"><span>' + esc(label) + '</span><span class="ki">' + icon(ic) + '</span></div><div class="kv">' + val + '</div><div class="ks">' + sub + '</div></div>'; }
  Admin.kpi = kpi;
  function sisaHari(t) { var d = A.toDate(t); if (!d) return ''; var n = Math.ceil((d - new Date()) / 86400000) + 1; return n > 0 ? n + ' hari lagi' : 'berakhir'; }
  function eksporPendaftar(filter, btn) {
    A.btnBusy(btn, true, 'Menyiapkan…');
    Api.post('pendaftar.export', filter).then(function (r) {
      var d = r.data, ring = [['Sekolah', d.sekolah], ['Periode', d.periode], ['Dibuat', d.dibuat.replace('T', ' ')], ['Total pendaftar', d.rows.length], ['', '']];
      Admin.STATUS.forEach(function (s) { ring.push([s, d.ringkasan[s] || 0]); });
      return Admin.exportXlsx([{ nama: 'Pendaftar', kolom: d.kolom, rows: d.rows }, { nama: 'Ringkasan', kolom: ['Keterangan', 'Nilai'], rows: ring }],
        'Laporan-PPDB-' + String(d.periode).replace(/[^\w]+/g, '-') + '-' + d.dibuat.substring(0, 10)).then(function (f) { if (f === 'xlsx') A.toast('Laporan Excel diunduh (' + d.rows.length + ' baris).', 'ok'); });
    }).catch(function (e) { A.toast(e.message, 'bad'); }).finally(function () { A.btnBusy(btn, false); });
  }

  /* =================== PENDAFTAR =================== */
  Admin.page('pendaftar', {
    roles: Admin.SA,
    render: function (view, r) { if (r.seg[1]) return detail(view, r.seg[1]); daftar(view, r.q); }
  });
  function daftar(view, q) {
    var st = { periode_id: '', status: q.status || '', q: '', jenjang: '', dari: '', sampai: '', page: 1, per: 20 };
    var periodes = [];
    view.innerHTML = Admin.head('Data Pendaftar', 'Cari, saring, dan kelola status calon peserta didik.', '<button class="btn btn-sm btn-light" id="pxl">' + icon('download', 'ico-sm') + 'Unduh Excel (sesuai filter)</button>') +
      '<div class="card"><div class="chips" id="ptabs"></div><div class="filters"><label class="search"><span class="sr-only">Cari</span>' + icon('search') + '<input class="input" id="pq" type="search" placeholder="Cari nama, token, email, atau nomor WA"></label>' +
      '<select class="select" id="pper" aria-label="Periode"><option value="">Semua periode</option></select><select class="select" id="pjen" aria-label="Jenjang"><option value="">Semua jenjang</option></select>' +
      '<input class="input" type="date" id="pdari" aria-label="Dari tanggal"><input class="input" type="date" id="psampai" aria-label="Sampai tanggal"><button class="btn btn-ghost btn-sm" id="preset">Reset</button></div><div id="plist">' + Admin.skel(6) + '</div></div>';
    Admin.load('periode.list', {}, function (list) {
      periodes = list;
      qs('#pper').innerHTML = '<option value="">Semua periode</option>' + list.map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === st.periode_id ? ' selected' : '') + '>' + esc(p.nama_periode) + '</option>'; }).join('');
    }).catch(function () {});
    function muat() { Admin.load('pendaftar.list', st, draw).catch(function (e) { Admin.fail(qs('#plist'), e, muat); }); }
    function draw(d) {
      if (Admin.cur !== 'pendaftar' || !qs('#plist')) return;
      Admin.setBadge('baru', d.hitung.Baru);
      qs('#ptabs').innerHTML = ['Semua'].concat(Admin.STATUS).map(function (s) { var on = (st.status || 'Semua') === s; return '<button class="chip ' + (on ? 'active' : '') + '" data-s="' + esc(s) + '">' + esc(s) + ' <span class="n">' + A.angka(d.hitung[s] || 0) + '</span></button>'; }).join('');
      qsa('#ptabs [data-s]').forEach(function (b) { b.onclick = function () { st.status = b.dataset.s === 'Semua' ? '' : b.dataset.s; st.page = 1; muat(); }; });
      var jsel = qs('#pjen'); if (jsel.options.length <= 1) jsel.innerHTML = '<option value="">Semua jenjang</option>' + d.jenjang.map(function (j) { return '<option>' + esc(j) + '</option>'; }).join('');
      if (!d.rows.length) { qs('#plist').innerHTML = Admin.empty('search', 'Tidak ada pendaftar', 'Coba ubah filter atau kata kunci.'); return; }
      qs('#plist').innerHTML = '<div class="table-wrap"><table class="table"><thead><tr><th>Pendaftar</th><th>Kontak</th><th>Jenjang</th><th>Tanggal Daftar</th><th>Status</th><th>Notifikasi</th><th></th></tr></thead><tbody>' +
        d.rows.map(function (x) {
          return '<tr><td><div class="cell-main"><span class="ini">' + esc(Admin.inisial(x.nama)) + '</span><div><b>' + esc(x.nama) + (x.dummy ? ' <span class="badge no-dot" style="font-size:10px">DUMMY</span>' : '') + '</b><span class="mono">' + esc(x.token) + '</span></div></div></td>' +
            '<td><div style="font-size:13px">' + esc(x.email || '-') + '</div><div class="muted mono" style="font-size:12px">' + esc(x.no_wa || '') + '</div></td><td>' + esc(x.jenjang || '-') + '</td><td>' + esc(A.tglJam(x.tanggal)) + '</td><td>' + Admin.badgeStatus(x.status) + '</td>' +
            '<td>' + notifIkon(x.notif.email, 'mail') + ' ' + notifIkon(x.notif.wa, 'whatsapp') + '</td><td class="row-act"><a class="btn btn-sm btn-light" href="#/pendaftar/' + esc(x.id) + '">Detail</a></td></tr>';
        }).join('') + '</tbody></table></div>' + Admin.pager(d.total, d.page, d.per, function (p) { st.page = p; muat(); });
    }
    qs('#pq').addEventListener('input', A.debounce(function (e) { st.q = e.target.value.trim(); st.page = 1; muat(); }, 350));
    qs('#pper').onchange = function (e) { st.periode_id = e.target.value; st.page = 1; qs('#pjen').innerHTML = '<option value="">Semua jenjang</option>'; muat(); };
    qs('#pjen').onchange = function (e) { st.jenjang = e.target.value; st.page = 1; muat(); };
    qs('#pdari').onchange = function (e) { st.dari = e.target.value; st.page = 1; muat(); };
    qs('#psampai').onchange = function (e) { st.sampai = e.target.value; st.page = 1; muat(); };
    qs('#preset').onclick = function () { st = { periode_id: '', status: '', q: '', jenjang: '', dari: '', sampai: '', page: 1, per: 20 }; ['#pq', '#pdari', '#psampai'].forEach(function (s) { qs(s).value = ''; }); qs('#pper').value = ''; qs('#pjen').value = ''; muat(); };
    qs('#pxl').onclick = function () { eksporPendaftar(st, this); };
    muat();
  }
  function notifIkon(n, ic) {
    if (!n) return '<span class="wa-badge belum" title="Belum ada">' + icon(ic, 'ico-sm') + '</span>';
    var cls = n.status === 'Terkirim' ? 'ya' : n.status === 'Gagal' ? 'tidak' : 'belum';
    return '<span class="wa-badge ' + cls + '" title="' + esc(n.status + ' · ' + A.tglJam(n.waktu)) + '">' + icon(ic, 'ico-sm') + '</span>';
  }

  function detail(view, id) {
    view.innerHTML = '<a class="btn btn-ghost btn-sm" href="#/pendaftar">' + icon('arrow-left', 'ico-sm') + 'Kembali ke daftar</a><div id="pd" style="margin-top:12px">' + Admin.skel(6, 60) + '</div>';
    function muat() { Api.post('pendaftar.detail', { id: id }).then(function (r) { draw(r.data); }).catch(function (e) { Admin.fail(qs('#pd'), e, muat); }); }
    function draw(d) {
      if (!qs('#pd')) return;
      var p = d.pendaftar;
      Admin.setTitle(p.nama, ['PPDB', 'Pendaftar']);
      var tab = 'jawaban';
      qs('#pd').innerHTML = '<div class="card card-pad" style="margin-bottom:18px;display:flex;gap:16px;align-items:center;flex-wrap:wrap"><span class="ini" style="width:56px;height:56px;font-size:19px;border-radius:16px">' + esc(Admin.inisial(p.nama)) + '</span>' +
        '<div style="flex:1;min-width:200px"><h2 style="margin:0;font-size:22px">' + esc(p.nama) + '</h2><div class="muted" style="font-size:13.5px;display:flex;gap:12px;flex-wrap:wrap;margin-top:4px"><span class="mono">' + esc(p.token) + '</span><span>' + esc(p.periode) + '</span><span>Mendaftar ' + esc(A.tglJam(p.tanggal)) + '</span></div></div>' +
        Admin.badgeStatus(p.status) + (p.dummy ? '<span class="badge">Data dummy</span>' : '') + '</div>' +
        '<div class="split"><div class="card"><div class="tabs" style="padding:0 12px" role="tablist"><button class="active" data-t="jawaban">' + icon('clipboard', 'ico-sm') + 'Jawaban Formulir</button><button data-t="berkas">' + icon('paperclip', 'ico-sm') + 'Berkas (' + d.berkas.filter(function (b) { return b.berkas; }).length + ')</button><button data-t="dokumen">' + icon('file-text', 'ico-sm') + 'Dokumen (' + d.dokumen.length + ')</button></div><div class="card-b" id="ptab"></div></div>' +
        '<div class="sticky" style="display:grid;gap:16px"><div class="card"><div class="card-h"><h3>' + icon('edit', 'ico-sm') + 'Ubah Status</h3></div><div class="card-b">' +
        '<div class="field"><label for="sSt">Status</label><select class="select" id="sSt">' + Admin.STATUS.map(function (s) { return '<option' + (s === p.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label for="sCat">Catatan untuk pendaftar</label><textarea class="textarea" id="sCat" rows="3" placeholder="Tampil di halaman cek status dan notifikasi">' + esc(p.catatan || '') + '</textarea></div>' +
        '<label class="choice" style="margin-bottom:12px"><input type="checkbox" id="sNot" checked>Kirim notifikasi Email & WhatsApp</label><button class="btn btn-block" id="sSave">' + icon('save') + 'Simpan Status</button></div></div>' +
        '<div class="card"><div class="card-h"><h3>' + icon('user', 'ico-sm') + 'Kontak</h3></div><div class="card-b"><dl class="dl"><dt>Email</dt><dd>' + esc(p.email || '-') + '</dd><dt>WhatsApp</dt><dd class="mono">' + esc(p.no_wa || '-') + '</dd><dt>Jenjang</dt><dd>' + esc(p.jenjang || '-') + '</dd></dl>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">' + (p.no_wa ? '<a class="btn btn-sm btn-light" target="_blank" rel="noopener" href="' + A.waLink(p.no_wa) + '">' + icon('whatsapp', 'ico-sm') + 'Chat</a>' : '') +
        (p.email ? '<a class="btn btn-sm btn-light" href="mailto:' + esc(p.email) + '">' + icon('mail', 'ico-sm') + 'Email</a>' : '') + '<button class="btn btn-sm btn-light" id="pRem">' + icon('bell', 'ico-sm') + 'Kirim Pengingat</button>' +
        (p.folder ? '<a class="btn btn-sm btn-ghost" target="_blank" rel="noopener" href="' + esc(p.folder) + '">' + icon('external', 'ico-sm') + 'Folder Drive</a>' : '') + '</div></div></div>' +
        '<div class="card"><div class="card-h"><h3>' + icon('history', 'ico-sm') + 'Riwayat & Notifikasi</h3></div><div class="card-b"><div class="timeline">' +
        (d.riwayat.concat(d.notif.map(function (n) { return { waktu: n.waktu, aksi: 'NOTIF_' + n.kanal.toUpperCase(), detail: n.event + ' · ' + n.status + (n.error ? ' · ' + n.error : ''), aktor: n.status }; })).sort(function (a, b) { return String(b.waktu).localeCompare(String(a.waktu)); }).slice(0, 25).map(function (h) {
          return '<div class="tl"><span class="dot">' + icon(/NOTIF_WA/.test(h.aksi) ? 'whatsapp' : /NOTIF/.test(h.aksi) ? 'mail' : /STATUS/.test(h.aksi) ? 'edit' : 'check', 'ico-sm') + '</span><div><b>' + esc(labelAksi(h.aksi)) + '</b><div>' + esc(h.detail || '') + '</div><div class="m">' + esc(A.tglJam(h.waktu)) + ' · ' + esc(h.aktor) + '</div></div></div>';
        }).join('') || '<p class="muted">Belum ada riwayat.</p>') + '</div></div></div>' +
        '<button class="btn btn-ghost btn-sm" id="pDel" style="color:var(--bad)">' + icon('trash', 'ico-sm') + 'Hapus pendaftar</button></div></div>';
      function showTab() {
        qsa('[data-t]').forEach(function (b) { b.classList.toggle('active', b.dataset.t === tab); });
        var el = qs('#ptab');
        if (tab === 'jawaban') el.innerHTML = d.bagian.map(function (b) { return '<div class="sec-title" style="margin-top:4px">' + esc(b.judul) + '</div><dl class="dl" style="margin-bottom:12px">' + b.isi.map(function (x) { return '<dt>' + esc(x.label) + '</dt><dd>' + esc(x.nilai) + '</dd>'; }).join('') + '</dl>'; }).join('');
        if (tab === 'berkas') el.innerHTML = d.berkas.map(function (b) {
          return '<div class="file-tile"><span class="fi">' + icon(b.berkas && /^image/.test(b.berkas.mime) ? 'image' : 'file-text') + '</span><div class="fm"><b>' + esc(b.label) + (b.wajib ? ' <span class="req-pill" style="font-size:10px">WAJIB</span>' : '') + '</b><span>' + (b.berkas ? esc(b.berkas.nama) + ' · ' + A.ukuran(b.berkas.ukuran) : 'Tidak diunggah') + '</span></div>' +
            (b.berkas ? '<button class="btn btn-sm btn-light" data-pv="' + esc(b.berkas.id) + '" data-n="' + esc(b.label) + '">' + icon('eye', 'ico-sm') + 'Lihat</button>' : '') + '</div>';
        }).join('') || Admin.empty('paperclip', 'Tidak ada berkas');
        if (tab === 'dokumen') el.innerHTML = (d.dokumen.length ? d.dokumen.map(function (x) { return '<div class="file-tile"><span class="fi">' + icon('file-text') + '</span><div class="fm"><b>' + esc(x.judul) + '</b><span>' + esc(x.nomor || 'Belum bernomor') + ' · ' + esc(x.status) + '</span></div><a class="btn btn-sm btn-light" href="#/dokumen?id=' + esc(x.id) + '">Buka</a></div>'; }).join('') : Admin.empty('file-text', 'Belum ada dokumen')) +
          '<button class="btn btn-sm" id="pNewDoc" style="margin-top:10px">' + icon('plus', 'ico-sm') + 'Buat Dokumen untuk Pendaftar Ini</button>';
        qsa('[data-pv]', el).forEach(function (b) { b.onclick = function () { Admin.previewFile(b.dataset.pv, b.dataset.n); }; });
        var nd = qs('#pNewDoc'); if (nd) nd.onclick = function () { if (Admin.buatDokumen) Admin.buatDokumen({ refId: p.id, nama: p.nama }, muat); };
      }
      qsa('[data-t]').forEach(function (b) { b.onclick = function () { tab = b.dataset.t; showTab(); }; });
      showTab();
      qs('#sSave').onclick = function () {
        Admin.call('pendaftar.status', { id: p.id, status: qs('#sSt').value, catatan: qs('#sCat').value, notify: qs('#sNot').checked }, { btn: this }).then(muat).catch(function () {});
      };
      qs('#pRem').onclick = function () {
        A.confirmDlg({ title: 'Kirim pengingat', ok: 'Kirim', input: { label: 'Pesan pengingat', placeholder: 'Mis. Mohon lengkapi berkas rapor sebelum 10 Februari.' } }).then(function (msg) {
          if (msg) Admin.call('pendaftar.remind', { id: p.id, pesan: msg }).then(muat).catch(function () {});
        });
      };
      qs('#pDel').onclick = function () {
        A.confirmDlg({ title: 'Hapus pendaftar?', danger: true, ok: 'Hapus permanen', html: 'Data <b>' + esc(p.nama) + '</b> dan berkasnya akan dihapus (berkas dipindah ke Sampah Drive). Ketik <b>HAPUS</b> untuk konfirmasi.', input: { label: 'Konfirmasi', placeholder: 'HAPUS', harus: 'HAPUS' } })
          .then(function (y) { if (y) Admin.call('pendaftar.delete', { ids: [p.id] }).then(function () { Admin.go('pendaftar'); }).catch(function () {}); });
      };
    }
    muat();
  }
  function labelAksi(a) {
    return { PENDAFTARAN: 'Mendaftar', UBAH_STATUS: 'Status diubah', KIRIM_PENGINGAT: 'Pengingat dikirim', NOTIF_EMAIL: 'Email', NOTIF_WA: 'WhatsApp', BUAT_DOKUMEN: 'Dokumen dibuat' }[a] || a;
  }

  /* =================== PERIODE =================== */
  Admin.page('periode', {
    roles: Admin.SA,
    render: function (view) {
      view.innerHTML = Admin.head('Periode PPDB', 'Atur jadwal, kuota, dan saklar buka/tutup pendaftaran. Formulir di website menolak kiriman saat periode ditutup (divalidasi di server).', '<button class="btn btn-sm" id="perNew">' + icon('plus', 'ico-sm') + 'Tambah Periode</button>') + '<div id="perBody">' + Admin.skel(4, 70) + '</div>';
      function muat() { Admin.load('periode.list', {}, draw).catch(function (e) { Admin.fail(qs('#perBody'), e, muat); }); }
      function draw(list) {
        if (!qs('#perBody')) return;
        if (!list.length) { qs('#perBody').innerHTML = '<div class="card">' + Admin.empty('calendar', 'Belum ada periode', 'Buat periode pertama untuk membuka pendaftaran.') + '</div>'; return; }
        var aktif = list.filter(function (p) { return p.status.open; })[0] || list[0];
        var kodeLbl = { dibuka: 'DIBUKA', ditutup: 'DITUTUP', terjadwal: 'TERJADWAL', berakhir: 'BERAKHIR', penuh: 'PENUH', belum: 'BELUM DIATUR' };
        qs('#perBody').innerHTML = '<div class="card card-pad" style="margin-bottom:18px"><div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;justify-content:space-between"><div><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><h3 style="margin:0;font-size:19px">' + esc(aktif.nama_periode) + '</h3><span class="badge ' + (aktif.status.open ? 'b-ok' : 'b-bad') + '">' + kodeLbl[aktif.status.kode] + '</span></div>' +
          '<p class="muted" style="margin:6px 0 0;font-size:13.5px">Dibuka ' + esc(A.tgl(aktif.tanggal_buka)) + ' · Ditutup otomatis ' + esc(A.tgl(aktif.tanggal_tutup)) + ' · Kuota ' + (aktif.kuota ? A.angka(aktif.kuota) : 'tanpa batas') + ' · Terisi ' + A.angka(aktif.status.terisi) + '</p>' +
          (aktif.status.alasan ? '<p class="help" style="margin:6px 0 0">' + esc(aktif.status.alasan) + '</p>' : '') + '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-sm btn-light" href="#/form-builder?p=' + esc(aktif.id) + '">' + icon('layers', 'ico-sm') + 'Atur Formulir</a><a class="btn btn-sm btn-light" href="#/pendaftar">' + icon('users', 'ico-sm') + 'Lihat Pendaftar</a></div></div>' +
          '<div class="sec-title">Saklar pendaftaran</div><div class="seg" id="perSw" role="radiogroup">' + [['auto', 'Ikuti Jadwal'], ['buka', 'Buka Manual'], ['tutup', 'Tutup Manual']].map(function (o) { return '<button role="radio" aria-checked="' + (aktif.status_manual === o[0]) + '" class="' + (aktif.status_manual === o[0] ? 'active' : '') + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>' +
          '<p class="help" style="margin:8px 0 0">"Ikuti Jadwal" membuka/menutup otomatis sesuai tanggal. "Tutup Manual" langsung menolak kiriman formulir di website.</p></div>' +
          '<div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Periode</th><th>Tahun Ajaran</th><th>Buka</th><th>Tutup</th><th class="num">Kuota</th><th class="num">Terisi</th><th>Formulir</th><th>Status</th><th></th></tr></thead><tbody>' +
          list.map(function (p) {
            return '<tr><td><b>' + esc(p.nama_periode) + '</b>' + (p.keterangan ? '<div class="muted" style="font-size:12px">' + esc(p.keterangan) + '</div>' : '') + '</td><td>' + esc(p.tahun_ajaran) + '</td><td>' + esc(A.tgl(p.tanggal_buka, true)) + '</td><td>' + esc(A.tgl(p.tanggal_tutup, true)) + '</td>' +
              '<td class="num">' + (p.kuota ? A.angka(p.kuota) : '∞') + '</td><td class="num">' + A.angka(p.status.terisi) + '</td><td>v' + p.versiForm + ' · ' + p.jumlahField + ' field</td><td><span class="badge ' + (p.status.open ? 'b-ok' : p.status.kode === 'terjadwal' ? 'b-info' : 'b-bad') + '">' + kodeLbl[p.status.kode] + '</span>' + (p.status_manual !== 'auto' ? '<div class="muted" style="font-size:11px">manual</div>' : '') + '</td>' +
              '<td class="row-act"><button class="btn btn-ghost btn-icon btn-sm" data-ed="' + esc(p.id) + '" aria-label="Ubah">' + icon('edit') + '</button><a class="btn btn-ghost btn-icon btn-sm" href="#/form-builder?p=' + esc(p.id) + '" aria-label="Formulir">' + icon('layers') + '</a>' +
              (p.status.terisi ? '' : '<button class="btn btn-ghost btn-icon btn-sm" data-del="' + esc(p.id) + '" aria-label="Hapus">' + icon('trash') + '</button>') + '</td></tr>';
          }).join('') + '</tbody></table></div></div>';
        qsa('#perSw [data-v]').forEach(function (b) {
          b.onclick = function () {
            var v = b.dataset.v, go = function () { Admin.call('periode.toggle', { id: aktif.id, status_manual: v }).then(muat).catch(function () {}); };
            if (v === 'tutup') A.confirmDlg({ title: 'Tutup pendaftaran sekarang?', danger: true, text: 'Pengunjung tidak dapat mengirim formulir sampai saklar diubah kembali.', ok: 'Tutup Pendaftaran' }).then(function (y) { if (y) go(); }); else go();
          };
        });
        qsa('[data-ed]').forEach(function (b) { b.onclick = function () { form(list.filter(function (p) { return p.id === b.dataset.ed; })[0], list); }; });
        qsa('[data-del]').forEach(function (b) { b.onclick = function () { A.confirmDlg({ title: 'Hapus periode?', danger: true, text: 'Periode beserta formulirnya akan dihapus.', ok: 'Hapus' }).then(function (y) { if (y) Admin.call('periode.delete', { id: b.dataset.del }).then(muat).catch(function () {}); }); }; });
        qs('#perNew').onclick = function () { form(null, list); };
      }
      function form(p, list) {
        var baru = !p; p = p || { status_manual: 'auto', kuota: 0 };
        var thn = new Date().getFullYear();
        var m = A.modal({ title: baru ? 'Tambah Periode' : 'Ubah Periode', body: Admin.formHtml([
          { k: 'nama_periode', l: 'Nama periode', req: 1, span: 1, ph: 'PPDB ' + (thn + 1) + '/' + (thn + 2) + ' Gelombang 2' }, { k: 'tahun_ajaran', l: 'Tahun ajaran', ph: (thn + 1) + '/' + (thn + 2) },
          { k: 'kuota', l: 'Kuota (0 = tanpa batas)', t: 'number' }, { k: 'tanggal_buka', l: 'Tanggal buka', t: 'date' }, { k: 'tanggal_tutup', l: 'Tanggal tutup', t: 'date' },
          { k: 'status_manual', l: 'Mode', t: 'select', opts: [{ v: 'auto', l: 'Ikuti jadwal' }, { v: 'buka', l: 'Buka manual' }, { v: 'tutup', l: 'Tutup manual' }] },
          { k: 'keterangan', l: 'Keterangan (tampil di website)', t: 'textarea', rows: 2 }].concat(baru ? [{ k: 'salinDari', l: 'Formulir', t: 'select', opts: [{ v: '', l: 'Gunakan formulir bawaan' }].concat(list.map(function (x) { return { v: x.id, l: 'Salin dari: ' + x.nama_periode }; })) }] : []), p),
          foot: '<button class="btn btn-light" data-close>Batal</button><button class="btn" id="pSave">' + icon('save') + 'Simpan</button>' });
        var get = Admin.formBind(m.el, [], p);
        qs('#pSave', m.el).onclick = function () {
          var o = {}; qsa('[data-k]', m.el).forEach(function (el) { o[el.dataset.k] = el.value; });
          var salin = o.salinDari; delete o.salinDari; o.id = p.id;
          Admin.call('periode.save', { periode: o, salinDari: salin }, { btn: this }).then(function () { m.close(); muat(); }).catch(function () {});
        };
      }
      muat();
    }
  });

  /* =================== FORM BUILDER =================== */
  var TIPE = [
    { t: 'teks', l: 'Teks Singkat', i: 'type' }, { t: 'paragraf', l: 'Paragraf', i: 'align-left' }, { t: 'angka', l: 'Angka', i: 'hash' }, { t: 'email', l: 'Email', i: 'mail' },
    { t: 'telepon', l: 'Telepon / WA', i: 'phone' }, { t: 'tanggal', l: 'Tanggal', i: 'calendar' }, { t: 'dropdown', l: 'Dropdown', i: 'list-down' }, { t: 'radio', l: 'Pilihan Tunggal', i: 'circle-dot' },
    { t: 'checkbox', l: 'Kotak Centang', i: 'check-square' }, { t: 'file', l: 'Unggah Berkas', i: 'upload-cloud' }];
  function tipeLabel(t) { var x = TIPE.filter(function (y) { return y.t === t; })[0]; return x ? x.l : t; }
  Admin.page('form-builder', {
    roles: Admin.SA,
    render: function (view, r) {
      var S = { pid: r.q.p || '', fields: [], versi: 0, sel: null, dirty: false, jumlah: 0 };
      view.innerHTML = '<div id="fbH"></div><div id="fbB">' + Admin.skel(5, 64) + '</div>';
      Admin.load('periode.list', {}, function (list) {
        if (!list.length) { qs('#fbB').innerHTML = '<div class="card">' + Admin.empty('calendar', 'Belum ada periode', 'Buat periode terlebih dahulu.', '<a class="btn" href="#/periode">Ke Periode</a>') + '</div>'; return; }
        if (!S.pid) S.pid = (list.filter(function (p) { return p.status.open; })[0] || list[0]).id;
        S.periodes = list; muatForm();
      }).catch(function (e) { Admin.fail(qs('#fbB'), e); });
      function muatForm() {
        Api.post('form.get', { periode_id: S.pid }).then(function (x) {
          var d = x.data; S.versi = d.versi; S.jumlah = d.jumlahPendaftar; S.fields = JSON.parse(JSON.stringify(d.fields)); S.sel = S.fields[0] ? S.fields[0].id : null; S.dirty = false;
          if (d.draft && d.draft.fields && d.draft.fields.length) {
            A.confirmDlg({ title: 'Ada draf tersimpan', text: 'Draf terakhir disimpan ' + A.tglJam(d.draft.disimpan) + '. Lanjutkan mengedit draf?', ok: 'Pakai draf' }).then(function (y) { if (y) { S.fields = d.draft.fields; S.sel = S.fields[0] && S.fields[0].id; S.dirty = true; draw(); } });
          }
          draw();
        }).catch(function (e) { Admin.fail(qs('#fbB'), e, muatForm); });
      }
      function bagianList() { var b = []; S.fields.forEach(function (f) { if (b.indexOf(f.bagian) < 0) b.push(f.bagian); }); return b; }
      function draw() {
        if (!qs('#fbB')) return;
        qs('#fbH').innerHTML = Admin.head('Form Builder PPDB', 'Rancang formulir seperti Google Form. Perubahan berlaku setelah <b>Terbitkan</b>.',
          '<select class="select" id="fbPer" style="min-height:40px;width:auto">' + S.periodes.map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === S.pid ? ' selected' : '') + '>' + esc(p.nama_periode) + '</option>'; }).join('') + '</select>' +
          '<span class="badge b-brand no-dot">Versi ' + S.versi + (S.dirty ? ' · belum diterbitkan' : ' · diterbitkan') + '</span>' +
          '<button class="btn btn-sm btn-light" id="fbPrev">' + icon('eye', 'ico-sm') + 'Pratinjau</button><button class="btn btn-sm btn-light" id="fbDraft">' + icon('save', 'ico-sm') + 'Simpan Draf</button><button class="btn btn-sm btn-accent" id="fbPub">' + icon('send', 'ico-sm') + 'Terbitkan</button>');
        var html = (S.jumlah ? '<div class="info-strip warn">' + icon('alert-triangle') + '<div>Formulir ini sudah memiliki <b>' + S.jumlah + ' pendaftar</b>. Menerbitkan perubahan akan membuat <b>versi baru</b>; jawaban lama tetap terbaca dengan versi sebelumnya.</div></div>' : '') +
          '<div class="fb"><div class="card card-pad sticky"><div class="sec-title" style="margin-top:0">Tambah Field</div><div class="palette">' + TIPE.map(function (t) { return '<button class="pal" data-add="' + t.t + '">' + icon(t.i) + t.l + '</button>'; }).join('') + '</div>' +
          '<button class="btn btn-sm btn-light btn-block" id="fbSec" style="margin-top:12px">' + icon('plus', 'ico-sm') + 'Tambah Bagian</button><p class="help" style="margin-top:12px">Seret ' + icon('grip', 'ico-sm') + ' untuk mengurutkan. Pindah bagian lewat panel properti.</p></div>' +
          '<div id="fbCanvas">' + bagianList().map(function (b) {
            var fs = S.fields.filter(function (f) { return f.bagian === b; });
            return '<div class="fsec"><div class="fsec-hd">' + icon('layers') + '<input class="input" data-sec="' + esc(b) + '" value="' + esc(b) + '" aria-label="Nama bagian"><span class="muted" style="font-size:12px;white-space:nowrap">' + fs.length + ' field</span></div><div class="fsec-list">' +
              fs.map(function (f) {
                var tipe = TIPE.filter(function (t) { return t.t === f.tipe; })[0] || TIPE[0];
                return '<div class="frow ' + (f.id === S.sel ? 'sel' : '') + '" data-id="' + esc(f.id) + '"><span class="drag-h" aria-label="Seret">' + icon('grip') + '</span><div class="fl"><b>' + esc(f.label) + (f.wajib ? ' <span class="req">*</span>' : '') + '</b><span>' + esc(tipe.l) + (f.peran ? ' · peran: ' + esc(f.peran) : '') + (f.tipe === 'file' ? ' · ' + ((f.validasi && f.validasi.accept) || []).join('/').toUpperCase() + ' maks ' + ((f.validasi && f.validasi.maxMB) || 2) + 'MB' : '') + '</span></div>' +
                  '<span class="tag">' + (f.wajib ? 'Wajib' : 'Opsional') + '</span><button class="btn btn-ghost btn-icon btn-sm" data-up="' + esc(f.id) + '" aria-label="Naikkan">' + icon('chevron-up', 'ico-sm') + '</button><button class="btn btn-ghost btn-icon btn-sm" data-dup="' + esc(f.id) + '" aria-label="Duplikat">' + icon('copy', 'ico-sm') + '</button><button class="btn btn-ghost btn-icon btn-sm" data-rm="' + esc(f.id) + '" aria-label="Hapus">' + icon('trash', 'ico-sm') + '</button></div>';
              }).join('') + '</div></div>';
          }).join('') + (S.fields.length ? '' : '<div class="card">' + Admin.empty('layers', 'Formulir kosong', 'Klik tipe field di kiri untuk menambah.') + '</div>') + '</div>' +
          '<div class="card card-pad sticky mini-form" id="fbProp"></div></div>';
        qs('#fbB').innerHTML = html;
        drawProp();
        qs('#fbPer').onchange = function (e) { if (S.dirty && !confirm('Perubahan belum disimpan. Ganti periode?')) { e.target.value = S.pid; return; } S.pid = e.target.value; muatForm(); };
        qsa('[data-add]').forEach(function (b) { b.onclick = function () { tambah(b.dataset.add); }; });
        qs('#fbSec').onclick = function () { A.confirmDlg({ title: 'Tambah bagian', ok: 'Tambah', input: { label: 'Nama bagian', placeholder: 'Mis. Data Prestasi' } }).then(function (n) { if (n) tambah('teks', n); }); };
        qsa('.frow').forEach(function (row) { row.onclick = function (e) { if (e.target.closest('button,.drag-h')) return; S.sel = row.dataset.id; draw(); }; });
        qsa('[data-rm]').forEach(function (b) { b.onclick = function () { S.fields = S.fields.filter(function (f) { return f.id !== b.dataset.rm; }); if (S.sel === b.dataset.rm) S.sel = S.fields[0] && S.fields[0].id; ubah(); }; });
        qsa('[data-dup]').forEach(function (b) { b.onclick = function () { var i = idx(b.dataset.dup), c = JSON.parse(JSON.stringify(S.fields[i])); c.id = 'f' + Date.now().toString(36); c.label += ' (salinan)'; c.peran = ''; c.kunci = ''; S.fields.splice(i + 1, 0, c); S.sel = c.id; ubah(); }; });
        qsa('[data-up]').forEach(function (b) { b.onclick = function () { var i = idx(b.dataset.up); if (i > 0) { var t = S.fields[i - 1]; S.fields[i - 1] = S.fields[i]; S.fields[i] = t; if (S.fields[i - 1].bagian !== S.fields[i].bagian) S.fields[i - 1].bagian = S.fields[i].bagian; ubah(); } }; });
        qsa('[data-sec]').forEach(function (inp) { inp.onchange = function () { var lama = inp.dataset.sec, baru = inp.value.trim() || lama; S.fields.forEach(function (f) { if (f.bagian === lama) f.bagian = baru; }); ubah(); }; });
        Admin.sortable(qs('#fbCanvas'), '.frow', function (rows, drag, target) {
          var id = drag.dataset.id, f = S.fields[idx(id)], tgt = S.fields[idx(target.dataset.id)];
          f.bagian = tgt.bagian;
          var order = rows.map(function (r) { return r.dataset.id; });
          S.fields.sort(function (a, b) { return order.indexOf(a.id) - order.indexOf(b.id); });
          ubah();
        });
        qs('#fbPrev').onclick = pratinjau;
        qs('#fbDraft').onclick = function () { Admin.call('form.saveDraft', { periode_id: S.pid, fields: S.fields }, { btn: this }).then(function (x) { S.dirty = true; if (x.data.peringatan.length) A.toast('Catatan: ' + x.data.peringatan[0], 'warn'); }).catch(function () {}); };
        qs('#fbPub').onclick = function () {
          var btn = this;
          A.confirmDlg({ title: 'Terbitkan formulir?', html: 'Formulir <b>versi ' + (S.versi + 1) + '</b> langsung dipakai di website untuk pendaftar baru.' + (S.jumlah ? '<br><br>' + S.jumlah + ' pendaftar sebelumnya tetap memakai versi lama.' : ''), ok: 'Terbitkan' })
            .then(function (y) { if (y) Admin.call('form.publish', { periode_id: S.pid, fields: S.fields }, { btn: btn }).then(function () { muatForm(); }).catch(function (e) { if (e.data && e.data.errors) A.toast(e.data.errors.join(' · '), 'bad', 9000); }); });
        };
      }
      function idx(id) { for (var i = 0; i < S.fields.length; i++) if (S.fields[i].id === id) return i; return -1; }
      function ubah() { S.dirty = true; draw(); }
      function tambah(tipe, bagian) {
        var cur = S.fields[idx(S.sel)], b = bagian || (cur ? cur.bagian : 'Data Pendaftar');
        var f = { id: 'f' + Date.now().toString(36), bagian: b, label: tipeLabel(tipe) + ' baru', tipe: tipe, wajib: false, opsi: ['dropdown', 'radio', 'checkbox'].indexOf(tipe) >= 0 ? ['Opsi 1', 'Opsi 2'] : [], validasi: tipe === 'file' ? { accept: ['pdf', 'jpg', 'png'], maxMB: 2 } : {}, bantuan: '', peran: '', kunci: '' };
        var last = -1; S.fields.forEach(function (x, i) { if (x.bagian === b) last = i; });
        S.fields.splice(last >= 0 ? last + 1 : S.fields.length, 0, f); S.sel = f.id; ubah();
        setTimeout(function () { var l = qs('#pLabel'); if (l) { l.focus(); l.select(); } }, 50);
      }
      function drawProp() {
        var el = qs('#fbProp'), f = S.fields[idx(S.sel)];
        if (!f) { el.innerHTML = '<p class="muted">Pilih field untuk mengatur propertinya.</p>'; return; }
        var v = f.validasi || {}, opsiT = ['dropdown', 'radio', 'checkbox'].indexOf(f.tipe) >= 0;
        el.innerHTML = '<div class="sec-title" style="margin-top:0">Properti Field</div>' +
          '<div class="field"><label for="pLabel">Label <span class="req">*</span></label><input class="input" id="pLabel" value="' + esc(f.label) + '"></div>' +
          '<div class="field"><label for="pTipe">Tipe</label><select class="select" id="pTipe">' + TIPE.map(function (t) { return '<option value="' + t.t + '"' + (t.t === f.tipe ? ' selected' : '') + '>' + t.l + '</option>'; }).join('') + '</select></div>' +
          '<div class="field"><label for="pBag">Bagian</label><select class="select" id="pBag">' + bagianList().map(function (b) { return '<option' + (b === f.bagian ? ' selected' : '') + '>' + esc(b) + '</option>'; }).join('') + '</select></div>' +
          '<div class="field"><label for="pHelp">Teks bantuan</label><input class="input" id="pHelp" value="' + esc(f.bantuan || '') + '"></div>' +
          '<label class="switch" style="margin-bottom:14px"><input type="checkbox" id="pWajib"' + (f.wajib ? ' checked' : '') + '><span class="track"></span><span>' + (f.tipe === 'file' ? 'Berkas wajib diunggah' : 'Wajib diisi') + '</span></label>' +
          (opsiT ? '<div class="field"><label for="pOpsi">Opsi (satu per baris)</label><textarea class="textarea" id="pOpsi" rows="5">' + esc((f.opsi || []).join('\n')) + '</textarea></div>' : '') +
          (f.tipe === 'file' ? '<div class="field"><span class="label">Jenis berkas</span><div class="pill-tog">' + ['pdf', 'jpg', 'png', 'webp', 'doc'].map(function (a) { return '<label><input type="checkbox" data-acc="' + a + '"' + ((v.accept || []).indexOf(a) >= 0 ? ' checked' : '') + '>' + a.toUpperCase() + '</label>'; }).join('') + '</div></div>' +
            '<div class="field"><label for="pMax">Batas ukuran (MB, maks 10)</label><input class="input" type="number" id="pMax" min="1" max="10" value="' + esc(v.maxMB || 2) + '"></div>' : '') +
          (['teks', 'paragraf'].indexOf(f.tipe) >= 0 ? '<div class="grid-2"><div class="field"><label for="pMin">Min. karakter</label><input class="input" type="number" id="pMin" value="' + esc(v.minLen || '') + '"></div><div class="field"><label for="pMaxL">Maks. karakter</label><input class="input" type="number" id="pMaxL" value="' + esc(v.maxLen || '') + '"></div></div>' : '') +
          (f.tipe === 'angka' ? '<div class="grid-2"><div class="field"><label for="pMinN">Nilai min.</label><input class="input" type="number" id="pMinN" value="' + esc(v.min === undefined ? '' : v.min) + '"></div><div class="field"><label for="pMaxN">Nilai maks.</label><input class="input" type="number" id="pMaxN" value="' + esc(v.max === undefined ? '' : v.max) + '"></div></div>' : '') +
          (f.tipe === 'checkbox' ? '<div class="field"><label for="pMaxC">Maks. pilihan</label><input class="input" type="number" id="pMaxC" value="' + esc(v.max || '') + '"></div>' : '') +
          (f.tipe === 'teks' ? '<details><summary class="help" style="cursor:pointer;margin-bottom:10px">Validasi pola (lanjutan)</summary><div class="field"><label for="pPat">Pola regex</label><input class="input mono" id="pPat" value="' + esc(v.pattern || '') + '" placeholder="\\d{10}"></div><div class="field"><label for="pPes">Pesan kesalahan</label><input class="input" id="pPes" value="' + esc(v.pesan || '') + '"></div></details>' : '') +
          '<div class="field"><label for="pPeran">Peran data</label><select class="select" id="pPeran">' + [['', '— Tidak ada —'], ['nama', 'Nama pendaftar'], ['email', 'Email (notifikasi)'], ['wa', 'WhatsApp (notifikasi)'], ['jenjang', 'Jenjang (statistik)']].map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === (f.peran || '') ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select><div class="help">Peran dipakai untuk notifikasi, CRM, dan ringkasan.</div></div>' +
          '<div class="field"><label for="pKunci">Kunci placeholder dokumen</label><input class="input mono" id="pKunci" value="' + esc(f.kunci || '') + '" placeholder="Otomatis dari label"><div class="help">Dipakai di template dokumen: <span class="kbd">{{' + esc(f.kunci || 'NAMA_LENGKAP') + '}}</span></div></div>';
        function set(k, val) { f[k] = val; S.dirty = true; var row = qs('.frow[data-id="' + f.id + '"] .fl b'); if (k === 'label' && row) row.textContent = val; }
        qs('#pLabel').oninput = function (e) { set('label', e.target.value); };
        qs('#pLabel').onchange = draw;
        qs('#pTipe').onchange = function (e) { f.tipe = e.target.value; if (['dropdown', 'radio', 'checkbox'].indexOf(f.tipe) >= 0 && !(f.opsi || []).length) f.opsi = ['Opsi 1', 'Opsi 2']; if (f.tipe === 'file') f.validasi = { accept: ['pdf', 'jpg', 'png'], maxMB: 2 }; ubah(); };
        qs('#pBag').onchange = function (e) { var i = idx(f.id); S.fields.splice(i, 1); f.bagian = e.target.value; var last = -1; S.fields.forEach(function (x, j) { if (x.bagian === f.bagian) last = j; }); S.fields.splice(last + 1, 0, f); ubah(); };
        qs('#pHelp').oninput = function (e) { set('bantuan', e.target.value); };
        qs('#pWajib').onchange = function (e) { f.wajib = e.target.checked; ubah(); };
        var po = qs('#pOpsi'); if (po) po.oninput = function (e) { set('opsi', e.target.value.split('\n').map(function (s) { return s.trim(); }).filter(String)); };
        qsa('[data-acc]').forEach(function (c) { c.onchange = function () { v.accept = qsa('[data-acc]').filter(function (x) { return x.checked; }).map(function (x) { return x.dataset.acc; }); f.validasi = v; S.dirty = true; }; });
        [['#pMax', 'maxMB'], ['#pMin', 'minLen'], ['#pMaxL', 'maxLen'], ['#pMinN', 'min'], ['#pMaxN', 'max'], ['#pMaxC', 'max']].forEach(function (x) { var e = qs(x[0]); if (e) e.oninput = function () { if (e.value === '') delete v[x[1]]; else v[x[1]] = Number(e.value); f.validasi = v; S.dirty = true; }; });
        var pp = qs('#pPat'); if (pp) { pp.oninput = function () { v.pattern = pp.value; f.validasi = v; S.dirty = true; }; qs('#pPes').oninput = function (e) { v.pesan = e.target.value; f.validasi = v; S.dirty = true; }; }
        qs('#pPeran').onchange = function (e) { var val = e.target.value; if (val) S.fields.forEach(function (x) { if (x !== f && x.peran === val) x.peran = ''; }); f.peran = val; ubah(); };
        qs('#pKunci').oninput = function (e) { set('kunci', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_')); };
      }
      function pratinjau() {
        var bag = bagianList(), i = 0;
        var m = A.modal({ title: 'Pratinjau Formulir', size: 'wide', body: '<div class="seg" style="margin-bottom:14px" id="pvDev"><button class="active" data-w="100%">' + icon('monitor', 'ico-sm') + ' Desktop</button><button data-w="390px">' + icon('smartphone', 'ico-sm') + ' Ponsel</button></div><div id="pvWrap" style="margin:0 auto;transition:max-width .25s;max-width:100%"><div id="pvBody"></div></div>',
          foot: '<button class="btn btn-light" id="pvP">' + icon('arrow-left', 'ico-sm') + 'Sebelumnya</button><button class="btn" id="pvN">Selanjutnya' + icon('arrow-right', 'ico-sm') + '</button>' });
        function show() {
          var fs = S.fields.filter(function (f) { return f.bagian === bag[i]; });
          qs('#pvBody', m.el).innerHTML = '<div class="badge b-gold no-dot" style="margin-bottom:10px">Langkah ' + (i + 1) + ' dari ' + (bag.length + 1) + '</div><h3>' + esc(bag[i]) + '</h3><div class="grid-2">' + fs.map(function (f) {
            var lab = '<label>' + esc(f.label) + (f.wajib ? '<span class="req">*</span>' : '') + '</label>', inp;
            if (f.tipe === 'paragraf') inp = '<textarea class="textarea" disabled></textarea>';
            else if (f.tipe === 'dropdown') inp = '<select class="select" disabled><option>— Pilih —</option></select>';
            else if (f.tipe === 'radio' || f.tipe === 'checkbox') inp = '<div class="choices">' + (f.opsi || []).map(function (o) { return '<label class="choice"><input type="' + (f.tipe === 'radio' ? 'radio' : 'checkbox') + '" disabled>' + esc(o) + '</label>'; }).join('') + '</div>';
            else if (f.tipe === 'file') inp = '<div class="drop" style="border:2px dashed var(--line-strong);border-radius:14px;padding:18px;text-align:center;background:var(--surface-2)">' + icon('upload-cloud') + '<div style="font-size:13px">' + ((f.validasi && f.validasi.accept) || []).join(', ').toUpperCase() + ' · maks ' + ((f.validasi && f.validasi.maxMB) || 2) + ' MB</div></div>';
            else inp = '<input class="input" disabled placeholder="' + esc(tipeLabel(f.tipe)) + '">';
            return '<div class="field' + (['paragraf', 'radio', 'checkbox', 'file'].indexOf(f.tipe) >= 0 ? ' span-2' : '') + '">' + lab + inp + (f.bantuan ? '<div class="help">' + esc(f.bantuan) + '</div>' : '') + '</div>';
          }).join('') + '</div>';
          qs('#pvP', m.el).disabled = i === 0; qs('#pvN', m.el).disabled = i >= bag.length - 1;
        }
        qs('#pvP', m.el).onclick = function () { if (i) { i--; show(); } };
        qs('#pvN', m.el).onclick = function () { if (i < bag.length - 1) { i++; show(); } };
        qsa('#pvDev button', m.el).forEach(function (b) { b.onclick = function () { qsa('#pvDev button', m.el).forEach(function (x) { x.classList.toggle('active', x === b); }); qs('#pvWrap', m.el).style.maxWidth = b.dataset.w; }; });
        show();
      }
    }
  });
})();
