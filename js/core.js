/* =====================================================================
   core.js — dipakai halaman publik & admin
   • Ikon SVG inline (gaya garis konsisten, tanpa emoji)
   • Api: fetch ke GAS (POST text/plain → tanpa preflight CORS), dedupe baca,
     epoch tulis, penggabung batch, SWR localStorage, drain antrean notifikasi,
     warmup server, pengukur Perf (gas-scale-turbo)
   • UI: toast, modal, konfirmasi, loader, tema terang/gelap, util format
   ===================================================================== */
(function () {
  'use strict';
  var CFG = window.APP_CONFIG || {};

  /* ---------------- Penyimpanan aman (try/catch) ---------------- */
  var Store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? (d === undefined ? null : d) : v; } catch (e) { return d === undefined ? null : d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} },
    json: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    setJson: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { try { Store.clearPrefix('swr:'); localStorage.setItem(k, JSON.stringify(v)); } catch (x) {} } },
    clearPrefix: function (p) { try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf(p) === 0) localStorage.removeItem(k); }); } catch (e) {} },
    sget: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------------- Ikon ---------------- */
  var ICONS = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    whatsapp: '<path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.2 3.1z"/><path d="M9 9.5c.3 1.6 1.9 3.6 4.2 4.6l1.2-1.1 1.8.9c-.2 1.1-1 1.7-2 1.7-3 0-6.4-3.3-6.4-6.4 0-1 .6-1.8 1.7-2l.9 1.8z"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    youtube: '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
    tiktok: '<path d="M9 12a4 4 0 1 0 4 4V2a5 5 0 0 0 5 5"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>', 'chevron-right': '<path d="m9 18 6-6-6-6"/>', 'chevron-down': '<path d="m6 9 6 6 6-6"/>', 'chevron-up': '<path d="m18 15-6-6-6 6"/>',
    'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>', 'arrow-left': '<path d="M19 12H5M12 19l-7-7 7-7"/>', 'arrow-up': '<path d="M12 19V5M5 12l7-7 7 7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>', 'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    'alert-circle': '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>', info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>', unlock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
    'upload-cloud': '<path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2"/><path d="M12 12v9M16 16l-4-4-4 4"/>',
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6"/>',
    'file-text': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>', clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
    'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
    'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>', activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    flask: '<path d="M9 2v7.31L3.5 19a2 2 0 0 0 1.75 3h13.5a2 2 0 0 0 1.75-3L15 9.31V2M8.5 2h7M7 16h10"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    coffee: '<path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 2v2M10 2v2M14 2v2"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>', 'log-in': '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    'bar-chart': '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>', 'pie-chart': '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>', send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>', 'shield-check': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>', award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
    cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>', more: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
    grip: '<circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5M3 12a9 3 0 0 0 18 0"/>', zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    printer: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
    pen: '<path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.59 7.59"/><circle cx="11" cy="11" r="2"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    'trending-up': '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>', 'trending-down': '<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
    sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
    layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>', type: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>', hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    'align-left': '<path d="M21 6H3M15 12H3M17 18H3"/>', 'check-square': '<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    circle: '<circle cx="12" cy="12" r="10"/>', 'circle-dot': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>',
    'list-down': '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m8 10 4 4 4-4"/>',
    paperclip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    power: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/>',
    tag: '<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/>',
    merge: '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>', slash: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
    smartphone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2a10 10 0 0 0 0 20c.93 0 1.5-.75 1.5-1.5 0-.39-.15-.74-.39-1.02-.24-.27-.38-.62-.38-1 0-.83.67-1.5 1.5-1.5H16a6 6 0 0 0 6-6c0-4.97-4.48-9-10-9z"/>'
  };
  function icon(name, cls) {
    return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.circle) + '</svg>';
  }

  /* ---------------- Utilitas ---------------- */
  var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  var BLN3 = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function toDate(s) { if (!s) return null; if (s instanceof Date) return s; var x = String(s); if (/^\d{4}-\d{2}-\d{2}$/.test(x)) x += 'T00:00:00'; var d = new Date(x); return isNaN(d) ? null : d; }
  function tgl(s, pendek) { var d = toDate(s); if (!d) return s || '—'; return d.getDate() + ' ' + (pendek ? BLN3 : BULAN)[d.getMonth()] + ' ' + d.getFullYear(); }
  function tglJam(s) { var d = toDate(s); if (!d) return s || '—'; return tgl(d, true) + ', ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function rp(n) { return 'Rp ' + Math.round(Number(n) || 0).toLocaleString('id-ID'); }
  function angka(n) { return (Number(n) || 0).toLocaleString('id-ID'); }
  function relatif(s) {
    var d = toDate(s); if (!d) return '—';
    var m = Math.round((Date.now() - d.getTime()) / 60000);
    if (m < 1) return 'baru saja'; if (m < 60) return m + ' menit lalu';
    var h = Math.round(m / 60); if (h < 24) return h + ' jam lalu';
    var hr = Math.round(h / 24); if (hr < 30) return hr + ' hari lalu';
    return tgl(d, true);
  }
  function thumb(id, w) { return id ? 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w' + (w || 800) : ''; }
  /** Gambar Drive (thumbnail) atau placeholder bermotif dengan ikon. */
  function media(id, iconName, w, alt, extraCls) {
    var ph = '<div class="ph">' + icon(iconName || 'image') + '</div>';
    if (!id) return '<div class="thumb pattern ' + (extraCls || '') + '">' + ph + '</div>';
    return '<div class="thumb ' + (extraCls || '') + '">' + ph + '<img loading="lazy" decoding="async" src="' + thumb(id, w) + '" alt="' + esc(alt || '') + '" onerror="this.remove()" onload="this.previousElementSibling&&this.previousElementSibling.remove()"></div>';
  }
  function debounce(fn, ms) { var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms); }; }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function hp08(v) { var s = String(v || '').replace(/[^0-9+]/g, '').replace(/^\+/, ''); if (s.indexOf('62') === 0) s = '0' + s.slice(2); else if (s.indexOf('8') === 0) s = '0' + s; return s; }
  function waLink(hp, teks) { var s = hp08(hp); if (!s) return '#'; return 'https://wa.me/62' + s.slice(1) + (teks ? '?text=' + encodeURIComponent(teks) : ''); }
  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t).then(function () { return true; }, fallback);
    return Promise.resolve(fallback());
    function fallback() { var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove(); return ok; }
  }
  function fileToBase64(file) {
    return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(',')[1]); }; r.onerror = function () { rej(new Error('Gagal membaca berkas.')); }; r.readAsDataURL(file); });
  }
  /** Kompres gambar di peramban (lebar maks + kualitas JPEG) sebelum diunggah. */
  function compressImage(file, maxW, quality) {
    maxW = maxW || 1600; quality = quality || 0.82;
    return new Promise(function (res) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return res(file);
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, maxW / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        var ctx = c.getContext('2d'); if (file.type !== 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
        ctx.drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { URL.revokeObjectURL(url); if (!b || b.size >= file.size) return res(file); res(new File([b], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })); }, 'image/jpeg', quality);
      };
      img.onerror = function () { URL.revokeObjectURL(url); res(file); };
      img.src = url;
    });
  }
  function ukuran(b) { b = Number(b) || 0; return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
  function b64ToBlob(b64, mime) { var bin = atob(b64), arr = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i); return new Blob([arr], { type: mime || 'application/octet-stream' }); }
  function unduhBlob(blob, nama) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nama || 'berkas'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
  function loadScript(src) {
    loadScript._c = loadScript._c || {};
    if (loadScript._c[src]) return loadScript._c[src];
    loadScript._c[src] = new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.async = true; s.onload = res; s.onerror = function () { delete loadScript._c[src]; rej(new Error('Gagal memuat pustaka.')); }; document.head.appendChild(s); });
    return loadScript._c[src];
  }

  /* ---------------- Tema ---------------- */
  var Theme = {
    key: 'ppdb_theme',
    init: function (bawaan) {
      var t = Store.get(this.key);
      if (!t && bawaan && bawaan !== 'auto') t = bawaan;
      if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
      else document.documentElement.removeAttribute('data-theme');
      this.sync();
    },
    current: function () {
      var a = document.documentElement.getAttribute('data-theme');
      if (a) return a;
      return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },
    toggle: function () { var n = this.current() === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', n); Store.set(this.key, n); this.sync(); return n; },
    sync: function () {
      var dark = this.current() === 'dark';
      qsa('[data-theme-toggle]').forEach(function (b) { b.innerHTML = icon(dark ? 'sun' : 'moon') + (b.dataset.label ? '<span>' + (dark ? 'Mode Terang' : 'Mode Gelap') + '</span>' : ''); b.setAttribute('aria-label', dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'); b.setAttribute('aria-pressed', String(dark)); });
      qsa('[data-theme-switch]').forEach(function (i) { i.checked = dark; });
      var m = qs('meta[name="theme-color"]'); if (m) m.setAttribute('content', dark ? '#07101E' : '#0B2A5B');
      document.dispatchEvent(new CustomEvent('themechange', { detail: { dark: dark } }));
    }
  };
  function applyBrand(s) {
    if (!s) return;
    var r = document.documentElement.style;
    if (/^#[0-9a-f]{6}$/i.test(s.warna_primer || '')) r.setProperty('--brand', s.warna_primer);
    if (/^#[0-9a-f]{6}$/i.test(s.warna_aksen || '')) r.setProperty('--accent', s.warna_aksen);
  }

  /* ---------------- Toast & dialog ---------------- */
  function toast(msg, type, ms) {
    var box = qs('.toasts'); if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    type = type || 'info';
    var el = document.createElement('div'); el.className = 'toast ' + type;
    el.innerHTML = icon({ ok: 'check-circle', bad: 'alert-circle', warn: 'alert-triangle', info: 'info' }[type] || 'info') + '<div style="flex:1;min-width:0">' + esc(msg) + '</div><button class="toast-x" aria-label="Tutup">' + icon('x', 'ico-sm') + '</button>';
    box.appendChild(el);
    var tutup = function () { el.style.opacity = '0'; el.style.transform = 'translateY(-6px)'; el.style.transition = 'all .2s'; setTimeout(function () { el.remove(); }, 200); };
    el.querySelector('.toast-x').onclick = tutup;
    setTimeout(tutup, ms || (type === 'bad' ? 6500 : 4000));
  }
  var _modalStack = [];
  /** Modal generik. opts: {title, body (html), foot (html), size:'wide'|'xwide', drawer, onClose} → {el, close} */
  function modal(opts) {
    var ov = document.createElement('div');
    ov.className = 'overlay' + (opts.drawer ? ' drawer-ov' : '');
    ov.innerHTML = '<div class="' + (opts.drawer ? 'drawer' : 'modal ' + (opts.size || '')) + '" role="dialog" aria-modal="true" aria-label="' + esc(opts.title || '') + '">' +
      '<div class="modal-head">' + (opts.icon ? '<span class="modal-ico">' + icon(opts.icon) + '</span>' : '') + '<h3>' + esc(opts.title || '') + '</h3>' +
      '<button class="btn btn-ghost btn-icon btn-sm" data-close aria-label="Tutup">' + icon('x') + '</button></div>' +
      '<div class="modal-body">' + (opts.body || '') + '</div>' + (opts.foot ? '<div class="modal-foot">' + opts.foot + '</div>' : '') + '</div>';
    var prevFocus = document.activeElement;
    document.body.appendChild(ov); document.body.style.overflow = 'hidden';
    var api = { el: ov, close: close };
    function close(v) {
      if (!ov.parentNode) return;
      ov.remove(); _modalStack.pop();
      if (!_modalStack.length) document.body.style.overflow = '';
      if (opts.onClose) opts.onClose(v);
      if (prevFocus && prevFocus.focus) try { prevFocus.focus(); } catch (e) {}
    }
    ov.addEventListener('mousedown', function (e) { if (e.target === ov && !opts.sticky) close(); });
    qsa('[data-close]', ov).forEach(function (b) { b.addEventListener('click', function () { close(); }); });
    _modalStack.push(api);
    setTimeout(function () { var f = ov.querySelector('[autofocus], .modal-body input, .modal-body select, .modal-body textarea, .modal-foot .btn'); if (f) f.focus(); }, 30);
    return api;
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && _modalStack.length) _modalStack[_modalStack.length - 1].close(); });
  /** Konfirmasi → Promise<boolean|string>. opts: {title, text, ok, danger, input:{label, placeholder, harus}} */
  function confirmDlg(opts) {
    return new Promise(function (resolve) {
      var hasil = false;
      var inp = opts.input ? '<div class="field" style="margin:14px 0 0"><label for="cf-in">' + esc(opts.input.label) + '</label><input id="cf-in" class="input" placeholder="' + esc(opts.input.placeholder || '') + '" autocomplete="off"></div>' : '';
      var m = modal({ title: opts.title || 'Konfirmasi', icon: opts.danger ? 'alert-triangle' : 'info',
        body: '<p style="margin:0">' + (opts.html || esc(opts.text || '')) + '</p>' + inp,
        foot: '<button class="btn btn-light" data-close>Batal</button><button class="btn ' + (opts.danger ? 'btn-danger' : '') + '" data-ok>' + esc(opts.ok || 'Ya, lanjutkan') + '</button>',
        onClose: function () { resolve(hasil); } });
      var okBtn = m.el.querySelector('[data-ok]'), input = m.el.querySelector('#cf-in');
      if (input && opts.input.harus) { okBtn.disabled = true; input.addEventListener('input', function () { okBtn.disabled = input.value.trim().toUpperCase() !== opts.input.harus; }); }
      okBtn.onclick = function () { hasil = input ? input.value.trim() : true; m.close(); };
      if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !okBtn.disabled) okBtn.click(); });
    });
  }
  function loader(teks) {
    var el = qs('.page-loader');
    if (teks === false) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('div'); el.className = 'page-loader'; el.innerHTML = '<div class="loader-card" role="alert" aria-busy="true"><div class="spin"></div><div class="lt"></div></div>'; document.body.appendChild(el); }
    el.querySelector('.lt').textContent = teks || 'Memproses…';
  }
  function btnBusy(btn, on, teks) {
    if (!btn) return;
    if (on) { btn.dataset.html = btn.innerHTML; btn.classList.add('is-loading'); btn.innerHTML = '<span class="spin"></span>' + (teks ? '<span>' + esc(teks) + '</span>' : ''); }
    else { btn.classList.remove('is-loading'); if (btn.dataset.html) btn.innerHTML = btn.dataset.html; }
  }
  var Progress = {
    n: 0, el: null,
    start: function () { if (!this.el) { this.el = document.createElement('div'); this.el.className = 'topbar-progress'; document.body.appendChild(this.el); } this.n++; this.el.style.opacity = '1'; this.el.style.width = '70%'; },
    done: function () { var s = this; s.n = Math.max(0, s.n - 1); if (s.n || !s.el) return; s.el.style.width = '100%'; setTimeout(function () { if (!s.n) { s.el.style.opacity = '0'; s.el.style.width = '0'; } }, 250); }
  };

  /* ---------------- Pengukur performa (console: Perf.table()) ---------------- */
  var Perf = {
    log: [],
    add: function (o) { this.log.push(o); if (this.log.length > 300) this.log.shift(); },
    table: function () { console.table(this.log.slice(-40)); },
    summary: function () {
      var m = {}; this.log.forEach(function (x) { var a = m[x.aksi] = m[x.aksi] || { aksi: x.aksi, n: 0, total: 0, server: 0, cache: 0 }; a.n++; a.total += x.total; a.server += x.server || 0; if (x.cache) a.cache++; });
      console.table(Object.keys(m).map(function (k) { var a = m[k]; return { aksi: a.aksi, panggilan: a.n, rataTotal_ms: Math.round(a.total / a.n), rataServer_ms: Math.round(a.server / a.n), cache: a.cache }; }));
    }
  };

  /* ---------------- API ---------------- */
  var READ = /^(batch$|pub\.(bootstrap|berita|form|verify)$|auth\.(config|me)$|dash\.|.*\.(list|get|detail|stats|config|templates|queue|audience|blastList|dokumen|dokumenDetail|pejabat|antrean|menunggu|info|status|duplikat|export|pratinjau|unduh)$|de\.(templates|dokumen|pejabat|menunggu|antrean)$)/;
  var Api = {
    url: CFG.GAS_URL || '',
    onAuthFail: null,
    _inflight: {}, _epoch: 0,
    token: function () { return Store.get('ppdb_token') || ''; },
    setToken: function (t) { if (t) Store.set('ppdb_token', t); else Store.del('ppdb_token'); },
    configured: function () { return this.url && this.url.indexOf('GANTI_DENGAN') < 0; },
    /** POST JSON (text/plain agar tidak memicu preflight CORS). */
    post: function (action, data, opts) {
      opts = opts || {};
      var self = this, baca = READ.test(action) && !opts.write;
      if (!baca) this._epoch++;
      var key = baca ? this._epoch + '|' + action + '|' + JSON.stringify(data || {}) : null;
      if (key && this._inflight[key]) return this._inflight[key];
      var p = this._run('POST', action, data, opts);
      if (key) { this._inflight[key] = p; p.then(function () { delete self._inflight[key]; }, function () { delete self._inflight[key]; }); }
      return p;
    },
    /** GET publik (cache CDN Google tidak dipakai; cocok untuk data publik). */
    get: function (action, params, opts) { return this._run('GET', action, params || {}, opts || {}); },
    _run: function (method, action, data, opts) {
      var self = this, t0 = performance.now();
      if (!this.configured()) return Promise.reject(Object.assign(new Error('GAS_URL belum diisi di js/config.js.'), { code: 'CONFIG' }));
      if (!opts.silent) Progress.start();
      var req;
      if (method === 'GET') {
        var q = '?action=' + encodeURIComponent(action) + (data && Object.keys(data).length ? '&data=' + encodeURIComponent(JSON.stringify(data)) : '');
        req = fetch(this.url + q, { method: 'GET', redirect: 'follow' });
      } else {
        req = fetch(this.url, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: action, data: data || {}, token: opts.publik ? '' : this.token() }) });
      }
      return req.then(function (r) {
        if (!r.ok) throw Object.assign(new Error('Server merespons ' + r.status + '. Coba lagi.'), { code: 'HTTP' });
        return r.json();
      }, function () { throw Object.assign(new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'), { code: 'NET' }); })
        .then(function (res) {
          Perf.add({ aksi: action, total: Math.round(performance.now() - t0), server: res.ms, cache: !!res.cached });
          if (res.nq > 0) self.scheduleDrain();
          if (!res.success) {
            var e = new Error(res.message || 'Terjadi kesalahan.'); e.code = res.code; e.data = res.data;
            if (res.code === 'AUTH' && self.onAuthFail && !opts.publik) self.onAuthFail(e);
            throw e;
          }
          return res;
        })
        .finally(function () { if (!opts.silent) Progress.done(); });
    },
    /* --- drain antrean notifikasi (kirim email/WA seketika setelah aksi) --- */
    _drainT: null, _drainN: 0,
    scheduleDrain: function () {
      var self = this; clearTimeout(this._drainT); this._drainN = 0;
      this._drainT = setTimeout(function loop() {
        self._run('POST', 'pub.drain', {}, { silent: true, publik: true }).then(function (r) {
          if (r.data && r.data.left > 0 && ++self._drainN < 3) self._drainT = setTimeout(loop, 1500);
        }).catch(function () {});
      }, 400);
    },
    /* --- warmup server (mode no-cors, maks 1×/4 menit per lingkup) --- */
    warm: function (scope) {
      if (!this.configured()) return;
      var k = 'warm_' + scope, last = Number(Store.sget(k) || 0);
      if (Date.now() - last < 240000) return;
      Store.sset(k, String(Date.now()));
      try { fetch(this.url + '?w=' + scope, { mode: 'no-cors' }).catch(function () {}); } catch (e) {}
    }
  };

  /* --- penggabung batch otomatis: beberapa baca dalam 1 tik → 1 eksekusi GAS --- */
  var Batcher = {
    q: null,
    add: function (action, data) {
      var self = this;
      return new Promise(function (res, rej) {
        if (!self.q) { self.q = []; setTimeout(function () { self.flush(); }, 0); }
        self.q.push({ action: action, data: data || {}, res: res, rej: rej });
      });
    },
    flush: function () {
      var q = this.q || []; this.q = null;
      if (!q.length) return;
      var uniq = [], idx = {};
      q.forEach(function (x) { var k = x.action + '|' + JSON.stringify(x.data); if (idx[k] === undefined) { idx[k] = uniq.length; uniq.push({ action: x.action, data: x.data, ws: [] }); } uniq[idx[k]].ws.push(x); });
      if (uniq.length === 1) { var u = uniq[0]; Api.post(u.action, u.data).then(function (r) { u.ws.forEach(function (w) { w.res(r); }); }, function (e) { u.ws.forEach(function (w) { w.rej(e); }); }); return; }
      for (var i = 0; i < uniq.length; i += 10) (function (part) {
        Api.post('batch', { calls: part.map(function (u) { return { action: u.action, data: u.data }; }) }).then(function (r) {
          part.forEach(function (u, j) {
            var rr = r.data.results[j];
            if (rr && rr.success) u.ws.forEach(function (w) { w.res(rr); });
            else { var e = new Error((rr && rr.message) || 'Gagal'); e.code = rr && rr.code; if (e.code === 'AUTH' && Api.onAuthFail) Api.onAuthFail(e); u.ws.forEach(function (w) { w.rej(e); }); }
          });
        }, function (e) { part.forEach(function (u) { u.ws.forEach(function (w) { w.rej(e); }); }); });
      })(uniq.slice(i, i + 10));
    }
  };

  /* --- SWR: tampilkan cache lokal dulu, segarkan di latar bila basi --- */
  var Swr = {
    get: function (k) { return Store.json('swr:' + k, null); },
    set: function (k, d) { Store.setJson('swr:' + k, { t: Date.now(), d: d }); },
    clear: function () { Store.clearPrefix('swr:'); },
    /** load(key, fetcher, {maxAge, onData}) → memanggil onData(data, dariCache) 1–2 kali */
    load: function (key, fetcher, opt) {
      opt = opt || {};
      var c = this.get(key), self = this;
      if (c && opt.onData) opt.onData(c.d, true);
      if (c && !opt.force && Date.now() - c.t < (opt.maxAge || 30000)) return Promise.resolve(c.d);
      return fetcher().then(function (d) {
        var same = c && JSON.stringify(c.d) === JSON.stringify(d);
        self.set(key, d);
        if (!same && opt.onData) opt.onData(d, false);
        return d;
      });
    }
  };

  window.App = {
    CFG: CFG, Store: Store, icon: icon, ICONS: ICONS, esc: esc, tgl: tgl, tglJam: tglJam, toDate: toDate, rp: rp, angka: angka, relatif: relatif,
    thumb: thumb, media: media, debounce: debounce, qs: qs, qsa: qsa, hp08: hp08, waLink: waLink, copyText: copyText, fileToBase64: fileToBase64,
    compressImage: compressImage, ukuran: ukuran, b64ToBlob: b64ToBlob, unduhBlob: unduhBlob, loadScript: loadScript, Theme: Theme, applyBrand: applyBrand,
    toast: toast, modal: modal, confirmDlg: confirmDlg, loader: loader, btnBusy: btnBusy, Progress: Progress, Perf: Perf, Api: Api, Batcher: Batcher, Swr: Swr,
    BULAN: BULAN
  };
  window.Perf = Perf;
})();
