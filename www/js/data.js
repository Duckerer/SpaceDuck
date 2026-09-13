/* ============ SpaceDuck: data.js ============ */
(function () {
  'use strict';
  var SD = window.SD = window.SD || {};
  SD._lang = 'ru';

  SD.TEXT = {
    ru: {
      boot_hold: 'Зажми',
      m_play: 'Играть', m_ships: 'Корабли', m_ach: 'Достижения', m_settings: 'Настройки',
      m_ship: 'Корабль: {{name}}',
      w_title: 'Выбор космоса',
      w_small_n: 'Маленький', w_small_d: 'Много планет рядом, всё близко и быстро.',
      w_med_n: 'Средний', w_med_d: 'Сбалансированный космос — полёт подольше, объекты крупнее.',
      w_big_n: 'Большой', w_big_d: 'Огромные расстояния, редкие и гигантские объекты.',
      w_inf_n: 'Бесконечный', w_inf_d: 'Реальные звёзды, планеты и чёрные дыры + бесконечная генерация.',
      s_title: 'Настройки',
      s_lang: 'Язык', s_volume: 'Громкость звука', s_ui_scale: 'Размер интерфейса', s_reset: 'Сбросить статистику',
      s_reset_q: 'Точно удалить статистику и достижения?', s_reset_yes: 'Да, сбросить', s_reset_no: 'Отмена',
      sh_title: 'Корабли', sh_new: '+ Создать корабль',
      sh_edit: 'Корабль', sh_name: 'Название', sh_color: 'Цвет корпуса', sh_trail: 'Цвет шлейфа', sh_hull: 'Форма',
      sh_cancel: 'Отмена', sh_save: 'Сохранить', sh_close: 'Закрыть',
      sh_select: 'Выбрать', sh_editB: 'Правка', sh_del: 'Удалить', sh_tofav: 'В избранное',
      sh_del_q: 'Удалить корабль «{{name}}»?', sh_del_yes: 'Удалить', sh_selected: 'Выбран',
      sh_stats_km: 'Пролетел: {{km}}', sh_stats_planets: 'Объектов найдено: {{n}}', sh_stats_landed: 'Посадок: {{n}}',
      sh_stats_flags: 'Флажков: {{n}}', sh_stats_fav: 'В избранном', sh_stats_noplanets: 'Пока не найдено ни одного объекта.',
      sh_planets_found: 'Найденные объекты:',
      a_title: 'Достижения', a_unlocked: 'Открыто {{a}} из {{b}}',
      g_hint: 'Коснись и тяни джойстик — отпусти, чтобы лететь по инерции',
      g_landed: 'Ты приземлился! Нажми, чтобы взлететь',
      g_nearest: 'Ближайшее: {{name}} — {{dist}}',
      g_paused: 'Пауза', g_continue: 'Продолжить', g_exit: 'Выйти',
      g_auto_on: 'Автопилот вкл', g_auto_off: 'Автопилот выкл',
      g_hole_warn: 'ЧЁРНАЯ ДЫРА!',
      g_died: 'Тебя затянуло в чёрную дыру…',
      toast_ach: 'Достижение: {{name}}',
      ach: {}
    },
    en: {
      boot_hold: 'Hold',
      m_play: 'Play', m_ships: 'Ships', m_ach: 'Achievements', m_settings: 'Settings',
      m_ship: 'Ship: {{name}}',
      w_title: 'Choose the universe',
      w_small_n: 'Small', w_small_d: 'Pack of planets, everything is close and fast.',
      w_med_n: 'Medium', w_med_d: 'Balanced space — longer flights, bigger objects.',
      w_big_n: 'Large', w_big_d: 'Huge distances, giant and rare objects.',
      w_inf_n: 'Infinite', w_inf_d: 'Real stars, planets and black holes + endless generation.',
      s_title: 'Settings',
      s_lang: 'Language', s_volume: 'Sound volume', s_ui_scale: 'Interface size', s_reset: 'Reset statistics',
      s_reset_q: 'Really delete statistics and achievements?', s_reset_yes: 'Yes, reset', s_reset_no: 'Cancel',
      sh_title: 'Ships', sh_new: '+ Create ship',
      sh_edit: 'Ship', sh_name: 'Name', sh_color: 'Hull color', sh_trail: 'Trail color', sh_hull: 'Shape',
      sh_cancel: 'Cancel', sh_save: 'Save', sh_close: 'Close',
      sh_select: 'Select', sh_editB: 'Edit', sh_del: 'Delete', sh_tofav: 'Favorite',
      sh_del_q: 'Delete ship "{{name}}"?', sh_del_yes: 'Delete', sh_selected: 'Selected',
      sh_stats_km: 'Distance: {{km}}', sh_stats_planets: 'Objects found: {{n}}', sh_stats_landed: 'Landings: {{n}}',
      sh_stats_flags: 'Flags: {{n}}', sh_stats_fav: 'Favorite', sh_stats_noplanets: 'No objects found yet.',
      sh_planets_found: 'Discovered objects:',
      a_title: 'Achievements', a_unlocked: '{{a}} of {{b}} unlocked',
      g_hint: 'Touch and drag the joystick — release to coast',
      g_landed: 'Landed! Press to take off',
      g_nearest: 'Nearest: {{name}} — {{dist}}',
      g_paused: 'Paused', g_continue: 'Continue', g_exit: 'Exit',
      g_auto_on: 'Autopilot on', g_auto_off: 'Autopilot off',
      g_hole_warn: 'BLACK HOLE!',
      g_died: 'You were sucked into a black hole…',
      toast_ach: 'Achievement: {{name}}',
      ach: {}
    }
  };

  SD.ACH = [
    { id: 'a_start', icon: 'shuttle', ru: ['Первый полёт', 'Взлети с Земли'], en: ['First flight', 'Take off from Earth'] },
    { id: 'a_earth', icon: 'planet', ru: ['Возвращение домой', 'Приземлись на Землю после взлёта'], en: ['Coming home', 'Land back on Earth after takeoff'] },
    { id: 'a_land1', icon: 'flag', ru: ['Первая посадка', 'Приземлись на любой объект'], en: ['First landing', 'Land on any object'] },
    { id: 'a_discover', icon: 'eye', ru: ['Исследователь', 'Открой 10 разных объектов'], en: ['Explorer', 'Discover 10 different objects'] },
    { id: 'a_solar', icon: 'sun', ru: ['Эксперт Солнечной системы', 'Открой все 8 планет системы'], en: ['Solar expert', 'Discover all 8 Solar System planets'] },
    { id: 'a_colonist', icon: 'rocket', ru: ['Колонизатор', 'Приземлись на все 8 планет системы'], en: ['Colonizer', 'Land on all 8 Solar System planets'] },
    { id: 'a_star_land', icon: 'star', ru: ['Высадка на звезду', 'Приземлись на звезду'], en: ['Star landing', 'Land on a star'] },
    { id: 'a_hole_close', icon: 'vortex', ru: ['Край бездны', 'Приблизься к чёрной дыре и выживи'], en: ['Edge of the abyss', 'Approach a black hole and survive'] },
    { id: 'a_ton', icon: 'vortex', ru: ['TON 618', 'Залети в TON 618'], en: ['TON 618', 'Fly into TON 618'] },
    { id: 'a_dist10k', icon: 'ruler', ru: ['Космический странник', 'Пролети 10 000 км'], en: ['Space wanderer', 'Travel 10 000 km'] },
    { id: 'a_dist1m', icon: 'ruler', ru: ['Ветеран космоса', 'Пролети 1 000 000 км'], en: ['Space veteran', 'Travel 1 000 000 km'] },
    { id: 'a_auto', icon: 'compass', ru: ['Автопилот', 'Используй автопилот'], en: ['Autopilot', 'Use the autopilot'] },
    { id: 'a_flags5', icon: 'flag', ru: ['Следопыт', 'Установи 5 флажков'], en: ['Pathfinder', 'Plant 5 flags'] },
    { id: 'a_build', icon: 'gear', ru: ['Конструктор', 'Создай корабль'], en: ['Shipwright', 'Create a ship'] },
    { id: 'a_fav', icon: 'heart', ru: ['Фаворит', 'Добавь корабль в избранное'], en: ['Favorite', 'Mark a ship as favorite'] },
    { id: 'a_inf', icon: 'layers', ru: ['Бесконечность', 'Сыграй в бесконечном мире'], en: ['Infinity', 'Play in the infinite world'] },
    { id: 'a_discover5', icon: 'eye', ru: ['Первооткрыватель', 'Открой 5 разных объектов'], en: ['Discoverer', 'Discover 5 different objects'] },
    { id: 'a_dist100k', icon: 'ruler', ru: ['Дальний рейс', 'Пролети 100 000 км'], en: ['Long haul', 'Travel 100,000 km'] },
    { id: 'a_maxspd', icon: 'bolt', ru: ['Рекорд скорости', 'Разгонись до максимальной скорости'], en: ['Speed demon', 'Reach maximum speed'] },
    { id: 'a_land5', icon: 'globe', ru: ['Глобетроттер', 'Приземлись на 5 разных объектов'], en: ['Globetrotter', 'Land on 5 different objects'] },
    { id: 'a_star1', icon: 'star', ru: ['Звездочёт', 'Открой звезду (не Солнце)'], en: ['Star gazer', 'Discover a star (not the Sun)'] },
    { id: 'a_hole3', icon: 'vortex', ru: ['Испытатель бездны', 'Приблизься к 3 разным чёрным дырам и выживи'], en: ['Abyss diver', 'Approach 3 different black holes and survive'] }
  ];
  SD.ACH.forEach(function (a) {
    SD.TEXT.ru.ach['ach_' + a.id + '_t'] = a.ru[0]; SD.TEXT.ru.ach['ach_' + a.id + '_d'] = a.ru[1];
    SD.TEXT.en.ach['ach_' + a.id + '_t'] = a.en[0]; SD.TEXT.en.ach['ach_' + a.id + '_d'] = a.en[1];
  });

  SD.NAMED = {
    stars: [
      { id: 'sirius', ru: 'Сириус', en: 'Sirius' },
      { id: 'betelgeuse', ru: 'Бетельгейзе', en: 'Betelgeuse' },
      { id: 'rigel', ru: 'Ригель', en: 'Rigel' },
      { id: 'vega', ru: 'Вега', en: 'Vega' },
      { id: 'polaris', ru: 'Полярная звезда', en: 'Polaris' },
      { id: 'alphaCen', ru: 'Альфа Центавра', en: 'Alpha Centauri' },
      { id: 'proxima', ru: 'Проксима', en: 'Proxima Centauri' },
      { id: 'arcturus', ru: 'Арктур', en: 'Arcturus' },
      { id: 'antares', ru: 'Антарес', en: 'Antares' },
      { id: 'deneb', ru: 'Денеб', en: 'Deneb' },
      { id: 'canopus', ru: 'Канопус', en: 'Canopus' },
      { id: 'aldebaran', ru: 'Альдебаран', en: 'Aldebaran' }
    ],
    planets: [
      { id: 'proximaB', ru: 'Проксима Центавра b', en: 'Proxima Centauri b' },
      { id: 'kepler442', ru: 'Кеплер-442 b', en: 'Kepler-442 b' },
      { id: 'trappistE', ru: 'TRAPPIST-1 e', en: 'TRAPPIST-1 e' },
      { id: 'kepler22', ru: 'Кеплер-22 b', en: 'Kepler-22 b' },
      { id: 'gliese581c', ru: 'Глизе 581 c', en: 'Gliese 581 c' },
      { id: 'gliese667c', ru: 'Глизе 667 Cc', en: 'Gliese 667 Cc' },
      { id: 'kepler186', ru: 'Кеплер-186 f', en: 'Kepler-186 f' },
      { id: 'osiris', ru: 'Осирис (HD 209458 b)', en: 'Osiris (HD 209458 b)' },
      { id: 'tauCetE', ru: 'Тау Кита e', en: 'Tau Ceti e' },
      { id: 'kepler452', ru: 'Кеплер-452 b', en: 'Kepler-452 b' },
      { id: 'k218b', ru: 'K2-18 b', en: 'K2-18 b' },
      { id: 'wolf1061', ru: 'Вольф 1061 c', en: 'Wolf 1061 c' }
    ],
    holes: [
      { id: 'ton618', ru: 'TON 618', en: 'TON 618' },
      { id: 'sgra', ru: 'Стрелец A*', en: 'Sagittarius A*' },
      { id: 'm87', ru: 'M87*', en: 'M87*' },
      { id: 'cygx1', ru: 'Лебедь X-1', en: 'Cygnus X-1' },
      { id: 'gaia', ru: 'Gaia BH1', en: 'Gaia BH1' },
      { id: 'm31', ru: 'Ядро Андромеды', en: 'Andromeda core' }
    ]
  };

  SD.SOLAR = [
    { id: 'sol', type: 'star', ru: 'Солнце', en: 'Sun', r: 30000, d: 0 },
    { id: 'mercury', type: 'planet', ru: 'Меркурий', en: 'Mercury', r: 1600, d: 70000 },
    { id: 'venus', type: 'planet', ru: 'Венера', en: 'Venus', r: 3200, d: 140000 },
    { id: 'earth', type: 'planet', ru: 'Земля', en: 'Earth', r: 4000, d: 200000 },
    { id: 'mars', type: 'planet', ru: 'Марс', en: 'Mars', r: 2700, d: 300000 },
    { id: 'jupiter', type: 'planet', ru: 'Юпитер', en: 'Jupiter', r: 11000, d: 700000, ring: true },
    { id: 'saturn', type: 'planet', ru: 'Сатурн', en: 'Saturn', r: 9500, d: 1300000, ring: true },
    { id: 'uranus', type: 'planet', ru: 'Уран', en: 'Uranus', r: 7000, d: 2000000 },
    { id: 'neptune', type: 'planet', ru: 'Нептун', en: 'Neptune', r: 6800, d: 2600000 }
  ];

  SD.COLORS = {
    hull: ['#ffd53d', '#ff5a5a', '#54e37e', '#54c8ff', '#b47bff', '#ff9d5c', '#ff6ad5', '#c6d32e', '#5ef2e6', '#ffffff', '#ff7f3f', '#86a7ff'],
    trail: ['#ffd53d', '#ff5a5a', '#54e37e', '#54c8ff', '#b47bff', '#ff9d5c', '#ff6ad5', '#c6d32e', '#5ef2e6', '#8ab6ff', '#ff7f3f', '#9dff9d']
  };

  SD.WORLDS = [
    { id: 'small', cells: 6, density: 2.3, sizeM: 0.8 },
    { id: 'med', cells: 14, density: 1.5, sizeM: 1.0 },
    { id: 'big', cells: 26, density: 1.0, sizeM: 1.5 },
    { id: 'inf', cells: null, density: 0.85, sizeM: 1.6 }
  ];

  SD.CONST = {
    ZOOM: 0.0062,
    ZOOM_MIN: 0.0012,            /* мин. масштаб камеры (отдаление) */
    ZOOM_MAX: 0.05,              /* макс. масштаб камеры (приближение) */
    MAX_SPEED: 50000,          /* заметно быстрее — можно долететь до планет */
    THRUST: 14000,             /* ускорение джойстика */
    JOY_R: 72,                 /* радиус базы джойстика в px */
    LAND_SPEED: 2400,          /* скорость для посадки (выше, т.к. скорости большие) */
    AUTOPILOT_SPEED: 42000,
    CELL: 300000,
    TRAIL_MAX: 4000,
    GRAVITY: 260,
    HOLE_PULL: 8,
    HOLE_ACC: 5200
  };

  SD.mulberry = function (seed) {
    var a = seed >>> 0, t;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  SD.hash2d = function (x, y) {
    var h = (x * 374761393 + y * 668265263) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  };

  var SYL = ['Al', 'An', 'Ar', 'Bel', 'Bet', 'Bor', 'Ce', 'Cor', 'Den', 'El', 'Er', 'Ga', 'Iro', 'Kad', 'Ke', 'Kor', 'Lyr', 'Myr', 'Nub', 'Ord', 'Pella', 'Qua', 'Rho', 'Rube', 'Sel', 'Thal', 'Tor', 'Vel', 'Vyr', 'Wex', 'Xan', 'Yara', 'Zor', 'Zeth'];
  SD.genName = function (type, rng) {
    var a = SYL[(rng() * SYL.length) | 0];
    var b = SYL[(rng() * SYL.length) | 0];
    var base = a + b.toLowerCase();
    var num = 1 + ((rng() * 9000) | 0);
    if (type === 'hole') return base + '-X' + num;
    return base + '-' + num;
  };

  SD.formatKm = function (n) {
    var ru = SD._lang === 'ru';
    if (n < 1000) return Math.round(n) + (ru ? ' км' : ' km');
    if (n < 1e6) return (n / 1e3).toFixed(n < 1e4 ? 1 : 0) + (ru ? ' тыс. км' : ' K km');
    if (n < 1e9) return (n / 1e6).toFixed(2) + (ru ? ' млн км' : ' M km');
    return (n / 1e9).toFixed(2) + (ru ? ' млрд км' : ' B km');
  };

  SD.detectLang = function () {
    var nav = navigator.language || 'en';
    return /^ru/i.test(nav) ? 'ru' : 'en';
  };
  SD.t = function (key) {
    var dict = SD.TEXT[SD._lang] || SD.TEXT.ru;
    var d = dict[key];
    if (d === undefined && dict.ach && key.indexOf('ach_') === 0) d = dict.ach[key];
    if (d === undefined) {
      d = SD.TEXT.ru[key];
      if (d === undefined && SD.TEXT.ru.ach) d = SD.TEXT.ru.ach[key];
    }
    return d || key;
  };
  SD.fill = function (tpl, map) {
    return (tpl || '').replace(/\{\{(\w+)\}\}/g, function (_, k) { return (map && k in map) ? map[k] : ('' + (map ? map[k] : '')); });
  };
  SD.objName = function (o) {
    if (o.ru !== undefined) return SD._lang === 'ru' ? (o.ru || o.en) : (o.en || o.ru);
    return o.name;
  };
  SD.achName = function (id, part) {
    return SD.t('ach_' + id + (part === 'd' ? '_d' : '_t'));
  };
})();