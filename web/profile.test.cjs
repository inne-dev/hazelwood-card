const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, 'profile.js'), 'utf8');

function sourceFunction(start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  assert.notEqual(from, -1, `Missing function: ${start}`);
  assert.notEqual(to, -1, `Missing following declaration: ${end}`);
  return source.slice(from, to).trim();
}

function makeSkinRenderer(height = 64, model = 'classic') {
  const calls = [];
  class SyntheticImage {
    constructor() {
      this.naturalWidth = 64;
      this.naturalHeight = height;
    }
    set src(value) {
      this.url = value;
      this.onload();
    }
    pixelAt(x, y) { return `${x}:${y}`; }
  }
  const stack = [];
  const context = {
    imageSmoothingEnabled: true,
    mirrored: false,
    save() { stack.push(this.mirrored); },
    restore() { this.mirrored = stack.pop(); },
    translate() {},
    scale(x) { if (x === -1) this.mirrored = true; },
    drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) {
      calls.push({ source: [sx, sy, sw, sh], destination: [dx, dy, dw, dh], pixel: image.pixelAt(sx, sy), mirrored: this.mirrored });
    },
  };
  const canvas = {
    width: 0,
    height: 0,
    classes: new Set(),
    classList: {
      add(name) { canvas.classes.add(name); },
      remove(name) { canvas.classes.delete(name); },
    },
    getContext() { return context; },
  };
  const render = vm.runInNewContext(`(${sourceFunction('function renderSkin(', '\n  function safeSkinURL')})`, { Image: SyntheticImage });
  render(canvas, '/api/synthetic-skin.png', model);
  return { canvas, calls, render, SyntheticImage };
}

test('synthetic atlas keeps each front/back skin face on its correct, unclipped limb', () => {
  const { canvas, calls } = makeSkinRenderer();
  const call = (sourceRect, destX, destY) => calls.find((item) =>
    item.source.join(',') === sourceRect.join(',') && item.destination[0] === destX && item.destination[1] === destY);

  assert.deepEqual([canvas.width, canvas.height], [200, 128]);
  assert.ok(call([8, 8, 8, 8], 40, 0), 'front head uses its own UV');
  assert.ok(call([24, 8, 8, 8], 144, 0), 'back head uses its own UV');
  assert.ok(call([20, 20, 8, 12], 40, 32), 'front torso is not replaced by leg texture');
  assert.ok(call([32, 20, 8, 12], 144, 32), 'back torso uses back UV');
  assert.ok(call([44, 20, 4, 12], 72, 32), 'front right arm uses right-arm UV');
  assert.ok(call([36, 52, 4, 12], 24, 32), 'front left arm uses left-arm UV');
  assert.ok(call([52, 20, 4, 12], 176, 32), 'back right arm uses back UV');
  assert.ok(call([44, 52, 4, 12], 128, 32), 'back left arm uses back UV');
  assert.ok(call([4, 20, 4, 12], 40, 80), 'front right leg uses right-leg UV');
  assert.ok(call([20, 52, 4, 12], 56, 80), 'front left leg uses left-leg UV');
  assert.ok(call([12, 20, 4, 12], 144, 80), 'back right leg uses back UV');
  assert.ok(call([28, 52, 4, 12], 160, 80), 'back left leg uses back UV');
  assert.equal(new Set(calls.slice(0, 12).map((item) => item.pixel)).size, 12, 'synthetic atlas gives distinct colors to the 12 base faces');
  assert.ok(calls.every(({ destination: [x, y, width, height] }) => x >= 0 && y >= 0 && x + width <= canvas.width && y + height <= canvas.height), 'no face is clipped');
});

test('guide command groups start collapsed and search does not open them', () => {
  const makeNode = (tagName, className = '', textContent = '') => ({
    tagName, className, textContent, children: [], attributes: {},
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
    setAttribute(name, value) { this.attributes[name] = String(value); },
  });
  const state = { guideQuery: '', language: 'ru' };
  const guideCommandCatalog = [
    { type: 'server', group: 'chat', trigger: '/msg <player>', aliases: [], title: 'Private message', description: 'Send a message' },
    { type: 'client', group: 'clientKeys', trigger: 'V', aliases: [], title: 'Voice chat', description: 'Open voice chat' },
  ];
  const renderGuideCatalog = vm.runInNewContext(`(() => {
    ${sourceFunction('function guideGroupLabel(', '\n  function renderGuideConnection')}
    return renderGuideCatalog;
  })()`, {
    state,
    guideCommandCatalog,
    tr: (key) => key,
    el: makeNode,
    document: { createTextNode: (textContent) => makeNode('#text', '', textContent) },
  });
  const results = makeNode('div');
  const renderGroups = () => results.children.flatMap((section) => section.children.filter((child) => child.tagName === 'details'));

  renderGuideCatalog(results);
  let groups = renderGroups();
  assert.equal(groups.length, 2);
  assert.ok(groups.every((group) => !group.attributes.open), 'details omit open so native disclosures start closed');
  assert.ok(groups.every((group) => group.children[0].tagName === 'summary'));

  state.guideQuery = 'private message';
  renderGuideCatalog(results);
  groups = renderGroups();
  assert.equal(groups.length, 1, 'search keeps only matching command groups');
  assert.ok(!groups[0].attributes.open, 'filtered groups still require the user to open them');
});

test('New Year guide commands follow Moscow season dates and localize in Russian and English', () => {
  const makeNode = (tagName, className = '', textContent = '') => ({
    tagName, className, textContent, children: [], attributes: {},
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
    setAttribute(name, value) { this.attributes[name] = String(value); },
  });
  const catalog = [
    { type: 'server', group: 'holiday', season: 'holiday', trigger: '/present create <player>', title: 'guidePresentCreateTitle', description: 'guidePresentCreateDescription' },
    { type: 'server', group: 'holiday', season: 'holiday', trigger: '/axcalendar', title: 'guideAxcalendarTitle', description: 'guideAxcalendarDescription' },
  ];
  const labels = {
    ru: {
      guideGroupHoliday: 'Новый год', guideNoCommandMatches: 'Команды не найдены.',
      guidePresentCreateTitle: 'Создать подарок',
      guidePresentCreateDescription: 'Подготовь подарок игроку с 1 декабря. Открыть его можно с 1 января.',
      guideAxcalendarTitle: 'Календарь событий', guideAxcalendarDescription: 'Открой календарь и забери доступные награды.',
    },
    en: {
      guideGroupHoliday: 'New Year', guideNoCommandMatches: 'No commands found.',
      guidePresentCreateTitle: 'Create a gift',
      guidePresentCreateDescription: 'Prepare a player gift from December 1. It can be opened starting January 1.',
      guideAxcalendarTitle: 'Event calendar', guideAxcalendarDescription: 'Open the calendar and claim available rewards.',
    },
  };
  const context = {
    state: { guideQuery: '', language: 'ru' },
    guideCommandCatalog: catalog,
    tr: (key) => labels[context.state.language][key] || key,
    el: makeNode,
    document: { createTextNode: (textContent) => makeNode('#text', '', textContent) },
  };
  const helpers = vm.runInNewContext(`(() => {
    ${sourceFunction('function guideDateParts(', '\n  function renderGuideConnection')}
    return { renderGuideCatalog, isHolidayGuideSeason, isChristmasGuideDecorationSeason };
  })()`, context);
  const render = (date) => {
    const results = makeNode('div');
    helpers.renderGuideCatalog(results, new Date(date));
    return results;
  };
  const groupFor = (results) => results.children[0]?.children.find((node) => node.tagName === 'details');

  assert.equal(groupFor(render('2026-11-30T20:59:59.999Z')), undefined, 'hidden before Dec 1 in Moscow');

  const dec1 = render('2026-11-30T21:00:00.000Z');
  const dec1Group = groupFor(dec1);
  assert.equal(dec1Group.className, 'guide-command-group guide-command-group-holiday');
  assert.equal(dec1Group.children[0].children[0].textContent, 'Новый год');
  assert.equal(dec1Group.attributes.open, undefined, 'holiday group starts collapsed');
  assert.equal(dec1Group.children[1].children[0].children[0].children[0].textContent, '/present create <игрок>');
  assert.equal(dec1Group.children[1].children[0].children[1].children[0].textContent, labels.ru.guidePresentCreateTitle);
  assert.equal(dec1Group.children[1].children[0].children[1].children[1].textContent, labels.ru.guidePresentCreateDescription);

  const dec13 = groupFor(render('2026-12-13T20:59:59.999Z'));
  assert.equal(dec13.className, 'guide-command-group guide-command-group-holiday', 'decoration starts Dec 14');

  context.state.language = 'en';
  const christmasStart = groupFor(render('2026-12-13T21:00:00.000Z'));
  assert.equal(christmasStart.className, 'guide-command-group guide-command-group-holiday is-christmas');
  assert.equal(christmasStart.children[0].children[0].textContent, 'New Year');
  assert.equal(christmasStart.children[0].children[0].children[0].className, 'guide-command-holiday-snow');
  assert.equal(christmasStart.children[1].children[0].children[0].children[0].textContent, '/present create <player>');
  assert.equal(christmasStart.children[1].children[0].children[1].children[0].textContent, labels.en.guidePresentCreateTitle);
  assert.equal(christmasStart.children[1].children[0].children[1].children[1].textContent, labels.en.guidePresentCreateDescription);
  assert.equal(christmasStart.children[1].children[1].children[1].children[0].textContent, labels.en.guideAxcalendarTitle);

  assert.match(groupFor(render('2027-01-07T20:59:59.999Z')).className, /is-christmas/, 'Jan 7 remains decorated');
  assert.equal(groupFor(render('2027-01-07T21:00:00.000Z')), undefined, 'hidden from Jan 8 in Moscow');
});

test('legacy 64×32 skins mirror the right limbs and retain the hat layer', () => {
  const { canvas, calls } = makeSkinRenderer(32);
  const mirroredLeftArm = calls.find((item) => item.source.join(',') === '44,20,4,12' && item.destination[0] === 24);
  const mirroredLeftLeg = calls.find((item) => item.source.join(',') === '4,20,4,12' && item.destination[0] === 56);
  assert.equal(mirroredLeftArm?.mirrored, true);
  assert.equal(mirroredLeftLeg?.mirrored, true);
  assert.ok(calls.some((item) => item.source.join(',') === '40,8,8,8'), 'legacy hat/helmet layer is drawn');
  assert.ok(calls.every(({ source: [, y, , height] }) => y + height <= 32), 'legacy rendering stays inside the old texture');
});

test('slim skin UVs use three-pixel arms without clipping', () => {
  const { canvas, calls } = makeSkinRenderer(64, 'slim');
  const arm = calls.find((item) => item.source.join(',') === '44,20,3,12' && item.destination[0] === 72);
  const backArm = calls.find((item) => item.source.join(',') === '51,20,3,12' && item.destination[0] === 176);
  const leftArm = calls.find((item) => item.source.join(',') === '36,52,3,12' && item.destination[0] === 24);
  assert.equal(arm?.destination[2], 12);
  assert.equal(backArm?.destination[2], 12);
  assert.equal(leftArm?.destination[2], 12);
  assert.ok(calls.every(({ destination: [x, y, width, height] }) => x >= 0 && y >= 0 && x + width <= canvas.width && y + height <= canvas.height));
});

test('advancement icon paths follow namespaced IDs and reject unsafe paths', () => {
  const advancementIconPath = vm.runInNewContext(
    `(${sourceFunction('function advancementIconPath(', '\n  function drawAchievementList')})`,
  );

  assert.equal(advancementIconPath('minecraft:story/mine_stone'), '/assets/advancements/minecraft/story/mine_stone.png');
  assert.equal(advancementIconPath('hazelwood:season/winter/found_snow'), '/assets/advancements/hazelwood/season/winter/found_snow.png');
  for (const id of [null, undefined, '', 'story/mine_stone', 'minecraft:/mine_stone', 'minecraft:story//mine_stone', '..:outside', '.:outside', 'minecraft:../outside', 'minecraft:story/../../outside', 'minecraft:story\\mine_stone']) {
    assert.equal(advancementIconPath(id), null, `unsafe advancement ID should not create a path: ${id}`);
  }
});

test('vanilla advancement icon assets cover every mapped advancement', () => {
  const iconRoot = path.join(__dirname, 'assets', 'advancements');
  const manifest = JSON.parse(fs.readFileSync(path.join(iconRoot, 'manifest.json'), 'utf8'));
  const ids = new Set();
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  assert.ok(manifest.length > 0, 'the icon manifest should not be empty');
  for (const entry of manifest) {
    assert.match(entry.id, /^[a-z0-9_.-]+:[a-z0-9/._-]+$/);
    assert.ok(!ids.has(entry.id), `duplicate advancement icon: ${entry.id}`);
    ids.add(entry.id);
    const [namespace, advancementPath] = entry.id.split(':');
    assert.ok(advancementPath.split('/').every((segment) => segment && segment !== '.' && segment !== '..'));
    const expectedAsset = path.posix.join('assets/advancements', namespace, `${advancementPath}.png`);
    assert.equal(entry.asset, expectedAsset, `manifest path should match ${entry.id}`);
    const image = fs.readFileSync(path.join(__dirname, expectedAsset));
    assert.ok(image.subarray(0, pngSignature.length).equals(pngSignature), `invalid PNG for ${entry.id}`);
  }
});

test('achievements show earned entries first, player completion rates, and mark rates below 10% as rare', () => {
  const makeNode = (tagName, className = '', textContent = '') => ({
    tagName, className, textContent, children: [], attributes: {}, handlers: {},
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
    setAttribute(name, value) { this.attributes[name] = String(value); },
    addEventListener(name, callback) { this.handlers[name] = callback; },
    remove() { this.removed = true; },
  });
  const messages = {
    achieved: 'Получено', notAchieved: 'Не получено', unknownStatus: 'Нет данных о статусе',
    achievementRate: 'Получили: {percent}', achievementRateUnavailable: 'Нет статистики',
    rareAchievement: 'Редкое достижение', event: 'Событие', noPlayers: 'Нет игроков', showMore: 'Показать ещё',
    earned: 'Получили', missing: 'Ещё не получили',
  };
  const tr = (key, values = {}) => Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, value),
    messages[key] || key,
  );
  const state = {
    language: 'ru', filter: 'all', query: '', achievementsVisible: 25,
    details: { advancements: [
      { id: 'minecraft:adventure/adventuring_time', title: 'Adventuring Time', description: 'Discover every biome', done: true, earnedBy: ['A'], missingBy: ['B'] },
      { id: 'common_missing', title: 'Common missing', done: false, earnedBy: ['A', 'B', 'C'], missingBy: ['D'] },
      { id: 'ten_percent', title: 'Ten percent', done: true, earnedBy: ['A', 'B'], missingBy: Array(18).fill('player') },
      { id: 'rare_earned', title: 'Rare earned', done: true, earnedBy: ['A'], missingBy: Array(19).fill('player') },
      { id: 'unknown', title: 'Unknown', done: null, earnedBy: [], missingBy: [] },
    ] },
  };
  const achievementTranslations = {
    ru: { 'minecraft:adventure/adventuring_time': { title: 'Время приключений', description: 'Исследуйте каждый биом' } },
    en: { 'minecraft:adventure/adventuring_time': { title: 'Adventuring Time', description: 'Discover every biome' } },
  };
  const localize = vm.runInNewContext(`(${sourceFunction('function localizedAchievement(', '\n  function advancementIconPath')})`, {
    state, window: { hazelwoodAdvancementTranslations: achievementTranslations },
  });
  const completion = vm.runInNewContext(`(${sourceFunction('function achievementCompletion(', '\n  function localizedAchievement')})`, { state });
  const advancementIconPath = vm.runInNewContext(`(${sourceFunction('function advancementIconPath(', '\n  function drawAchievementList')})`);
  const draw = vm.runInNewContext(`(${sourceFunction('function drawAchievementList(', '\n  function renderHistory')})`, {
    state, achievementCompletion: completion, localizedAchievement: localize, advancementIconPath, el: makeNode, tr,
    nameList: () => makeNode('ul'), formattedDate: () => '',
  });
  const list = makeNode('div');
  draw(list);

  const rows = list.children;
  const titleCopyAt = (row) => row.children[0].children[0].children.find((child) => child.className === 'profile-achievement-copy');
  const titleAt = (row) => titleCopyAt(row).children[0].textContent;
  const statusAt = (row) => row.children[0].children[1].children[0].textContent;
  const rateAt = (row) => row.children[0].children[1].children[1];
  assert.deepEqual(rows.map(titleAt), ['Время приключений', 'Ten percent', 'Rare earned', 'Common missing', 'Unknown']);
  assert.equal(titleCopyAt(rows[0]).children[1].textContent, 'Исследуйте каждый биом');
  const icon = rows[0].children[0].children[0].children[0];
  assert.equal(icon.tagName, 'img');
  assert.equal(icon.className, 'profile-achievement-icon');
  assert.equal(icon.attributes.src, '/assets/advancements/minecraft/adventure/adventuring_time.png');
  assert.equal(icon.attributes.alt, '', 'icon is decorative because the achievement title provides its meaning');
  assert.equal(icon.attributes['aria-hidden'], 'true');
  assert.equal(icon.attributes.loading, 'lazy');
  assert.equal(icon.attributes.decoding, 'async');
  assert.equal(typeof icon.handlers.error, 'function', 'missing assets get an error handler');
  icon.handlers.error();
  assert.equal(icon.removed, true, 'missing icon is removed from the row');
  assert.equal(rows[1].children[0].children[0].children.some((child) => child.tagName === 'img'), false, 'invalid IDs render without an icon');
  assert.equal(statusAt(rows[3]), 'Не получено');
  assert.equal(rows[1].className, 'profile-achievement', 'exactly 10% is not rare');
  assert.equal(rows[2].className, 'profile-achievement is-rare');
  assert.match(rateAt(rows[2]).textContent, /★★★.*5/);
  assert.equal(rateAt(rows[2]).attributes['aria-label'], 'Редкое достижение: Получили: 5 %');
  assert.equal(rateAt(rows[4]).textContent, 'Нет статистики');
  assert.equal(rows[0].children[1].children.length, 1, 'expanded comparison only lists players who earned achievement');
  assert.equal(rows[0].children[1].children[0].children[0].textContent, 'Получили');

  state.query = 'Discover every biome';
  draw(list);
  assert.deepEqual(list.children.map(titleAt), ['Время приключений'], 'English search still finds a translated achievement');
  state.query = '';
  state.language = 'en';
  draw(list);
  assert.equal(titleAt(list.children[0]), 'Adventuring Time');
});

test('achievements open on the earned filter and keep every filter selectable', () => {
  const stateMatch = source.match(/^  const state = (\{.*\});$/m);
  assert.ok(stateMatch, 'profile state initializer is present');
  const state = vm.runInNewContext(`(${stateMatch[1]})`, {
    document: { documentElement: { lang: 'en' } },
    PRISM_DOWNLOADS: {},
  });
  state.details = { advancements: [] };

  const makeNode = (tagName, className = '', textContent = '') => ({
    tagName, className, textContent, children: [], attributes: {}, handlers: {},
    append(...children) { this.children.push(...children); },
    setAttribute(name, value) { this.attributes[name] = String(value); },
    addEventListener(name, callback) { this.handlers[name] = callback; },
    querySelectorAll(selector) { return selector === 'button' ? this.children.filter((child) => child.tagName === 'button') : []; },
  });
  const renderedFilters = [];
  const render = vm.runInNewContext(`(${sourceFunction('function renderAchievements()', '\n  function achievementCompletion')})`, {
    state,
    el: makeNode,
    tr: (key) => key,
    drawAchievementList: () => renderedFilters.push(state.filter),
  });

  const panel = render();
  const filters = panel.children[1].children[1].children[1];
  const buttons = filters.children;
  assert.deepEqual(buttons.map((button) => button.attributes['aria-pressed']), ['false', 'true', 'false']);
  assert.deepEqual(renderedFilters, ['earned']);

  buttons[0].handlers.click();
  assert.equal(state.filter, 'all');
  assert.deepEqual(buttons.map((button) => button.attributes['aria-pressed']), ['true', 'false', 'false']);
  buttons[2].handlers.click();
  assert.equal(state.filter, 'missing');
  assert.deepEqual(buttons.map((button) => button.attributes['aria-pressed']), ['false', 'false', 'true']);
  assert.deepEqual(renderedFilters, ['earned', 'all', 'missing']);
});

test('history renders one localized gameplay summary with time, deaths, worlds, and achievements', () => {
  const makeNode = (tagName, className = '', textContent = '') => ({
    tagName, className, textContent, children: [], attributes: {},
    get childNodes() { return this.children; },
    append(...children) { this.children.push(...children); },
    setAttribute(name, value) { this.attributes[name] = String(value); },
  });
  const labels = {
    history: 'История', noHistory: 'Записей пока нет.', gameplaySession: 'Игровая сессия',
    duration: 'Длительность', deaths: 'Смерти', dimensions: 'Время по мирам',
    overworld: 'Обычный мир', nether: 'Незер', end: 'Энд', achievements: 'Достижения',
  };
  const state = { details: {
    history: [
      { type: 'gameplay_session', at: '2026-10-12T13:05:00Z', durationSeconds: 300, deaths: 0, dimensions: { overworld: 180, nether: 120 }, advancements: ['minecraft:story/root'] },
      { type: 'session_started', at: '2026-10-12T13:00:00Z' },
    ],
    advancements: [{ id: 'minecraft:story/root', title: 'Taking Inventory' }],
  } };
  const render = vm.runInNewContext(`(${sourceFunction('function renderHistory()', '\n  function renderDashboard')})`, {
    state,
    el: makeNode,
    tr: (key) => labels[key] || key,
    formattedDate: (value) => value,
    formattedDuration: (seconds) => `${seconds}s`,
    formatNumber: String,
    localizedAchievement: (item) => ({ ...item, title: 'Инвентарь открыт' }),
  });
  const panel = render();
  const list = panel.children[1].children[0];
  assert.equal(panel.children[0].children[1].textContent, '1', 'count only displayed session summaries');
  assert.equal(list.children.length, 1, 'separate login markers are hidden');
  const item = list.children[0];
  assert.equal(item.children[0].textContent, 'Игровая сессия');
  assert.equal(item.children[2].children[0].textContent, 'Длительность: 300s');
  assert.equal(item.children[2].children[1].textContent, 'Смерти: 0');
  assert.equal(item.children[3].textContent, 'Время по мирам: Обычный мир: 180s · Незер: 120s');
  assert.equal(item.children[4].textContent, 'Достижения: Инвентарь открыт');
});

test('profile loads localized vanilla advancement names and descriptions', () => {
  const sandbox = { window: {} };
  const translationsSource = fs.readFileSync(path.join(__dirname, 'advancement-translations.js'), 'utf8');
  vm.runInNewContext(translationsSource, sandbox);
  const translations = sandbox.window.hazelwoodAdvancementTranslations;
  const id = 'minecraft:adventure/adventuring_time';

  assert.equal(translations.en[id].title, 'Adventuring Time');
  assert.equal(translations.en[id].description, 'Discover every biome');
  assert.equal(translations.ru[id].title, 'Время приключений');
  assert.equal(translations.ru[id].description, 'Найдите все биомы');
  assert.equal(translations.uk[id].title, 'Час пригод');
  assert.ok(Object.values(translations).every((locale) => Object.keys(locale).length === 126));

  const index = fs.readFileSync(path.join(__dirname, 'app/index.html'), 'utf8');
  const translationScriptAt = index.indexOf('/advancement-translations.js');
  const profileScriptAt = index.indexOf('/profile.js');
  assert.ok(translationScriptAt >= 0 && profileScriptAt > translationScriptAt, 'load translations before the profile script');
});

test('skin-by-username request is JSON while file upload leaves multipart headers to the browser', async () => {
  const requestSource = sourceFunction('async function submitSkinRequest(', '\n  async function pollSkinRequest');
  const requests = [];
  const context = {
    state: {},
    $: () => ({ disabled: false }),
    setSkinPending() {},
    setSkinMessage() {},
    tr: (key) => key,
    fetch: async (_url, options) => { requests.push(options); return { ok: true, json: async () => ({ requestId: 'request-1' }) }; },
    pollSkinRequest: async () => {},
  };
  const submit = vm.runInNewContext(`(${requestSource})`, context);
  await submit({}, JSON.stringify({ playerName: 'inne', model: 'classic' }));
  await submit({}, { isFormData: true });
  assert.equal(requests[0].headers['Content-Type'], 'application/json');
  assert.equal(requests[1].headers, undefined, 'multipart boundary must be supplied by fetch');
});

test('map iframe reloads after closing and opening the profile dialog again', () => {
  const sourceText = sourceFunction('function profileTop()', '\n  function profileLoading');
  const handlers = new Map();
  const makeNode = (extra = {}) => ({ dataset: {}, attributes: {}, textContent: '', hidden: false, ...extra,
    setAttribute(name, value) { this.attributes[name] = String(value); },
    removeAttribute(name) { if (name === 'src') this.src = ''; delete this.attributes[name]; },
    addEventListener(name, callback) { handlers.set(this, { ...(handlers.get(this) || {}), [name]: callback }); },
  });
  const dialog = makeNode({ showModal() { this.open = true; }, close() { this.open = false; handlers.get(this)?.close?.(); } });
  const frame = makeNode({ src: '' });
  const open = makeNode();
  const close = makeNode();
  const nodes = new Map([
    ['#profile-title', makeNode()], ['#profile-back-link', makeNode()],
    ['#profile-map-open', open], ['#profile-map-dialog', dialog], ['#profile-map-frame', frame],
    ['#profile-map-close', close], ['#profile-map-title', makeNode()],
  ]);
  const run = vm.runInNewContext(`(${sourceText})`, {
    state: { isOwn: true, target: 'inne' },
    $: (selector) => nodes.get(selector),
    tr: (key) => key,
  });
  run();
  handlers.get(open).click();
  assert.equal(frame.src, '/map/');
  dialog.close();
  assert.equal(frame.src, '');
  handlers.get(open).click();
  assert.equal(frame.src, '/map/');
});

test('profile head URL changes when the player skin revision changes', () => {
  const makeNode = (tagName, className = '', textContent = '') => ({
    tagName, className, textContent, children: [], handlers: {}, attributes: {},
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
    setAttribute(name, value) { this.attributes[name] = String(value); },
    addEventListener(name, callback) { this.handlers[name] = callback; },
  });
  const root = makeNode('section');
  const document = { title: '', createTextNode: (textContent) => makeNode('#text', '', textContent) };
  const renderMemberCard = vm.runInNewContext(
    `(${sourceFunction('function renderMemberCard(', '\n  function statTile')})`,
    { state: { isOwn: true, target: 'Alice', language: 'en' }, $: () => root, document, el: makeNode, tr: (key) => key },
  );
  const image = () => {
    const visit = (node) => {
      if (node.tagName === 'img' && node.className === 'profile-avatar-head') return node;
      for (const child of node.children || []) {
        const found = visit(child);
        if (found) return found;
      }
      return null;
    };
    return visit(root);
  };

  renderMemberCard({ username: 'Alice', skin: { headVersion: 'texture-revision-one' } });
  assert.equal(image().src, '/api/players/Alice/head.png?v=texture-revision-one');
  renderMemberCard({ username: 'Alice', skin: { headVersion: 'texture-revision-two' } });
  assert.equal(image().src, '/api/players/Alice/head.png?v=texture-revision-two');
});

test('Guide downloads accept only the supplied Prism Launcher HTTPS assets', () => {
  const urls = {
    linux: 'https://github.com/Diegiwg/PrismLauncher-Cracked/releases/download/11.0.3/PrismLauncher-Linux-x86_64.AppImage',
    macos: 'https://github.com/Diegiwg/PrismLauncher-Cracked/releases/download/11.0.3/PrismLauncher-macOS-11.0.3.dmg',
    windows: 'https://github.com/Diegiwg/PrismLauncher-Cracked/releases/download/11.0.3/PrismLauncher-Windows-MSVC-Setup-11.0.3.exe',
  };
  const safeDownload = vm.runInNewContext(`(${sourceFunction('function safeDownload(', '\n  function guideDateParts')})`, {
    URL,
    SAFE_DOWNLOAD_URLS: new Set(Object.values(urls)),
  });

  for (const url of Object.values(urls)) assert.equal(safeDownload(url), url);
  assert.equal(safeDownload('http://github.com/Diegiwg/PrismLauncher-Cracked/releases/download/11.0.3/file.exe'), '');
  assert.equal(safeDownload('https://example.com/PrismLauncher.exe'), '');
  assert.equal(safeDownload(`${urls.linux}?mirror=untrusted`), '');
  assert.equal(safeDownload('javascript:alert(1)'), '');
});

test('Guide renders fixed downloads, setup steps, and keeps address copying', async () => {
  const urls = {
    linux: 'https://github.com/Diegiwg/PrismLauncher-Cracked/releases/download/11.0.3/PrismLauncher-Linux-x86_64.AppImage',
    macos: 'https://github.com/Diegiwg/PrismLauncher-Cracked/releases/download/11.0.3/PrismLauncher-macOS-11.0.3.dmg',
    windows: 'https://github.com/Diegiwg/PrismLauncher-Cracked/releases/download/11.0.3/PrismLauncher-Windows-MSVC-Setup-11.0.3.exe',
  };
  const makeNode = (tagName, className = '', textContent = '') => ({
    tagName, className, textContent, children: [], handlers: {},
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
    addEventListener(name, callback) { this.handlers[name] = callback; },
  });
  let copiedAddress = '';
  const safeDownload = vm.runInNewContext(`(${sourceFunction('function safeDownload(', '\n  function guideDateParts')})`, {
    URL,
    SAFE_DOWNLOAD_URLS: new Set(Object.values(urls)),
  });
  const renderGuideConnection = vm.runInNewContext(`(${sourceFunction('function renderGuideConnection(', '\n  function activateGuideTab')})`, {
    PRISM_DOWNLOADS: urls,
    safeDownload,
    el: makeNode,
    sectionHeading: (textContent) => makeNode('h2', '', textContent),
    tr: (key) => ({
      linux: 'Linux', macos: 'macOS', windows: 'Windows', copied: 'Address copied.',
      installationTitle: '2. Import the configuration',
      installationStep: 'The configuration file to import in Prism Launcher will be available here later.',
      connectStep: 'If Hazelwood is missing from Multiplayer, choose Add Server.',
      serverNameNote: 'Choose any server name, enter the address above, save, and connect.',
    })[key] || key,
    navigator: { clipboard: { writeText: async (value) => { copiedAddress = value; } } },
  });

  const panel = makeNode('section');
  renderGuideConnection(panel, {
    address: 'hazelwood.inne.space',
    downloads: { linux: 'https://attacker.example/file.exe' },
  });
  const [downloadPanel, installPanel, connectPanel] = panel.children[0].children;
  const platforms = downloadPanel.children.find((child) => child.className === 'guide-downloads');
  assert.deepEqual(platforms.children.map(({ tagName, href }) => [tagName, href]), [
    ['a', urls.linux], ['a', urls.macos], ['a', urls.windows],
  ]);
  assert.equal(installPanel.children[1].textContent, 'The configuration file to import in Prism Launcher will be available here later.');

  const connectIntro = connectPanel.children[1];
  const connectRow = connectPanel.children[2];
  const address = connectRow.children[0];
  const copyButton = connectRow.children[1];
  assert.match(connectIntro.textContent, /Multiplayer.*Add Server/);
  assert.equal(address.textContent, 'hazelwood.inne.space');
  assert.match(connectRow.children[2].textContent, /any server name.*address above.*save.*connect/);
  await copyButton.handlers.click();
  assert.equal(copiedAddress, 'hazelwood.inne.space');
  assert.equal(copyButton.textContent, 'Address copied.');
});
