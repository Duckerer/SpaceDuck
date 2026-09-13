/* ============ SpaceDuck: main.js ============ */
(function () {
  'use strict';
  var SD = window.SD;

  function boot() {
    SD.store.load();
    SD.engine.init(document.getElementById('cv'));
    SD.ui.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();