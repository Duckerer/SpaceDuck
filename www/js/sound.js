/* ============ SpaceDuck: sound.js (WebAudio + vibration) ============ */
(function () {
  'use strict';
  var SD = window.SD = window.SD || {};
  var ctx = null, master = null, engineOsc = null, engineGain = null;
  var ready = false;

  function ensure() {
    if (ready) return true;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);
      ready = true;
    } catch (e) { return false; }
    return true;
  }
  SD.soundSetVolume = function (v) { if (master) master.gain.value = v; };

  function tone(freq, dur, type, vol, slideTo, delay) {
    if (!ensure()) return;
    if (!isFinite(freq) || freq <= 0) freq = 440;
    var t0 = ctx.currentTime + (delay || 0);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    if (slideTo && isFinite(slideTo) && slideTo > 0) o.frequency.exponentialRampToValueAtTime(Math.max(10, slideTo), t0 + dur);
    g.gain.value = vol || 0.08;
    g.gain.setValueAtTime(vol || 0.08, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  function noise(dur, vol, freq, q) {
    if (!ensure()) return;
    var len = Math.max(1, (ctx.sampleRate * dur) | 0);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource(); src.buffer = buf;
    var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 900; f.Q.value = q || 0.8;
    var g = ctx.createGain(); g.gain.value = vol || 0.05;
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start();
    src.stop(ctx.currentTime + dur + 0.05);
  }

  var penult = 0;
  function throttleSound(ms) { var now = performance.now(); if (now - penult < ms) return false; penult = now; return true; }

  SD.sound = {
    init: function () {
      if (!ensure()) return;
      if (ctx && ctx.state === 'suspended') ctx.resume();
    },
    setVolume: function (v) { if (master && isFinite(v)) master.gain.value = v; },
    vibrate: function (ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} },
    click: function () { tone(660, 0.07, 'triangle', 0.08); },
    back: function () { tone(440, 0.07, 'triangle', 0.07); },
    hover: function () { tone(880, 0.03, 'sine', 0.02); },
    switchOn: function () { tone(520, 0.09, 'triangle', 0.08, 780); },

    takeoff: function () { tone(120, 0.4, 'sawtooth', 0.07, 720); noise(0.35, 0.06, 400, 1.2); },
    landing: function () { tone(170, 0.28, 'sine', 0.14, 70); noise(0.2, 0.1, 500, 0.6); SD.sound.vibrate(50); },
    flagPlanted: function () { tone(720, 0.1, 'triangle', 0.07, 540); tone(1080, 0.12, 'triangle', 0.05, 900, 0.08); },
    discover: function () { if (throttleSound(350)) tone(990, 0.09, 'sine', 0.045, 1320); },
    holeNear: function () { if (throttleSound(600)) { tone(220, 0.3, 'sine', 0.05, 90); tone(115, 0.35, 'sine', 0.05, 45); } },
    achievement: function () {
      tone(523, 0.12, 'triangle', 0.09);
      setTimeout(function () { tone(659, 0.12, 'triangle', 0.09); }, 110);
      setTimeout(function () { tone(784, 0.2, 'triangle', 0.1); }, 220);
      setTimeout(function () { tone(1047, 0.3, 'triangle', 0.08); }, 340);
    },
    death: function () { tone(300, 1.2, 'sawtooth', 0.15, 35); noise(1.0, 0.12, 250, 0.5); SD.sound.vibrate([80, 60, 120]); },
    clickSmall: function () { tone(820, 0.04, 'sine', 0.03); },

    engineOn: function () {
      if (!ensure() || engineOsc) return;
      engineOsc = ctx.createOscillator();
      engineGain = ctx.createGain();
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 320;
      engineOsc.type = 'sawtooth';
      engineOsc.frequency.value = 55;
      engineGain.gain.value = 0;
      engineOsc.connect(f); f.connect(engineGain); engineGain.connect(master);
      engineOsc.start();
    },
    engineSet: function (level) {
      var lv = isFinite(level) ? Math.max(0, level) : 0;
      if (engineGain && ctx) engineGain.gain.value = lv * 0.05;
      if (engineOsc && ctx) engineOsc.frequency.value = 55 + lv * 160;
    },
    engineOff: function () {
      if (engineOsc) { try { engineOsc.stop(); } catch (e) {} engineOsc = null; engineGain = null; }
    }
  };
})();