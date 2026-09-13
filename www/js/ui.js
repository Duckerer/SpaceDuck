/* ============ SpaceDuck: ui.js — экраны и интерфейс ============ */
(function () {
  'use strict';
  var SD = window.SD = window.SD || {};
  var store = null;
  var bootTimer = null, bootDone = false;

  var EDIT = { mode: 'new', id: null };

  /* ---------- CSS-масштаб интерфейса ---------- */
  function applyUiScale() {
    var v = store.settings().uiscale || 1;
    document.documentElement.style.setProperty('--ui', v);
  }

  /* ---------- переключение языков ---------- */
  function effectiveLang() {
    var l = store.settings().lang;
    return (l === 'auto') ? SD.detectLang() : l;
  }
  function applyLang() {
    SD._lang = effectiveLang();
    document.documentElement.lang = SD._lang === 'ru' ? 'ru' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = SD.t(el.getAttribute('data-i18n'));
    });
    refreshDynamic();
  }

  /* ---------- экраны ---------- */
  var SCREENS = ['boot', 'menu', 'world', 'settings', 'ships', 'ach', 'game'];

  function show(name) {
    SCREENS.forEach(function (s) {
      var el = document.getElementById('screen-' + s);
      if (el) el.classList.toggle('active', s === name);
    });
    document.getElementById('pause-overlay').classList.add('hidden');
    if (name === 'menu') refreshMenu();
    if (name === 'ships') renderShips();
    if (name === 'ach') renderAch();
    if (name === 'settings') refreshSettings();
    if (name === 'world') renderWorlds();
    applyLang();
  }

  /* ---------- тост ---------- */
  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    el.style.opacity = 1;
    el.classList.remove('t-out');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.style.opacity = 0;
      setTimeout(function () { el.classList.add('hidden'); }, 350);
    }, 2400);
  }

  function hud(key) {
    document.getElementById('hud-hint').textContent = SD.t(key);
  }

  /* ---------- главное меню ---------- */
  function refreshMenu() {
    var sp = store.selectedShip();
    var ic = SD.icon('shuttle', 18);
    document.getElementById('menu-ship-info').innerHTML =
      '<div style="display:inline-flex;align-items:center;gap:8px">' +
      '<span style="width:14px;height:14px;border-radius:50%;display:inline-block;background:' + sp.color + '"></span>' +
      ic + SD.fill(SD.t('m_ship'), { name: sp.name }) + '</div>';
  }

  /* ---------- настройки ---------- */
  function refreshSettings() {
    var set = store.settings();
    var lang = set.lang;
    document.querySelectorAll('#set-lang button').forEach(function (b) {
      b.classList.toggle('sel', b.getAttribute('data-v') === lang);
    });
    document.getElementById('set-volume').value = Math.round((set.volume || 0.8) * 100);
    document.getElementById('set-uiscale').value = Math.round((set.uiscale || 1) * 100);
    document.getElementById('set-uiscale-val').textContent = Math.round((set.uiscale || 1) * 100) + '%';
  }

  /* ---------- корабли ---------- */
  function renderShips() {
    var box = document.getElementById('ship-list');
    var ships = store.ships();
    if (!ships.length) { box.innerHTML = ''; return; }
    box.innerHTML = ships.map(function (sp) {
      var d = sp.stats;
      var knob = sp.favorite ? SD.icon('heart', 18) : SD.icon('heartEmpty', 18);
      var selBtn = sp.selected
        ? '<button class="btn" disabled style="opacity:.6">' + SD.icon('check', 16) + ' ' + SD.t('sh_selected') + '</button>'
        : '<button class="btn primary" data-act="sel-ship" data-id="' + sp.id + '">' + SD.t('sh_select') + '</button>';
      return '<div class="ship-card' + (sp.selected ? ' sel' : '') + '">' +
        '<div class="ship-sw" style="--c:' + sp.color + ';--c2:' + shade(sp.color, -40) + '"></div>' +
        '<div class="ship-meta">' +
        '<div class="ship-name">' + esc(sp.name) + '</div>' +
        '<div class="ship-sub">' +
        SD.icon('planet', 14) + ' ' + d.discovered.length + ' · ' +
        SD.icon('flag', 14) + ' ' + d.landed.length + ' · ' +
        SD.icon('ruler', 14) + ' ' + SD.formatKm(d.km) + ' · ' +
        SD.icon('star', 14) + ' ' + d.flags +
        '</div>' +
        '</div>' +
        '<div class="ship-acts">' +
        '<button class="icon-btn' + (sp.favorite ? ' fav' : '') + '" data-act="fav-ship" data-id="' + sp.id + '">' + knob + '</button>' +
        '<button class="icon-btn" data-act="info-ship" data-id="' + sp.id + '">' + SD.icon('info', 18) + '</button>' +
        '<button class="icon-btn" data-act="edit-ship" data-id="' + sp.id + '">' + SD.icon('pencil', 18) + '</button>' +
        '<button class="icon-btn" data-act="del-ship" data-id="' + sp.id + '">' + SD.icon('trash', 18) + '</button>' +
        '</div>' + selBtn +
        '</div>';
    }).join('');
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function shade(hex, amt) {
    var c = hex.replace('#', '');
    var r = Math.max(0, Math.min(255, parseInt(c.substr(0, 2), 16) + amt));
    var g = Math.max(0, Math.min(255, parseInt(c.substr(2, 2), 16) + amt));
    var b = Math.max(0, Math.min(255, parseInt(c.substr(4, 2), 16) + amt));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function renderSwatches(boxId, pick, active, onPick) {
    var box = document.getElementById(boxId);
    box.innerHTML = '';
    var pal = SD.COLORS[boxId === 'ship-color' ? 'hull' : 'trail'];
    pal.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'swatch' + (c === active ? ' sel' : '');
      b.style.background = c;
      b.setAttribute('data-c', c);
      b.addEventListener('click', function () {
        box.querySelectorAll('.swatch').forEach(function (x) { x.classList.remove('sel'); });
        b.classList.add('sel');
        onPick(c);
      });
      box.appendChild(b);
    });
  }

  function openEdit(mode, id) {
    EDIT.mode = mode;
    EDIT.id = id || null;
    var sp = (mode === 'new') ? nullForNew() : (id ? shipById(id) : null);
    if (!sp) sp = nullForNew();
    document.getElementById('ship-name').value = sp.name;
    var curC = sp.color, curT = sp.trail, curH = sp.hull || 0;
    renderSwatches('ship-color', null, curC, function (c) { curC = c; });
    renderSwatches('ship-trail', null, curT, function (c) { curT = c; });
    document.querySelectorAll('#ship-hull button').forEach(function (b) {
      b.classList.toggle('sel', +b.getAttribute('data-v') === curH);
    });
    EDIT.last = { name: sp.name, color: curC, trail: curT, hull: curH };
    document.getElementById('ship-edit').classList.remove('hidden');
  }
  function nullForNew() {
    return { name: '', color: SD.COLORS.hull[0], trail: SD.COLORS.trail[0], hull: 0 };
  }
  function shipById(id) {
    var s = null;
    store.ships().forEach(function (sp) { if (sp.id === id) s = sp; });
    return s;
  }

  function openDetail(id) {
    var sp = shipById(id);
    if (!sp) return;
    var d = sp.stats;
    var names = d.discovered.map(function (rec) {
      return SD._lang === 'ru' ? (rec.ru || rec.en) : (rec.en || rec.ru);
    });
    document.getElementById('det-name').textContent = sp.name;
    document.getElementById('ship-detail').querySelector('.det-stats').innerHTML =
      SD.icon('ruler', 16) + ' ' + SD.fill(SD.t('sh_stats_km'), { km: SD.formatKm(d.km) }) + '<br>' +
      SD.icon('planet', 16) + ' ' + SD.fill(SD.t('sh_stats_planets'), { n: d.discovered.length }) + '<br>' +
      SD.icon('flag', 16) + ' ' + SD.fill(SD.t('sh_stats_landed'), { n: d.landed.length }) + '<br>' +
      SD.icon('star', 16) + ' ' + SD.fill(SD.t('sh_stats_flags'), { n: d.flags }) + '<br>' +
      (sp.favorite ? SD.icon('heart', 16) + ' ' + SD.t('sh_stats_fav') : '');
    document.getElementById('ship-detail').querySelector('.det-planets').innerHTML =
      names.length ? SD.t('sh_planets_found') + '<br>' + names.map(function (n) { return '<span class="mini-chip">' + esc(n) + '</span>'; }).join('')
        : '<div style="color:#9aa3c7">' + SD.t('sh_stats_noplanets') + '</div>';
    document.getElementById('ship-detail').classList.remove('hidden');
  }

  /* ---------- достижения ---------- */
  function renderAch() {
    var unlocked = 0;
    SD.ACH.forEach(function (a) { if (store.ach()[a.id]) unlocked++; });
    document.getElementById('ach-stats').textContent = SD.fill(SD.t('a_unlocked'), { a: unlocked, b: SD.ACH.length });
    document.getElementById('ach-list').innerHTML = SD.ACH.map(function (a) {
      var has = !!store.ach()[a.id];
      return '<div class="ach-card' + (has ? '' : ' un') + '">' +
        '<div class="ach-ic">' + SD.icon(a.icon, 34) + '</div>' +
        '<div class="ach-t">' + SD.achName(a.id, 't') + '</div>' +
        '<div class="ach-d">' + SD.achName(a.id, 'd') + '</div>' +
        '</div>';
    }).join('');
  }

  /* ---------- миры ---------- */
  function renderWorlds() {
    var box = document.getElementById('world-list');
    var defs = [
      ['w_small_n', 'w_small_d', 'planet'],
      ['w_med_n', 'w_med_d', 'layers'],
      ['w_big_n', 'w_big_d', 'star'],
      ['w_inf_n', 'w_inf_d', 'vortex']
    ];
    box.innerHTML = SD.WORLDS.map(function (w, i) {
      return '<div class="world-card" data-wid="' + w.id + '">' +
        '<div class="world-ic">' + SD.icon(defs[i][2], 26) + '</div>' +
        '<div><h3>' + SD.t(defs[i][0]) + '</h3>' +
        '<p>' + SD.t(defs[i][1]) + '</p></div>' +
        '</div>';
    }).join('');
  }

  /* ---------- динамические тексты ---------- */
  function refreshDynamic() {
    var s = document.getElementById('screen-ships');
    if (s && s.classList.contains('active')) renderShips();
    var a = document.getElementById('screen-ach');
    if (a && a.classList.contains('active')) renderAch();
    var w = document.getElementById('screen-world');
    if (w && w.classList.contains('active')) renderWorlds();
    refreshSettings();
  }

  /* ---------- boot hold ---------- */
  function startBoot(e) {
    if (bootDone) return;
    e.preventDefault();
    var bar = document.getElementById('boot-progress');
    var t0 = performance.now();
    var HOLD = 800;
    SD.sound.init();
    clearInterval(bootTimer);
    bootTimer = setInterval(function () {
      var p = Math.min(1, (performance.now() - t0) / HOLD);
      bar.style.width = (p * 100) + '%';
      if (p >= 1) {
        clearInterval(bootTimer);
        bootDone = true;
        SD.sound.click();
        SD.sound.vibrate(160);
        show('menu');
      }
    }, 33);
  }
  function cancelBoot() {
    clearInterval(bootTimer);
    document.getElementById('boot-progress').style.width = '0%';
  }

  /* ---------- делегация действий ---------- */
  function onAction(ev) {
    var el = ev.target.closest('[data-act]');
    if (!el) return;
    actGlobal(el.getAttribute('data-act'), el.getAttribute('data-id'), el);
  }

  function actGlobal(act, id, el) {
    switch (act) {
      case 'menu':
        SD.sound.back();
        if (SD.engine.getRun()) SD.engine.stop();
        else show('menu');
        break;
      case 'play':
        SD.sound.click();
        show('world');
        break;
      case 'ships':
        SD.sound.click();
        show('ships');
        break;
      case 'ach':
        SD.sound.click();
        show('ach');
        break;
      case 'settings':
        SD.sound.click();
        show('settings');
        break;

      /* --- миры --- */
      case 'worldcard':
        SD.sound.click();
        SD.engine.start(id || (el && el.getAttribute('data-wid')));
        break;

      /* --- настройки --- */
      case 'lang':
        SD.store.settings().lang = (el && el.getAttribute('data-v')) || 'auto';
        SD.store.save();
        applyLang();
        SD.sound.click();
        break;
      case 'reset-stats':
        document.getElementById('reset-confirm').classList.remove('hidden');
        SD.sound.click();
        break;
      case 'reset-yes':
        SD.store.resetStats();
        document.getElementById('reset-confirm').classList.add('hidden');
        SD.sound.click();
        toast(SD.t('s_reset'));
        renderAch();
        break;
      case 'reset-no':
        document.getElementById('reset-confirm').classList.add('hidden');
        SD.sound.back();
        break;

      /* --- корабли --- */
      case 'new-ship':
        SD.sound.click();
        openEdit('new');
        break;
      case 'edit-ship':
        SD.sound.click();
        openEdit('edit', id);
        break;
      case 'info-ship':
        SD.sound.click();
        openDetail(id);
        break;
      case 'sel-ship':
        SD.sound.click();
        store.ships().forEach(function (sp) { sp.selected = (sp.id === id); });
        store.save();
        renderShips();
        break;
      case 'fav-ship':
        SD.sound.click();
        var sp = shipById(id);
        if (sp) {
          sp.favorite = !sp.favorite;
          store.save();
          if (sp.favorite) SD.engine.unlockOne('a_fav');
          renderShips();
        }
        break;
      case 'del-ship':
        SD.sound.click();
        renderDelConfirm(id);
        break;
      case 'del-yes':
        store.removeShip(id);
        SD.sound.click();
        var dc = document.getElementById('del-confirm');
        if (dc) dc.remove();
        renderShips();
        break;
      case 'del-no':
        var dc2 = document.getElementById('del-confirm');
        if (dc2) dc2.remove();
        SD.sound.back();
        break;
      case 'edit-cancel':
        SD.sound.back();
        document.getElementById('ship-edit').classList.add('hidden');
        break;
      case 'edit-save':
        SD.sound.click();
        saveEdit();
        break;
      case 'det-close':
        SD.sound.back();
        document.getElementById('ship-detail').classList.add('hidden');
        break;

      /* --- пауза --- */
      case 'pause':
        SD.engine.setPaused(true);
        document.getElementById('pause-overlay').classList.remove('hidden');
        SD.sound.vibrate(40);
        break;
      case 'pause-continue':
        SD.engine.setPaused(false);
        document.getElementById('pause-overlay').classList.add('hidden');
        SD.sound.click();
        break;
      case 'pause-exit':
        SD.engine.stop();
        break;
      case 'auto':
        var run = SD.engine.getRun();
        if (run) {
          run.auto = !run.auto;
          if (run.auto) run.autoTarget = null;
          SD.engine.setAutoBtn();
          SD.ui.hud(run.auto ? 'g_auto_on' : 'g_auto_off');
          SD.sound.click();
        }
        break;
    }
  }

  function renderDelConfirm(id) {
    var sp = shipById(id);
    var div = document.createElement('div');
    div.className = 'modal';
    div.id = 'del-confirm';
    div.innerHTML =
      '<div class="modal-card">' +
      '<div class="modal-warn">' + SD.icon('warn', 26) + '</div>' +
      '<p>' + SD.fill(SD.t('sh_del_q'), { name: esc(sp ? sp.name : '') }) + '</p>' +
      '<div class="modal-actions">' +
      '<button class="btn danger" data-act="del-yes" data-id="' + id + '">' + SD.t('sh_del_yes') + '</button>' +
      '<button class="btn" data-act="del-no">' + SD.t('sh_cancel') + '</button>' +
      '</div></div>';
    document.getElementById('screen-ships').appendChild(div);
  }

  function saveEdit() {
    var ship = shipById(EDIT.id);
    var name = document.getElementById('ship-name').value.trim() || (SD._lang === 'ru' ? 'Корабль' : 'Ship');
    var c1 = document.querySelector('#ship-color .swatch.sel');
    var c2 = document.querySelector('#ship-trail .swatch.sel');
    var hullBtn = document.querySelector('#ship-hull button.sel');
    var color = c1 ? c1.getAttribute('data-c') : SD.COLORS.hull[0];
    var trail = c2 ? c2.getAttribute('data-c') : SD.COLORS.trail[0];
    var hull = hullBtn ? +hullBtn.getAttribute('data-v') : 0;
    if (EDIT.mode === 'new') {
      store.addShip(name, color, trail, hull);
      SD.engine.unlockOne('a_build');
    } else if (ship) {
      store.updateShip(ship.id, { name: name, color: color, trail: trail, hull: hull });
    }
    document.getElementById('ship-edit').classList.add('hidden');
    renderShips();
  }

  /* ---------- пауза при потере фокуса ---------- */
  function onVis() {
    if (document.hidden && SD.engine.getRun() && !SD.engine.isPaused()) {
      actGlobal('pause');
    }
  }

  /* ---------- init ---------- */
  function initUI() {
    store = SD.store;
    /* boot hold */
    var bs = document.getElementById('screen-boot');
    bs.addEventListener('pointerdown', startBoot);
    bs.addEventListener('pointerup', cancelBoot);
    bs.addEventListener('pointercancel', cancelBoot);
    bs.addEventListener('pointerleave', cancelBoot);

    /* делегация */
    document.addEventListener('click', onAction);

    /* слайдеры */
    document.getElementById('set-volume').addEventListener('input', function (e) {
      store.settings().volume = +e.target.value / 100;
      store.save();
      SD.sound.setVolume(store.settings().volume);
    });
    document.getElementById('set-uiscale').addEventListener('input', function (e) {
      store.settings().uiscale = +e.target.value / 100;
      store.save();
      document.getElementById('set-uiscale-val').textContent = e.target.value + '%';
      applyUiScale();
      renderWorlds();
    });
    /* язык */
    document.querySelectorAll('#set-lang button').forEach(function (b) {
      b.addEventListener('click', function () { actGlobal('lang', null, b); });
    });
    /* корабли: swatch hull seg */
    document.querySelectorAll('#ship-hull button').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('#ship-hull button').forEach(function (x) { x.classList.remove('sel'); });
        b.classList.add('sel');
        if (EDIT.last) EDIT.last.hull = +b.getAttribute('data-v');
      });
    });
    /* пауза */
    document.getElementById('btn-pause').addEventListener('click', function () { actGlobal('pause'); });
    document.getElementById('btn-auto').addEventListener('click', function () { actGlobal('auto'); });

    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onVis);

    /* миры */
    document.getElementById('world-list').addEventListener('click', function (ev) {
      var card = ev.target.closest('.world-card');
      if (card) actGlobal('worldcard', null, card);
    });

    SD.sound.setVolume(store.settings().volume);
    applyUiScale();
    applyLang();
  }

  SD.ui = {
    show: show,
    toast: toast,
    hud: function (key) { hud(key); },
    init: initUI
  };
})();