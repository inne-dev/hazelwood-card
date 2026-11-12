const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const appSource = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const renderStart = appSource.indexOf('  function renderStatus(data) {');
const renderEnd = appSource.indexOf('\n  async function refreshStatus()', renderStart);
const refreshStart = renderEnd;
const refreshEnd = appSource.indexOf('\n  function makePresence(', refreshStart);
assert.notEqual(renderStart, -1, 'renderStatus must exist');
assert.notEqual(renderEnd, -1, 'refreshStatus must follow renderStatus');
assert.notEqual(refreshEnd, -1, 'makePresence must follow refreshStatus');
const renderSource = appSource.slice(renderStart, renderEnd).trim();
const refreshSource = appSource.slice(refreshStart, refreshEnd).trim();
const translations = {
  'hero.registeredPlayers': 'Зарегистрировано игроков: {count}',
  'hero.registeredPlayersEn': 'Registered players: {count}',
  'server.online': 'Online',
  'server.offlineMessage': 'Сервер сейчас недоступен.',
};

function translate(language, key, values = {}) {
  const template = key === 'hero.registeredPlayers' && language === 'en'
    ? translations['hero.registeredPlayersEn']
    : translations[key] || key;
  return template.replace(/\{(\w+)\}/g, (_match, name) => String(values[name] ?? ''));
}

function element() {
  const classes = new Set();
  return {
    hidden: false,
    children: [],
    attributes: {},
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name),
    },
    setAttribute(name, value) { this.attributes[name] = String(value); },
    addEventListener() {},
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
  };
}

function render(data, language = 'ru', includeRegisteredPlayers = true) {
  const selectors = [
    '#server-state', '#server-state-text', '#online-count', '#max-players',
    '#online-players', '.player-presence', '#status-error', '#presence-count',
    '#server-unavailable', '#registered-players',
  ];
  const nodes = new Map(selectors.map((selector) => [selector, element()]));
  if (!includeRegisteredPlayers) nodes.delete('#registered-players');
  const context = {
    state: { lastStatus: null, language },
    $: (selector) => nodes.get(selector),
    t: (key, values) => translate(language, key, values),
    onlinePlayerNodes: new Map(),
    localeTags: { ru: 'ru-RU', en: 'en-US' },
    el: (tag, className, text) => Object.assign(element(), { tagName: tag, className, textContent: text || '' }),
    Set,
    Map,
    Array,
    Number,
    encodeURIComponent,
  };
  vm.runInNewContext(`(${renderSource})`, context)(data);
  return { nodes, state: context.state };
}

test('unavailable server replaces counts and stale player list with offline message', () => {
  const { nodes, state } = render({
    available: false,
    online: false,
    onlineCount: 0,
    maxPlayers: 20,
    players: [{ username: 'OldPlayer' }],
  });
  const pill = nodes.get('#server-state');
  assert.equal(pill.classList.contains('status-offline'), true);
  assert.equal(pill.classList.contains('status-loading'), false);
  assert.equal(nodes.get('#presence-count').hidden, true);
  assert.equal(nodes.get('#server-unavailable').hidden, false);
  assert.equal(nodes.get('.player-presence').hidden, true);
  assert.equal(nodes.get('#online-players').children.length, 0);
  assert.equal(state.lastStatus.available, false);
});

test('available empty server still shows zero of maximum and no offline message', () => {
  const { nodes } = render({ available: true, online: false, onlineCount: 0, maxPlayers: 20, players: [], registeredPlayers: 0 });
  assert.equal(nodes.get('#server-state').classList.contains('status-online'), true);
  assert.equal(nodes.get('#server-state-text').textContent, 'Online');
  assert.equal(nodes.get('#presence-count').hidden, false);
  assert.equal(nodes.get('#online-count').textContent, '0');
  assert.equal(nodes.get('#max-players').textContent, '20');
  assert.equal(nodes.get('#server-unavailable').hidden, true);
  assert.equal(nodes.get('#registered-players').hidden, false);
  assert.equal(nodes.get('#registered-players').textContent, 'Зарегистрировано игроков: 0');
});

test('missing registered count does not render false zero', () => {
  const { nodes } = render({ available: true, online: false, onlineCount: 0, maxPlayers: 20, players: [] });
  assert.equal(nodes.get('#registered-players').hidden, true);
});

test('registered count rendering is optional on app pages without hero', () => {
  assert.doesNotThrow(() => render({ available: true, onlineCount: 0, maxPlayers: 20, players: [] }, 'ru', false));
});

test('English registered count stays clear for one player', () => {
  const { nodes } = render({ available: true, onlineCount: 0, maxPlayers: 20, players: [], registeredPlayers: 1 }, 'en');
  assert.equal(nodes.get('#registered-players').textContent, 'Registered players: 1');
});

test('status request failure hides presence and tolerates missing status-error node', async () => {
  const nodes = new Map([
    ['#server-state', element()], ['#server-state-text', element()], ['#online-count', element()],
    ['#max-players', element()], ['#presence-count', element()], ['#server-unavailable', element()],
    ['.player-presence', element()], ['#online-players', element()], ['#status-error', undefined],
    ['#registered-players', Object.assign(element(), { hidden: false })],
  ]);
  const context = {
    state: { lastStatus: { available: true, registeredPlayers: 3 }, language: 'ru' },
    $: (selector) => nodes.get(selector),
    t: (key, values) => translate('ru', key, values),
    api: async () => { throw new Error('offline'); },
    document: { visibilityState: 'visible' },
    localeTags: { ru: 'ru-RU' },
    onlinePlayerNodes: new Map([['OldPlayer', element()]]),
    el: (tag, className, text) => Object.assign(element(), { tagName: tag, className, textContent: text || '' }),
    localizeError: (error) => error.message,
  };
  context.renderStatus = vm.runInNewContext(`(${renderSource})`, context);
  await vm.runInNewContext(`(${refreshSource})`, context)();
  assert.equal(nodes.get('#server-state').classList.contains('status-offline'), true);
  assert.equal(nodes.get('#presence-count').hidden, true);
  assert.equal(nodes.get('#server-unavailable').hidden, false);
  assert.equal(nodes.get('.player-presence').hidden, true);
  assert.equal(nodes.get('#online-players').children.length, 0);
  assert.equal(nodes.get('#registered-players').textContent, 'Зарегистрировано игроков: 3');
  assert.equal(nodes.get('#registered-players').hidden, false);
  assert.equal(context.state.lastStatus.available, false);
});
