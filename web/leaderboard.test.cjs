const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const appSource = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const renderStart = appSource.indexOf('  function renderLeaderboard(data) {');
const renderEnd = appSource.indexOf('\n  async function refreshLeaderboard()', renderStart);
assert.notEqual(renderStart, -1, 'renderLeaderboard must exist');
assert.notEqual(renderEnd, -1, 'refreshLeaderboard must follow renderLeaderboard');
const renderSource = appSource.slice(renderStart, renderEnd).trim();

function element(tagName = '') {
  return {
    tagName,
    children: [],
    attributes: {},
    hidden: false,
    textContent: '',
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
    setAttribute(name, value) { this.attributes[name] = String(value); },
  };
}

function render(players) {
  const nodes = new Map([
    ['#leaderboard-table-wrap', element('div')],
    ['#leaderboard-rows', element('tbody')],
    ['#leaderboard-state', element('p')],
  ]);
  const context = {
    state: { language: 'en', lastLeaderboard: null, leaderboardError: true },
    $: (selector) => nodes.get(selector),
    t: (key) => key === 'leaderboard.noData' ? 'No data' : key,
    showLeaderboardMessage: (key) => { nodes.get('#leaderboard-state').textContent = key; },
    formatLeaderboardPlaytime: (seconds) => `${seconds}s`,
    localeTags: { en: 'en-US' },
    el: (tagName, className = '', text = '') => Object.assign(element(tagName), { className, textContent: text }),
    Intl,
  };
  vm.runInNewContext(`(${renderSource})`, context)({ players });
  return nodes.get('#leaderboard-rows').children.map((row) => ({
    rank: row.children[0].textContent,
    username: row.children[1].children[0].children[0].textContent,
    playtime: row.children[2].textContent,
    advancements: row.children[3].textContent,
  }));
}

test('leaderboard ranks earned advancements first and leaves unknown counts unranked', () => {
  const rows = render([
    { username: 'Oak', advancementCount: 14, playSeconds: 7200 },
    { username: 'Birch', advancementCount: 14, playSeconds: 10800 },
    { username: 'Elm', advancementCount: 9, playSeconds: 3600 },
    { username: 'Cedar', advancementCount: 9, playSeconds: 9000 },
    { username: 'Fir', advancementCount: 8, playSeconds: 100000 },
    { username: 'Ash', advancementCount: null, playSeconds: 200000 },
    { username: 'Pine', playSeconds: 80000 },
  ]);

  assert.deepEqual(rows.map(({ username }) => username), ['Birch', 'Oak', 'Cedar', 'Elm', 'Fir', 'Ash', 'Pine']);
  assert.deepEqual(rows.map(({ rank }) => rank), ['1', '2', '3', '4', '5', '—', '—']);
  assert.equal(rows[0].advancements, '14');
  assert.equal(rows[5].advancements, '—');
  assert.equal(rows[6].advancements, '—');
});
