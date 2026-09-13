/* ============ SpaceDuck: world.js — генерация вселенных ============ */
(function () {
  'use strict';
  var SD = window.SD = window.SD || {};
  var C = SD.CONST;

  var PLANET_PALS = [
    ['#b47a5a', '#8a5a3a'], ['#c9563a', '#8a3a2a'], ['#9aa2ad', '#6a7280'], ['#d9b06a', '#a8823f'],
    ['#e8d8a8', '#c9a86a'], ['#a8d8ff', '#5a93c9'], ['#ffc07a', '#d97f3a'], ['#e8f6ff', '#b0cfef'],
    ['#c9a8ff', '#8a63d9'], ['#8fe3c2', '#4fae8a'], ['#ff9a8a', '#c9563a'], ['#aab6ff', '#6a78d9']
  ];
  var STAR_PALS = [
    ['#fff6e0', '#ffe9a8'], ['#ffe9a8', '#ffd576'], ['#ffc07a', '#ff9d3a'], ['#ff9a6a', '#ff6a3a'],
    ['#fff', '#ffd28a'], ['#dceafe', '#a8ccff']
  ];
  var DISK_PALS = [['#ff9d3a', '#ffd576'], ['#b47bff', '#ff6ad5'], ['#7fd0ff', '#ff9d3a']];

  var SOLAR_TRAIL = 2800000;

  function rkeys(x, y, seed) {
    return (SD.hash2d(x, y) ^ (seed * 2654435761)) >>> 0;
  }

  function makeFlag(o, x, y) {
    if (!o.flags) o.flags = [];
    o.flags.push({ x: x, y: y });
  }

  /* --- единый конструктор объекта --- */
  function objBase(id, rng, sizeMul, cx, cy, withinWorld) {
    var r, type, pal;
    var roll = rng();
    var place;

    if (roll < 0.6) {
      type = 'planet'; pal = PLANET_PALS[(rng() * PLANET_PALS.length) | 0];
      r = (1400 + Math.pow(rng(), 1.8) * 12600) * sizeMul;
    } else if (roll < 0.82) {
      type = 'star'; pal = STAR_PALS[(rng() * STAR_PALS.length) | 0];
      r = (5200 + Math.pow(rng(), 1.5) * 26000) * sizeMul;
    } else {
      type = 'hole'; pal = DISK_PALS[(rng() * DISK_PALS.length) | 0];
      r = (2600 + rng() * 11000) * sizeMul;
    }

    var px = cx * C.CELL + rng() * C.CELL;
    var py = cy * C.CELL + rng() * C.CELL;

    var o = {
      id: 'o' + id,
      type: type,
      x: px, y: py, r: r,
      color: pal[0], color2: pal[1],
      flags: [],
      landed: false
    };
    if (withinWorld) o._within = withinWorld;
    if (type === 'planet') {
      o.ring = rng() < 0.16 && r > 3000 * sizeMul;
      o.craters = [];
      var nc = (rng() * 6 + 2) | 0;
      for (var i = 0; i < nc; i++) {
        o.craters.push({ dx: (rng() - 0.5) * r * 0.7, dy: (rng() - 0.5) * r * 0.7, rr: r * (0.05 + rng() * 0.14) });
      }
    }
    return o;
  }

  function buildSolar(world) {
    var s = world.solarScale;
    world.objects.push({
      id: 'sol', type: 'star', x: 0, y: 0, r: 30000, color: '#ffd576', color2: '#fff2c2',
      ru: 'Солнце', en: 'Sun', flags: []
    });
    for (var i = 1; i < SD.SOLAR.length; i++) {
      var p = SD.SOLAR[i];
      var a = i * 1.7 + 0.5;
      var dd = Math.max(p.d * s, 36000); // планеты не могут быть внутри звезды
      var o = {
        id: p.id, type: p.type,
        x: dd * Math.cos(a), y: dd * Math.sin(a),
        r: p.r, color: bodyColorFor(i), color2: bodyColorFor(i, true),
        ru: p.ru, en: p.en, flags: [], ring: !!p.ring, craters: []
      };
      if (p.ring) o.ring = true;
      var nc = (i * 3 + 2) % 7;
      for (var k = 0; k < nc; k++) {
        var rr = Math.random();
        o.craters.push({ dx: (rr - 0.5) * o.r * 0.6, dy: (Math.random() - 0.5) * o.r * 0.6, rr: o.r * (0.04 + Math.random() * 0.1) });
      }
      world.objects.push(o);
    }
  }

  function bodyColorFor(i, alt) {
    var table = ['#ffd576', '#b98a68', '#e8d8a8', '#7fd0ff', '#d9775a', '#e8d3a8', '#e4c487', '#a8f0e8', '#6ab4e8'];
    var table2 = ['#fff2c2', '#8a5a3a', '#c9a86a', '#4a90c9', '#a84a2a', '#bd9c5a', '#bd9c5a', '#5ac9c9', '#3a74a8'];
    if (i < 0 || i > 8) i = 0;
    return alt ? table2[i] : table[i];
  }

  function buildWorld(worldId) {
    var conf = null;
    for (var i = 0; i < SD.WORLDS.length; i++) if (SD.WORLDS[i].id === worldId) conf = SD.WORLDS[i];
    if (!conf) conf = SD.WORLDS[1];

    var settings = SD.store.settings();
    var scale = settings.scale || 1;
    var seed = (Math.random() * 1e9) | 0;

    var world = {
      id: worldId,
      conf: conf,
      seed: seed,
      scale: scale,
      infinite: !conf.cells,
      cellSize: C.CELL,
      cullCells: 8,
      solarScale: conf.cells ? Math.min(1, (conf.cells * C.CELL * 0.55) / SOLAR_TRAIL) : 1,
      data: new Map(),
      objects: [],   // solar system + специальные (общие для всех режимов)
      ton: null,
      sizeMul: conf.sizeM * scale * 0.9 + 0.1
    };

    buildSolar(world);

    /* TON 618 — гарантированный объект */
    var ton;
    if (world.infinite) {
      ton = {
        id: 'ton618', type: 'hole', x: 9.5 * C.CELL * (0.8 + seed % 4 * 0.05), y: 3.2 * C.CELL,
        r: 34000 * scale, color: '#ff9d3a', color2: '#2a1030', ru: 'TON 618', en: 'TON 618', flags: []
      };
    } else {
      var wr = conf.cells * C.CELL * 0.78;
      var ang = (seed % 628) / 100;
      ton = {
        id: 'ton618', type: 'hole',
        x: wr * Math.cos(ang), y: wr * Math.sin(ang),
        r: 34000 * scale, color: '#ff9d3a', color2: '#2a1030', ru: 'TON 618', en: 'TON 618', flags: []
      };
    }
    world.ton = ton;
    world.objects.push(ton);

    if (!world.infinite) {
      /* конечные миры: генерация всех ячеек */
      var n = conf.cells;
      for (var cy = -n; cy <= n; cy++) {
        for (var cx = -n; cx <= n; cx++) {
          if (Math.max(Math.abs(cx), Math.abs(cy)) > n) continue;
          genCell(world, cx, cy);
        }
      }
    }

    return world;
  }

  function cellKey(cx, cy) { return cx + ':' + cy; }

  function genCell(world, cx, cy) {
    var key = cellKey(cx, cy);
    if (world.data.has(key)) return;
    var conf = world.conf;
    var S = world.cellSize;
    var cleanR = SOLAR_TRAIL * world.solarScale + 380000;

    var density = conf.density / Math.pow(world.sizeMul, 1.15);
    var rng = SD.mulberry(rkeys(cx, cy, world.seed));
    var countP = density;
    var count = countP <= 0 ? (rng() < countP * 8 ? 1 : 0) : Math.floor(countP) + (rng() < (countP % 1) ? 1 : 0);
    var arr = [];
    for (var i = 0; i < count; i++) {
      var o = objBase(key + '_' + i, rng, world.sizeMul, cx, cy);
      var dist = Math.sqrt(o.x * o.x + o.y * o.y);
      if (dist < cleanR) continue;
      var farBoost = 1 + Math.min(1.4, dist / (C.CELL * 20));
      o.r *= (o.type === 'hole' ? 0.6 : 0.75) + farBoost * (o.type === 'hole' ? 0.4 : 0.25);
      if (world.infinite && rng() < 0.18) {
        var pool = o.type === 'planet' ? SD.NAMED.planets : o.type === 'star' ? SD.NAMED.stars : SD.NAMED.holes;
        var it = pool[(rng() * pool.length) | 0];
        o.ru = it.ru; o.en = it.en; o.named = it.id;
      } else {
        o.name = SD.genName(o.type, rng);
      }
      arr.push(o);
    }
    world.data.set(key, arr);
  }

  SD.world = {
    current: null,
    newGame: function (worldId) {
      var w = buildWorld(worldId);
      SD.world.current = w;
      return w;
    },

    landPos: function () {
      /* начальная точка: поверхность Земли с плюс-стороны */
      var earth = SD.world.current.objects.filter(function (o) { return o.id === 'earth'; })[0];
      return { x: earth.x + earth.r + 40, y: earth.y };
    },

    ensure: function (x, y) {
      var w = SD.world.current;
      if (!w.infinite) return;
      var cx = Math.floor(x / w.cellSize), cy = Math.floor(y / w.cellSize);
      var c = w.cullCells;
      for (var dy = -c; dy <= c; dy++) {
        for (var dx = -c; dx <= c; dx++) {
          genCell(w, cx + dx, cy + dy);
        }
      }
      /* удаление далёких ячеек */
      var cut = c + 3;
      var toDel = [];
      w.data.forEach(function (v, k) {
        var p = k.split(':');
        if (Math.abs(parseInt(p[0], 10) - cx) > cut || Math.abs(parseInt(p[1], 10) - cy) > cut) toDel.push(k);
      });
      for (var i = 0; i < toDel.length; i++) w.data.delete(toDel[i]);
    },

    near: function (x, y) {
      var w = SD.world.current;
      var S = w.cellSize, c = w.cullCells;
      var cx = Math.floor(x / S), cy = Math.floor(y / S);
      var list = [];
      for (var dy = -c; dy <= c; dy++) {
        for (var dx = -c; dx <= c; dx++) {
          var arr = w.data.get(cellKey(cx + dx, cy + dy));
          if (arr) for (var i = 0; i < arr.length; i++) list.push(arr[i]);
        }
      }
      list = list.concat(w.objects);
      return list;
    },

    nearest: function (x, y) {
      var list = SD.world.near(x, y);
      var best = null, bd = Infinity;
      for (var i = 0; i < list.length; i++) {
        var o = list[i];
        var d = Math.hypot(o.x - x, o.y - y) - o.r;
        if (d < bd) { bd = d; best = o; }
      }
      if (best) best._d = Math.max(0, bd);
      return best;
    }
  };
})();