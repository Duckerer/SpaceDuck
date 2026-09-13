/* ============ SpaceDuck: store.js (localStorage) ============ */
(function () {
  'use strict';
  var SD = window.SD = window.SD || {};
  var KEY = 'spaceduck::v1';
  var mem = null;

  function read() {
    try { var raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; }
    catch (e) { return mem; }
  }
  function write(obj) {
    mem = obj;
    try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch (e) {}
  }

  function freshShip(name, lang) {
    var trail = lang === 'ru' ? '#ff8c00' : '#2e9bff';
    return {
      id: 's' + Date.now().toString(36) + Math.floor(Math.random() * 1e5).toString(36),
      name: name,
      color: '#ffd53d',
      trail: trail,
      hull: 0,
      selected: true,
      favorite: false,
      stats: { km: 0, discovered: [], landed: [], flags: 0 }
    };
  }

  var state = null;

  SD.store = {
    load: function () {
      var s = read();
      var lang = SD.detectLang();
      if (!s) {
        s = {
          settings: { lang: 'auto', volume: 0.8, scale: 1, uiscale: 1 },
          ships: [freshShip(lang === 'ru' ? 'Утёнок' : 'Duckling', lang)],
          ach: {},
          global: { km: 0, landings: 0 }
        };
        write(s);
      } else {
        if (!s.settings) s.settings = { lang: 'auto' };
        if (s.settings.volume === undefined) s.settings.volume = 0.8;
        if (s.settings.scale === undefined) s.settings.scale = 1;
        if (s.settings.uiscale === undefined) s.settings.uiscale = 1;
        if (!s.ships || !s.ships.length) s.ships = [freshShip(lang === 'ru' ? 'Утёнок' : 'Duckling', lang)];
        s.ships.forEach(function (sp) {
          if (!sp.stats) sp.stats = { km: 0, discovered: [], landed: [], flags: 0 };
          if (!sp.stats.discovered) sp.stats.discovered = [];
          if (!sp.stats.landed) sp.stats.landed = [];
          if (sp.favorite === undefined) sp.favorite = false;
          if (sp.hull === undefined) sp.hull = 0;
          if (!sp.trail) sp.trail = sp.color;
        });
        if (!s.ach) s.ach = {};
        if (!s.global) s.global = { km: 0, landings: 0 };
      }
      state = s;
      return s;
    },
    get: function () { return state; },
    save: function () { write(state); },

    settings: function () { return state.settings; },
    ships: function () { return state.ships; },
    ach: function () { return state.ach; },
    global: function () { return state.global; },

    selectedShip: function () {
      for (var i = 0; i < state.ships.length; i++) if (state.ships[i].selected) return state.ships[i];
      state.ships[0].selected = true;
      return state.ships[0];
    },

    unlock: function (id) {
      if (!state.ach[id]) { state.ach[id] = Date.now(); write(state); return true; }
      return false;
    },
    hasAch: function (id) { return !!state.ach[id]; },

    updateShip: function (id, patch) {
      var s = null;
      state.ships.forEach(function (sp) { if (sp.id === id) s = sp; });
      if (!s) return;
      for (var k in patch) s[k] = patch[k];
      write(state);
      return s;
    },
    addShip: function (name, color, trail, hull) {
      var sp = { id: 's' + Date.now().toString(36) + Math.floor(Math.random() * 1e5).toString(36), name: name, color: color, trail: trail, hull: hull, selected: false, favorite: false, stats: { km: 0, discovered: [], landed: [], flags: 0 } };
      state.ships.push(sp);
      write(state);
      return sp;
    },
    removeShip: function (id) {
      state.ships = state.ships.filter(function (sp) { return sp.id !== id; });
      if (!state.ships.length) state.ships.push(freshShip(SD._lang === 'ru' ? 'Утёнок' : 'Duckling', SD._lang));
      var hasSel = state.ships.some(function (sp) { return sp.selected; });
      if (!hasSel) state.ships[0].selected = true;
      write(state);
    },

    /* Статистика корабля */
    addKm: function (ship, km) {
      ship.stats.km += km;
      // совместимость с мелкими кораблями
    },
    shipRecord: function (ship, obj, kind) {
      var arr = ship.stats[kind]; // 'discovered' | 'landed'
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].id === obj.id) return false;
      }
      arr.push({ id: obj.id, t: obj.type, ru: obj.ru || (obj.name || ''), en: obj.en || (obj.name || '') });
      return true;
    },
    addFlag: function (ship) { ship.stats.flags++; },
    allDiscovered: function () {
      var map = {};
      state.ships.forEach(function (sp) {
        sp.stats.discovered.forEach(function (d) { if (!map[d.id]) map[d.id] = d; });
      });
      return map;
    },
    totalDiscovered: function () {
      return Object.keys(SD.store.allDiscovered()).length;
    },
    markHole: function (id) {
      state.global.holes = state.global.holes || {};
      if (!state.global.holes[id]) { state.global.holes[id] = true; write(state); }
      return Object.keys(state.global.holes).length;
    },
    allLanded: function () {
      var map = {};
      state.ships.forEach(function (sp) {
        sp.stats.landed.forEach(function (d) { map[d.id] = d; });
      });
      return map;
    },

    resetStats: function () {
      state.ships.forEach(function (sp) { sp.stats = { km: 0, discovered: [], landed: [], flags: 0 }; });
      state.ach = {};
      state.global = { km: 0, landings: 0 };
      write(state);
    }
  };
})();