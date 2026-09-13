/* ============ SpaceDuck: icons.js — SVG-иконки ============ */
(function () {
  'use strict';
  var SD = window.SD = window.SD || {};

  var STROKE = 1.8;

  function svg(inner) {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + inner + '</svg>';
  }

  var defs = {
    planet: svg('<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="' + STROKE + '"/><path d="M 3.5 12 a 8 4.2 0 0 0 17 0 M 3.5 12 a 8 4.2 0 0 1 17 0" fill="none" stroke="currentColor" stroke-width="' + STROKE + '"/>') + '<circle cx="9.6" cy="9.6" r="0.9" fill="currentColor"/>',
    star: svg('<path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.9 6.7 19.5l1.1-6L3.4 9.3l6-.8z" stroke="currentColor" stroke-width="1.2" fill="currentColor"/>'),
    rocket: svg('<path d="M12 2.5c3.2 2.4 5 5.6 5 9.5v3l3 3h-4l-1 2h-6l-1-2H4l3-3v-3c0-3.9 1.8-7.1 5-9.5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" transform="rotate(45 12 12)"/><circle cx="12" cy="12" r="1.9" fill="currentColor"/>'),
    flag: svg('<path d="M5 21V4" stroke="currentColor" stroke-width="' + STROKE + '" stroke-linecap="round"/><path d="M5 5h11l-2.5 3L16 11H5" fill="currentColor" stroke="currentColor" stroke-width="1"/>'),
    ruler: svg('<rect x="3" y="9" width="18" height="6.5" rx="1.5" transform="rotate(-20 12 12)" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6.2 12.4l1-2.6M10 12.6l1-2.6M13.8 12.8l1-2.6M17.6 13l1-2.6" stroke="currentColor" stroke-width="1.4"/>'),
    eye: svg('<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/>'),
    lock: svg('<rect x="5.5" y="10.5" width="13" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/>'),
    lockOpen: svg('<rect x="5.5" y="10.5" width="13" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 6.8-1.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/>'),
    heart: svg('<path d="M12 20.8 4.6 13.4a4.6 4.6 0 0 1 0-6.5 4.6 4.6 0 0 1 6.5 0l.9.9.9-.9a4.6 4.6 0 0 1 6.5 0 4.6 4.6 0 0 1 0 6.5z" fill="currentColor" stroke="currentColor" stroke-width="1"/>'),
    heartEmpty: svg('<path d="M12 20.8 4.6 13.4a4.6 4.6 0 0 1 0-6.5 4.6 4.6 0 0 1 6.5 0l.9.9.9-.9a4.6 4.6 0 0 1 6.5 0 4.6 4.6 0 0 1 0 6.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>'),
    pencil: svg('<path d="M4 20l1.2-4.2L16.8 4.2a1.7 1.7 0 0 1 2.4 0l.6.6a1.7 1.7 0 0 1 0 2.4L8.2 18.8z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M14.8 6.2l3 3" stroke="currentColor" stroke-width="1.7"/>'),
    trash: svg('<path d="M4.5 6.5h15M9.5 6V4.5h5V6M6.5 6.5l.8 13h9.4l.8-13M10 10v6M14 10v6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'),
    info: svg('<circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="8" r="1.2" fill="currentColor"/><path d="M12 11.5V17" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
    pause: svg('<rect x="6" y="5" width="4" height="14" rx="1.4" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.4" fill="currentColor"/>'),
    compass: svg('<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M15.4 8.6 13.8 13.8 8.6 15.4l1.6-5.2z" fill="currentColor"/>'),
    warn: svg('<path d="M12 3.5 22 20.5H2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 10v4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17" r="1.2" fill="currentColor"/>'),
    chevronLeft: svg('<path d="M14.5 4.5 7 12l7.5 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'),
    check: svg('<path d="M4.5 12.5l5 5 10-11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'),
    gear: svg('<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 2.5 12.9 5.4a7.4 7.4 0 0 1 3.7 2.1l3-0.6 1.4 2.6-2.3 1.9a7.5 7.5 0 0 1 0 4.3l2.3 1.9-1.4 2.6-3-0.6a7.4 7.4 0 0 1-3.7 2.1L12 24.5 11.1 21.6a7.4 7.4 0 0 1-3.7-2.1l-3 0.6-1.4-2.6 2.3-1.9a7.5 7.5 0 0 1 0-4.3L3 9.4l1.4-2.6 3 0.6a7.4 7.4 0 0 1 3.7-2.1z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>'),
    volume: svg('<path d="M4 9.5v5h3.5L12 18.5V5.5L7.5 9.5z" fill="currentColor"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
    plus: svg('<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'),
    close: svg('<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    home: svg('<path d="M4 11 12 4l8 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10.5V20h12v-9.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>'),
    trophy: svg('<path d="M8 3h8v3.5c0 3-1.6 5-4 5s-4-2-4-5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 5H4.5v1.5C4.5 9 6 11 8 11M16 5h3.5v1.5C19.5 9 18 11 16 11M12 11.5V16M8.5 20h7M9 16h6v4H9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'),
    shuttle: svg('<path d="M6 16 3 21h18l-3-5M7 16l1 3h8l1-3M8 13V5c0-1.4 1-2.5 4-2.5S16 3.6 16 5v8M8 15l2 2M16 15l-2 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'),
    sun: svg('<circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
    vortex: svg('<path d="M12 12m-3.5 0a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0M12 12m-7 0a7 7 0 1 0 14 0 7 7 0 1 0-14 0M12 12m-10.5 0c0 6 4 10.5 10.5 10.5S23 18 23 12 19.3 1.5 12 1.5 1.5 6 1.5 12" fill="none" stroke="currentColor" stroke-width="1.5"/>'),
    layers: svg('<path d="M12 3 3.5 7.5 12 12l8.5-4.5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M3.5 12.5 12 17l8.5-4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M3.5 16.5 12 21l8.5-4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'),
    scale: svg('<rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 8h18M7 4v4M7.5 12.5h.01M11 12.5h.01M14.5 12.5h.01M18 12.5h.01M7.5 16h.01M11 16h.01M14.5 16h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
    reset: svg('<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6L3.5 8.5M3.5 3.5v5h5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>'),
    lang: svg('<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 12h17M12 3c-2.8 2.4-3.9 5.5-3.9 9S9.2 18.6 12 21c2.8-2.4 3.9-5.5 3.9-9s-1.1-6.6-3.9-9z" fill="none" stroke="currentColor" stroke-width="1.5"/>'),
    arrowUp: svg('<path d="M12 5v14M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    arrowRight: svg('<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    play: svg('<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>'),
    copy: svg('<rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" stroke-width="1.7"/>'),
    bolt: svg('<path d="M13 2 4.8 13.4H11L9.6 22l8.2-11.4H11z" fill="currentColor" stroke="currentColor" stroke-width="1"/>'),
    globe: svg('<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3 12h18M12 3c-2.8 2.7-4 6-4 9s1.2 6.3 4 9c2.8-2.7 4-6 4-9s-1.2-6.3-4-9z" fill="none" stroke="currentColor" stroke-width="1.5"/>')
  };

  SD.icon = function (name, size) {
    var s = defs[name];
    if (!s || !size) return s || '';
    return s.replace(/ width="22" height="22"/, ' width="' + size + '" height="' + size + '"');
  };
  SD.iconNames = Object.keys(defs);
})();