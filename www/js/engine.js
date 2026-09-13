/* ============ SpaceDuck: engine.js ============ */
(function () {
  'use strict';
  var SD = window.SD = window.SD || {};
  var C = SD.CONST;

  var canvas, ctx, W = 0, H = 0, dpr = 1;
  var starsA = null, starsB = null;

  var run = null;
  var raf = 0, lastTime = 0;
  var paused = false;
  var hudTimer = 0;
  var zoom = C.ZOOM;
  var pointers = {};
  var joyId = null;
  var pinch = null;
  var pendingT = null; /* отложенный взлёт: ждём, что жест — полёт, а не зум */

  function between(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function shade(hex, amt) {
    var p = parseInt(hex.replace('#', ''), 16);
    var r = between((p >> 16) + amt, 0, 255), g = between(((p >> 8) & 0xff) + amt, 0, 255), b = between((p & 0xff) + amt, 0, 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  function rgbaOf(hex, a) {
    var c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(function (x) { return x + x; }).join('');
    var r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  function makeStarPattern(n, size) {
    var cv = document.createElement('canvas');
    cv.width = cv.height = size;
    var g = cv.getContext('2d');
    var rng = SD.mulberry(1234 + n * 17);
    for (var i = 0; i < 36; i++) {
      var x = rng() * size, y = rng() * size, r = 0.4 + rng() * 1.3;
      var bright = 0.2 + rng() * 0.8;
      var col = rng() < 0.18 ? '#ffd9a8' : rng() < 0.12 ? '#a8d8ff' : '#ffffff';
      g.globalAlpha = bright;
      g.fillStyle = col;
      g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
    return g.createPattern(cv, 'repeat');
  }

  function bgLayers() {
    if (!starsA) starsA = makeStarPattern(1, 384);
    if (!starsB) starsB = makeStarPattern(2, 512);
  }

  function drawStars(pat, depth, scale) {
    var off = (run.x + run.y) * depth * scale;
    ctx.save();
    ctx.translate(-(off % 384) + (off < 0 ? 384 : 0), -(off % 384) + (off < 0 ? 384 : 0));
    ctx.fillStyle = pat;
    ctx.fillRect(-384, -384, W + 768, H + 768);
    ctx.restore();
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function achieve(id) {
    var isNew = SD.store.unlock(id);
    if (isNew) {
      SD.sound.achievement();
      SD.ui.toast(SD.fill(SD.t('toast_ach'), { name: SD.achName(id, 't') }));
    }
    return isNew;
  }

  function newRun(worldId) {
    var world = SD.world.newGame(worldId);
    var ship = SD.store.selectedShip();
    var lp = SD.world.landPos();
    var earth = null;
    for (var i = 0; i < world.objects.length; i++) if (world.objects[i].id === 'earth') earth = world.objects[i];
    var ang = Math.atan2((lp.y - earth.y), (lp.x - earth.x));
    return {
      world: world,
      ship: ship,
      x: earth.x + Math.cos(ang) * (earth.r - 2),
      y: earth.y + Math.sin(ang) * (earth.r - 2),
      vx: 0, vy: 0,
      landed: { obj: earth, ang: ang },
      landGrace: 0,
      km: 0,
      flags: 0,
      trail: [],
      joy: null,
      auto: false,
      autoTarget: null,
      leftEarth: false,
      lastHole: null,
      lastEarthD: earth.r + 100,
      holeApproach: false,
      holeDanger: false,
      time: 0,
      near: [],
      spinning: false
    };
  }

  function distObj(o, x, y) { return Math.hypot(o.x - x, o.y - y); }

  /* --- swept-коллизия: не «прошиваем» объекты на скорости --- */
  function sweptCircle(ax, ay, bx, by, cx, cy, r) {
    var fx = ax - cx, fy = ay - cy;
    var rr = r * r;
    if (fx * fx + fy * fy >= rr) {
      var dx = bx - ax, dy = by - ay;
      var a = dx * dx + dy * dy;
      if (a < 1e-9) return { hit: false };
      var b2 = 2 * (fx * dx + fy * dy);
      var c = fx * fx + fy * fy - rr;
      var disc = b2 * b2 - 4 * a * c;
      if (disc < 0) return { hit: false };
      var t = (-b2 - Math.sqrt(disc)) / (2 * a);
      if (t < 0 || t > 1) return { hit: false };
      var hx = ax + dx * t, hy = ay + dy * t;
      var ln = Math.hypot(hx - cx, hy - cy) || 1;
      return { hit: true, nx: (hx - cx) / ln, ny: (hy - cy) / ln };
    }
    var ln2 = Math.hypot(fx, fy) || 1;
    return { hit: true, nx: fx / ln2, ny: fy / ln2 };
  }

  /* ---------- update ---------- */
  function update(dt) {
    var s = run;
    s.time += dt;
    if (s.landGrace > 0) s.landGrace -= dt;

    s.near = SD.world.near(s.x, s.y);

    var holeDanger = false;
    for (var i = 0; i < s.near.length; i++) {
      var o = s.near[i];
      var d = distObj(o, s.x, s.y);
      if (s.landed && s.landed.obj === o) continue;

      if (o.type === 'hole') {
        var pullR = o.r * C.HOLE_PULL;
        if (d < pullR && d > o.r) {
          var a = C.HOLE_ACC * (o.r / 4000) * (pullR / Math.max(d, 200));
          var ux = (o.x - s.x) / d, uy = (o.y - s.y) / d;
          s.vx += ux * a * dt; s.vy += uy * a * dt;
          if (d < o.r * 3) holeDanger = true;
          s.holeApproach = true;
          s.lastHole = o;
          SD.sound.holeNear();
        }
        if (d <= o.r) return 'dead:' + o.id;
      } else {
        var gr = o.r * 2.4;
        if (d < gr) {
          var dd = Math.max(d, 1);
          var gA = 90 * (o.r / 4000) * (1 - d / gr) + 8;
          s.vx += ((o.x - s.x) / dd) * gA * dt;
          s.vy += ((o.y - s.y) / dd) * gA * dt;
        }
      }
    }

    if (s.holeApproach && s.lastHole) {
      if (distObj(s.lastHole, s.x, s.y) > s.lastHole.r * 6) {
        var metH = SD.store.markHole(s.lastHole.id);
        if (metH >= 3) achieve('a_hole3');
        achieve('a_hole_close');
        s.holeApproach = false;
      }
    }

    /* --- джойстик --- */
    if (!s.landed && s.joy && s.joy.active) {
      var dx = s.joy.sx - s.joy.cx, dy = s.joy.sy - s.joy.cy;
      var dl = Math.hypot(dx, dy);
      if (dl > 1) {
        var nx = dx / dl, ny = dy / dl;
        var mag = Math.min(1, dl / C.JOY_R);
        s.vx += nx * C.THRUST * mag * dt;
        s.vy += ny * C.THRUST * mag * dt;
      }
    }

    /* --- автопилот --- */
    if (s.auto && !s.landed) {
      if (!s.autoTarget || distObj(s.autoTarget, s.x, s.y) < s.autoTarget.r + 300) {
        s.autoTarget = SD.world.nearest(s.x, s.y);
      }
      if (s.autoTarget) {
        var at = s.autoTarget;
        if (s.landed && at === s.landed.obj) {
          s.autoTarget = null;
        } else {
          var td = Math.max(1, distObj(at, s.x, s.y));
          var aSpd = Math.min(C.AUTOPILOT_SPEED, td * 2);
          s.vx = ((at.x - s.x) / td) * aSpd;
          s.vy = ((at.y - s.y) / td) * aSpd;
        }
      }
      achieve('a_auto');
    }

    /* --- скорость и движение --- */
    var sp = Math.hypot(s.vx, s.vy);
    if (sp > C.MAX_SPEED) { s.vx *= C.MAX_SPEED / sp; s.vy *= C.MAX_SPEED / sp; }
    if (Math.hypot(s.vx, s.vy) >= C.MAX_SPEED * 0.95) achieve('a_maxspd');
    var prevX = s.x, prevY = s.y;
    var ax = s.x + s.vx * dt, ay = s.y + s.vy * dt;

    /* --- честные хитбоксы: swept-отскок (не пролетаем сквозь планеты) --- */
    if (!s.landed) {
      for (var b = 0; b < s.near.length; b++) {
        var bo = s.near[b];
        if (bo.type === 'hole') continue;
        var sw = sweptCircle(prevX, prevY, ax, ay, bo.x, bo.y, bo.r);
        if (sw.hit) {
          var vs = s.vx * sw.nx + s.vy * sw.ny;
          if (vs < 0) {
            s.vx -= 2 * vs * sw.nx;
            s.vy -= 2 * vs * sw.ny;
            s.vx *= 0.45; s.vy *= 0.45;
          }
          ax = bo.x + sw.nx * (bo.r + 2);
          ay = bo.y + sw.ny * (bo.r + 2);
        }
      }
      /* swept-проверка чёрной дыры (смерть на скорости) */
      for (var h2 = 0; h2 < s.near.length; h2++) {
        var ho2 = s.near[h2];
        if (ho2.type !== 'hole') continue;
        if (sweptCircle(prevX, prevY, ax, ay, ho2.x, ho2.y, ho2.r).hit) return 'dead:' + ho2.id;
      }
    }
    s.x = ax; s.y = ay;
    s.km += Math.hypot(s.x - prevX, s.y - prevY);

    /* --- шлейф: плотная запись, чтобы не было разрывов --- */
    if (!s.landed && Math.hypot(s.vx, s.vy) > 30) {
      var last = s.trail[s.trail.length - 1];
      if (!last || last.x !== s.x || last.y !== s.y) {
        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > C.TRAIL_MAX) s.trail.splice(0, s.trail.length - C.TRAIL_MAX);
      }
    }

    SD.world.ensure(s.x, s.y);

    if (s.landed) {
      var la = s.landed.ang, lo = s.landed.obj;
      s.x = lo.x + Math.cos(la) * (lo.r - 2);
      s.y = lo.y + Math.sin(la) * (lo.r - 2);
      s.vx = 0; s.vy = 0;
    }

    /* --- посадка --- */
    if (!s.landed && s.landGrace <= 0) {
      for (var l = 0; l < s.near.length; l++) {
        var po = s.near[l];
        if (po.type === 'hole') continue;
        var pd = distObj(po, s.x, s.y);
        var psp = Math.hypot(s.vx, s.vy);
        var outward = ((s.vx * (s.x - po.x) + s.vy * (s.y - po.y)) > 0);
        if (pd < po.r + 40 && pd > po.r - 20 && psp < C.LAND_SPEED && outward) {
          landOn(po);
          break;
        }
      }
    }

    if (s.ship) {
      for (var j = 0; j < s.near.length; j++) {
        var no = s.near[j];
        if (distObj(no, s.x, s.y) < no.r * 3) discover(no);
      }
    }

    var earth = null;
    for (var e = 0; e < s.near.length; e++) if (s.near[e].id === 'earth') { earth = s.near[e]; break; }
    if (earth) {
      var eD = distObj(earth, s.x, s.y);
      if (eD > earth.r * 3) s.leftEarth = true;
      s.lastEarthD = eD;
    }

    if (s.ship.stats.km >= 10000) achieve('a_dist10k');
    if (s.ship.stats.km >= 100000) achieve('a_dist100k');
    if (s.ship.stats.km >= 1000000) achieve('a_dist1m');

    run.holeDanger = holeDanger;
  }

  function landOn(o) {
    var s = run;
    var d = Math.max(1, distObj(o, s.x, s.y));
    var ang = Math.atan2(s.y - o.y, s.x - o.x);
    s.x = o.x + Math.cos(ang) * (o.r - 2);
    s.y = o.y + Math.sin(ang) * (o.r - 2);
    s.vx = 0; s.vy = 0;
    s.landed = { obj: o, ang: ang };
    s.landGrace = 1.1;
    o.flags = o.flags || [];
    o.flags.push({ x: o.x + Math.cos(ang) * o.r, y: o.y + Math.sin(ang) * o.r });
    s.trail.push({ x: s.x, y: s.y });

    SD.store.addFlag(s.ship);
    var landedOld = SD.store.shipRecord(s.ship, o, 'landed');
    if (landedOld) SD.store.shipRecord(s.ship, o, 'discovered');
    SD.store.save();
    SD.sound.landing();
    SD.sound.flagPlanted();

    if (s.leftEarth && o.id === 'earth') achieve('a_earth');
    if (landedOld) {
      achieve('a_land1');
      if (o.type === 'star') achieve('a_star_land');
      var all = true;
      ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].forEach(function (id) {
        if (!SD.store.allLanded()[id]) all = false;
      });
      if (all) achieve('a_colonist');
      if (Object.keys(SD.store.allLanded()).length >= 5) achieve('a_land5');
    }
    s.flags++;
    if (s.flags >= 5) achieve('a_flags5');
    if (s.auto) { s.auto = false; s.autoTarget = null; }
    SD.ui.hud('g_landed', true);
  }

  function discover(o) {
    var was = SD.store.shipRecord(run.ship, o, 'discovered');
    if (!was) return;
    SD.store.save();
    SD.sound.discover();
    if (['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].indexOf(o.id) >= 0) {
      var all = true;
      ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].forEach(function (id) {
        if (!SD.store.allDiscovered()[id]) all = false;
      });
      if (all) achieve('a_solar');
    }
    if (o.type === 'star' && o.id !== 'sol') achieve('a_star1');
    var disc = SD.store.totalDiscovered();
    if (disc >= 5) achieve('a_discover5');
    if (disc >= 10) achieve('a_discover');
  }

  function shipHas(ship, kind, id) {
    var arr = ship.stats[kind];
    if (!arr) return false;
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return true;
    return false;
  }

  /* ---------- render ---------- */
  function render() {
    var s = run;
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    bgLayers();
    drawStars(starsB, 1, 0.0006);
    drawStars(starsA, 1, 0.0018);

    var z = zoom;
    var halfW = W / 2, halfH = H / 2;

    for (var i = 0; i < s.near.length; i++) {
      var o = s.near[i];
      if (inView(o)) drawBody(o, z, halfW, halfH);
    }

    drawTrail(z, halfW, halfH);
    drawShip(z, halfW, halfH);
    if (s.joy && s.joy.active) drawJoystick();

    if (s.holeDanger) {
      var pulse = 0.5 + 0.5 * Math.sin(s.time * 7);
      var g = ctx.createRadialGradient(halfW, halfH, Math.min(W, H) * 0.3, halfW, halfH, Math.max(W, H) * 0.72);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(255,40,40,' + (0.18 + pulse * 0.22) + ')');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function inView(o) {
    var pad = (o.r || 6000) * 3 * 1.4 + 300;
    var z = zoom;
    var x = (o.x - run.x) * z + W / 2;
    var y = (o.y - run.y) * z + H / 2;
    pad *= z;
    return x > -pad && x < W + pad && y > -pad && y < H + pad;
  }

  function drawBody(o, z, hw, hh) {
    var sx = (o.x - run.x) * z + hw;
    var sy = (o.y - run.y) * z + hh;
    /* радиус рисуется в точном соответствии с физикой (без зажатия в 170px),
       иначе при зуме видимый край «уезжает» и посадка кажется в воздухе */
    var vr = Math.max(4, o.r * z);
    if (o.type === 'hole') drawHoleBody(o, sx, sy, vr);
    else if (o.type === 'star') drawStarBody(o, sx, sy, vr);
    else drawPlanetBody(o, sx, sy, vr, z);
    drawFlags(o, z, hw, hh);
  }

  function drawPlanetBody(o, sx, sy, vr, z) {
    if (o.ring) {
      var ringAng = Math.atan2(o.y, o.x) * 0.6;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(ringAng);
      ctx.fillStyle = 'rgba(210,190,150,0.30)';
      ctx.beginPath();
      ctx.ellipse(0, 0, vr * 1.7, vr * 0.55, 0, 0, 7);
      ctx.fill();
      ctx.restore();
    }
    var grad = ctx.createRadialGradient(sx - vr * 0.35, sy - vr * 0.35, vr * 0.1, sx, sy, vr * 1.05);
    grad.addColorStop(0, shade(o.color, 70));
    grad.addColorStop(0.55, o.color);
    grad.addColorStop(1, o.color2);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(sx, sy, vr, 0, 7); ctx.fill();
    if (o.craters) {
      for (var i = 0; i < o.craters.length; i++) {
        var cr = o.craters[i];
        var crr = between(cr.rr * z, 1, vr * 0.4);
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath(); ctx.arc(sx + cr.dx * z, sy + cr.dy * z, crr, 0, 7); ctx.fill();
      }
    }
  }

  function drawStarBody(o, sx, sy, vr) {
    var g2 = ctx.createRadialGradient(sx, sy, vr * 0.2, sx, sy, vr * 2.8);
    g2.addColorStop(0, rgbaOf(o.color, 0.28 + 0.1 * Math.sin(run.time * 2)));
    g2.addColorStop(0.5, rgbaOf(o.color, 0.08));
    g2.addColorStop(1, rgbaOf(o.color, 0));
    ctx.fillStyle = g2;
    ctx.beginPath(); ctx.arc(sx, sy, Math.max(vr * 2.8, 26), 0, 7); ctx.fill();
    var core = ctx.createRadialGradient(sx, sy, 0, sx, sy, vr);
    core.addColorStop(0, '#ffffff');
    core.addColorStop(0.45, o.color);
    core.addColorStop(1, o.color2);
    ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(sx, sy, vr, 0, 7); ctx.fill();
  }

  function drawHoleBody(o, sx, sy, vr) {
    var disc = ctx.createRadialGradient(sx, sy, vr * 0.35, sx, sy, vr * 2.1);
    disc.addColorStop(0, 'rgba(20,8,30,0.9)');
    disc.addColorStop(0.55, rgbaOf(o.color, 0.12));
    disc.addColorStop(1, rgbaOf(o.color, 0));
    ctx.fillStyle = disc;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(run.time * 0.15);
    ctx.beginPath(); ctx.ellipse(0, 0, vr * 2.1, vr * 1.15, 0, 0, 7); ctx.fill();
    ctx.restore();
    var eh = ctx.createRadialGradient(sx, sy, 0, sx, sy, vr);
    eh.addColorStop(0, '#000');
    eh.addColorStop(0.78, '#000');
    eh.addColorStop(0.92, 'rgba(255,213,118,0.35)');
    eh.addColorStop(1, '#000');
    ctx.fillStyle = eh;
    ctx.beginPath(); ctx.arc(sx, sy, vr, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(sx, sy, vr * 0.86, 0, 7); ctx.stroke();
  }

  function drawFlags(o, z, hw, hh) {
    if (!o.flags || !o.flags.length) return;
    var hulls = SD.COLORS.hull;
    for (var i = 0; i < o.flags.length; i++) {
      var f = o.flags[i];
      var sx = (f.x - run.x) * z + hw;
      var sy = (f.y - run.y) * z + hh;
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
      var col = hulls[i % hulls.length];
      var dirx = (f.x - o.x) / Math.max(1, Math.hypot(f.x - o.x, f.y - o.y));
      var diry = (f.y - o.y) / Math.max(1, Math.hypot(f.x - o.x, f.y - o.y));
      var px = diry * 1.4, py = -dirx * 1.4;
      var len = Math.max(9, 20 * z * 60);
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + dirx * len, sy + diry * len);
      ctx.stroke();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(sx + dirx * len, sy + diry * len);
      ctx.lineTo(sx + dirx * len + px * 7, sy + diry * len + py * 7);
      ctx.lineTo(sx + dirx * len + px * 3.5, sy + diry * len + py * 3.5);
      ctx.closePath(); ctx.fill();
    }
  }

  /* --- гладкий непрерывный шлейф: одна плавная кривая --- */
  function drawTrail(z, hw, hh) {
    var t = run.trail;
    if (t.length < 2) return;
    var col = run.ship.trail || '#ffd53d';
    var stride = Math.max(1, Math.ceil(t.length / 700));
    if (!t[0]) return;
    var i, x, y;
    var pts = [];
    for (i = 0; i < t.length; i += stride) {
      x = (t[i].x - run.x) * z + hw;
      y = (t[i].y - run.y) * z + hh;
      pts.push(x, y);
    }
    if (pts.length < 4) return;

    var grad = ctx.createLinearGradient(hw, hh, pts[0], pts[1]);
    grad.addColorStop(0, rgbaOf(col, 0.72));
    grad.addColorStop(0.85, rgbaOf(col, 0.2));
    grad.addColorStop(1, rgbaOf(col, 0));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (i = 2; i < pts.length - 2; i += 2) {
      var mx = (pts[i] + pts[i + 2]) / 2, my = (pts[i + 1] + pts[i + 3]) / 2;
      ctx.quadraticCurveTo(pts[i], pts[i + 1], mx, my);
    }
    ctx.lineTo(pts[pts.length - 2], pts[pts.length - 1]);
    ctx.stroke();

    /* яркая головка: от последней точки до самого корабля */
    ctx.strokeStyle = rgbaOf(col, 0.92);
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(pts[pts.length - 2], pts[pts.length - 1]);
    ctx.lineTo(hw, hh);
    ctx.stroke();
  }

  /* --- джойстик --- */
  function drawJoystick() {
    var j = run.joy;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(j.cx, j.cy, C.JOY_R, 0, 7); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath(); ctx.arc(j.cx, j.cy, C.JOY_R, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.moveTo(j.cx, j.cy); ctx.lineTo(j.sx, j.sy); ctx.stroke();
    ctx.fillStyle = 'rgba(255,213,61,0.4)';
    ctx.strokeStyle = 'rgba(255,213,61,0.8)';
    ctx.beginPath(); ctx.arc(j.sx, j.sy, 22, 0, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  /* --- корабль: прямоугольник + два малых прямоугольника снизу --- */
  function drawShip(z, hw, hh) {
    var s = run;
    if (!s) return;
    var gx = (s.x - run.x) * z + hw;
    var gy = (s.y - run.y) * z + hh;
    var ang;
    if (s.landed) ang = s.landed.ang;
    else ang = Math.atan2(s.vy, s.vx);
    var speed = Math.hypot(s.vx, s.vy);
    var thrust = (s.joy && s.joy.active) || s.auto;

    /* размер корабля ~5px по длине корпуса, не зависит от зума */
    var k = 5 / 22;

    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(ang);
    ctx.scale(k, k);

    var hull = s.ship.color;
    var dark = shade(hull, -80);
    var light = shade(hull, 110);

    /* пламя */
    if (thrust && !s.landed) {
      var fl = 4 + (speed / C.MAX_SPEED) * 7;
      ctx.fillStyle = 'rgba(255,160,40,0.85)';
      ctx.beginPath(); ctx.moveTo(-10, -2.2); ctx.lineTo(-(10 + fl), 0); ctx.lineTo(-10, 2.2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,200,0.75)';
      ctx.beginPath(); ctx.arc(-(10 + fl * 0.35), 0, 1.5, 0, 7); ctx.fill();
    }

    ctx.fillStyle = hull;
    ctx.strokeStyle = dark;
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';

    var hv = (s.ship.hull || 0) % 3;

    if (hv === 0) {
      /* корпус — прямоугольник */
      ctx.fillRect(-11, -5, 22, 10);
      ctx.strokeRect(-11, -5, 22, 10);
      /* носовое окно */
      ctx.fillStyle = light;
      ctx.fillRect(6, -2.6, 5, 5.2);
      /* два малых прямоугольника по бокам снизу (нижние стабилизаторы) */
      ctx.fillStyle = dark;
      ctx.fillRect(-11, 5, 9, 3.6);
      ctx.fillRect(3, 5, 7, 3.6);
      /* киль снизу посередине */
      ctx.fillStyle = shade(hull, -40);
      ctx.fillRect(-3, 8.6, 6, 1.7);
    } else if (hv === 1) {
      /* корпус — клин ◆ */
      ctx.beginPath(); ctx.moveTo(-11, -5); ctx.lineTo(2, -5); ctx.lineTo(11, 0); ctx.lineTo(2, 5); ctx.lineTo(-11, 5); ctx.closePath();
      ctx.fill(); ctx.stroke();
      /* носовое окно */
      ctx.fillStyle = light;
      ctx.beginPath(); ctx.arc(7.5, 0, 3, 0, 7); ctx.fill(); ctx.stroke();
      /* два малых прямоугольника по бокам снизу */
      ctx.fillStyle = dark;
      ctx.fillRect(-11, 5, 8, 3.4);
      ctx.fillRect(1, 5, 6, 3.4);
      /* киль */
      ctx.fillStyle = shade(hull, -40);
      ctx.fillRect(-3, 8.4, 9, 1.6);
    } else {
      /* корпус — «вилка»: две длинные планки ◆◇ */
      ctx.fillRect(-10, -7, 19, 3.2);
      ctx.strokeRect(-10, -7, 19, 3.2);
      ctx.fillRect(-10, 3.8, 19, 3.2);
      ctx.strokeRect(-10, 3.8, 19, 3.2);
      ctx.fillRect(-4, -3.4, 12, 6.8); /* блок по центру-носу */
      ctx.strokeRect(-4, -3.4, 12, 6.8);
      /* носовое окно */
      ctx.fillStyle = light;
      ctx.fillRect(4.5, -2.6, 4.5, 5.2);
      /* два малых прямоугольника по бокам снизу */
      ctx.fillStyle = dark;
      ctx.fillRect(-10, 7, 8, 3.2);
      ctx.fillRect(2, 7, 6, 3.2);
      /* киль */
      ctx.fillStyle = shade(hull, -40);
      ctx.fillRect(-2, 10.2, 6, 1.5);
    }
    ctx.restore();
  }

  /* ---------- HUD ---------- */
  function updateHud() {
    var s = run;
    if (!s) return;
    var el = document.getElementById('hud-left');
    var near = SD.world.nearest(s.x, s.y);
    var dist = near ? Math.max(0, distObj(near, s.x, s.y) - near.r) : 0;
    el.innerHTML =
      '<div class="hl-ship">' + s.ship.name + '</div>' +
      '<div class="hl-obj">' + SD.fill(SD.t('g_nearest'), { name: SD.objName(near), dist: SD.formatKm(dist) }) + '</div>';
    document.getElementById('hole-warn').classList.toggle('hidden', !s.holeDanger);
  }

  function setAutoBtn() {
    var b = document.getElementById('btn-auto');
    b.classList.toggle('on', !!(run && run.auto));
  }

  /* ---------- pointer ---------- */
  function ptrPos(ev) {
    var r = canvas.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }

  function doTakeoff() {
    var o = run.landed.obj;
    var ang = run.landed.ang;
    if (o.id === 'earth') run.leftEarth = true;
    run.vx = Math.cos(ang) * 700;
    run.vy = Math.sin(ang) * 700;
    run.landed = null;
    run.landGrace = 0.8;
    SD.sound.takeoff();
    SD.ui.hud('g_hint', true);
    achieve('a_start');
  }

  function onDown(ev) {
    if (!run || paused) return;
    ev.preventDefault();
    try { canvas.setPointerCapture(ev.pointerId); } catch (e) {}
    var p = ptrPos(ev);
    pointers[ev.pointerId] = p;
    var ids = Object.keys(pointers).map(Number);
    if (ids.length === 1) {
      joyId = ev.pointerId;
      if (run.landed) {
        /* не взлетаем сразу: вдруг это начало пинч-зума */
        pendingT = ev.pointerId;
        run.joy = { active: false, cx: p.x, cy: p.y, sx: p.x, sy: p.y };
      } else {
        run.joy = { active: true, cx: p.x, cy: p.y, sx: p.x, sy: p.y };
        SD.sound.engineOn();
      }
    } else if (ids.length === 2) {
      /* второй палец: пинч-зум — отменяем отложенный взлёт и джойстик */
      pendingT = null;
      joyId = null;
      pinch = {
        id1: ids[0],
        id2: ids[1],
        d0: Math.hypot(pointers[ids[0]].x - p.x, pointers[ids[0]].y - p.y),
        zoom0: zoom
      };
      if (run.joy) run.joy.active = false;
      SD.sound.engineSet(0);
    }
  }
  function onMove(ev) {
    if (!run || paused) return;
    ev.preventDefault();
    var p = ptrPos(ev);
    pointers[ev.pointerId] = p;
    if (pinch && (ev.pointerId === pinch.id1 || ev.pointerId === pinch.id2)) {
      var a = pointers[pinch.id1], b = pointers[pinch.id2];
      if (a && b) {
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch.d0 > 0 && d > 0) {
          zoom = between(pinch.zoom0 * (d / pinch.d0), C.ZOOM_MIN, C.ZOOM_MAX);
        }
      }
      return;
    }
    if (ev.pointerId !== joyId) return;
    if (pendingT === ev.pointerId) {
      if (Math.hypot(p.x - run.joy.cx, p.y - run.joy.cy) > 12) {
        /* потянули — значит полёт, взлетаем */
        pendingT = null;
        if (run.landed) doTakeoff();
        if (run.joy) run.joy.active = true;
        SD.sound.engineOn();
      }
    }
    if (!run.joy) return;
    var dx = p.x - run.joy.cx, dy = p.y - run.joy.cy;
    var dl = Math.hypot(dx, dy);
    if (dl > C.JOY_R) {
      run.joy.sx = run.joy.cx + dx / dl * C.JOY_R;
      run.joy.sy = run.joy.cy + dy / dl * C.JOY_R;
    } else {
      run.joy.sx = p.x; run.joy.sy = p.y;
    }
  }
  function onUp(ev) {
    if (!run) return;
    delete pointers[ev.pointerId];
    if (pinch && (ev.pointerId === pinch.id1 || ev.pointerId === pinch.id2)) {
      pinch = null;
      var ids = Object.keys(pointers).map(Number);
      if (ids.length === 1 && !run.landed) {
        var pp = pointers[ids[0]];
        joyId = ids[0];
        run.joy = { active: true, cx: pp.x, cy: pp.y, sx: pp.x, sy: pp.y };
        SD.sound.engineOn();
      }
      return;
    }
    if (pendingT === ev.pointerId) {
      /* «тап»: нажали и отпустили без второго пальца — взлетаем */
      pendingT = null;
      if (run.landed) doTakeoff();
    }
    if (ev.pointerId === joyId) {
      joyId = null;
      if (run.joy) run.joy.active = false;
      SD.sound.engineSet(0);
    }
  }

  /* ---------- loop ---------- */
  function tick(now) {
    if (run && !paused) {
      var dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;
      if (run.ship) run.ship.stats.km = (run.ship.kBase || 0) + run.km;
      var res = update(dt);
      if (res && res.indexOf('dead:') === 0) {
        death(res.split(':')[1]);
        return;
      }
      if (run) {
        hudTimer += dt;
        if (hudTimer > 0.15) { hudTimer = 0; updateHud(); }
        var mag = 0;
        if (run.joy && run.joy.active) {
          mag = Math.min(1, Math.hypot(run.joy.sx - run.joy.cx, run.joy.sy - run.joy.cy) / C.JOY_R);
        }
        SD.sound.engineSet(Math.max(mag, Math.min(1, Math.hypot(run.vx, run.vy) / C.MAX_SPEED)) * 0.7);
      }
      render();
    }
    raf = requestAnimationFrame(tick);
  }

  function death(holeId) {
    var s = run;
    if (!s) return;
    paused = true;
    SD.sound.engineOff();
    SD.sound.death();
    SD.sound.vibrate([80, 60, 120]);
    if (holeId === 'ton618') achieve('a_ton');
    SD.ui.toast(SD.t('g_died'));
    SD.store.save();
    setTimeout(function () { SD.engine.stop(); }, 1500);
  }

  /* ---------- public ---------- */
  SD.engine = {
    init: function (cv) {
      canvas = cv;
      ctx = cv.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);
    },
    start: function (worldId) {
      if (raf) cancelAnimationFrame(raf);
      paused = false;
      SD.sound.init();
      zoom = C.ZOOM;
      run = newRun(worldId);
      run.ship.kBase = run.ship.stats.km;
      SD.store.save();
      lastTime = performance.now();
      SD.ui.show('game');
      document.getElementById('btn-auto').classList.remove('on');
      SD.ui.hud('g_landed', true);
      updateHud();
      if (worldId === 'inf') achieve('a_inf');
      SD.sound.engineOn();
      raf = requestAnimationFrame(tick);
    },
    stop: function () {
      if (raf) cancelAnimationFrame(raf);
      paused = true;
      try { SD.sound.engineOff(); } catch (e) {}
      if (run) SD.store.save();
      SD.ui.show('menu');
      run = null;
    },
    setPaused: function (v) {
      paused = v;
      if (v) { SD.sound.engineOff(); SD.sound.engineSet(0); }
      else { lastTime = performance.now(); SD.sound.engineOn(); }
    },
    isPaused: function () { return paused; },
    getRun: function () { return run; },
    getZoom: function () { return zoom; },
    unlockOne: achieve,
    setAutoBtn: setAutoBtn
  };
})();