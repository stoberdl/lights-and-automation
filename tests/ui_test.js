/* =========================================================================
   UI tests. Loads the real index.html in jsdom against a FAKE lightd, so it
   runs offline, deterministically, and without touching a single bulb.

   The point of this file is the payload assertions. The bug that made every
   switch look broken was the page sending {"action":"power","value":"off"} -
   a non-empty string, which lightd reads as truthy and turns the light ON.
   Rendering tests would never have caught it; recording what the page puts on
   the wire does.

     node tests/ui_test.js
   ========================================================================= */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const HTML = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

/* ---------- results ---------- */
let pass = 0; const fails = [];
function ok(name, cond, extra){
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fails.push(name + (extra ? ' -- ' + extra : '')); console.log('  ✗ ' + name + (extra ? '  (' + extra + ')' : '')); }
}
const eq = (name, got, want) =>
  ok(name, JSON.stringify(got) === JSON.stringify(want),
     'got ' + JSON.stringify(got) + ', want ' + JSON.stringify(want));

/* ---------- the fake lightd ---------- */
// One device that obeys, one that is offline, one that returns 200 and then
// does nothing at all - the exact failure the dashboard has to catch.
const DEVICES = [
  { id:'AA:1', name:'Table Lamp',   sku:'H6022', virtual:false, transports:['cloud'],
    capabilities:['brightness','colorRgb','colorTemperatureK','lightScene','powerSwitch'],
    ranges:{colorTemperatureK:{min:2700,max:6500}}, scene_count:94 },
  { id:'AA:2', name:'Bathroom light 1', sku:'H6159', virtual:false, transports:['cloud'],
    capabilities:['brightness','powerSwitch'], ranges:{}, scene_count:0 },
  { id:'AA:3', name:'Stubborn Strip', sku:'H615C', virtual:false, transports:['bluetooth'],
    capabilities:['brightness','powerSwitch'], ranges:{}, scene_count:0 },
  { id:'AA:4', name:'Group Alias',   sku:'VIRT', virtual:true,  transports:['cloud'],
    capabilities:[], ranges:{}, scene_count:0 },
];
const world = {
  'Table Lamp':       { online:true,  power:true,  brightness:95, kelvin:3000, rgb:null },
  'Bathroom light 1': { online:false, power:null,  brightness:null, kelvin:null, rgb:null },
  'Stubborn Strip':   { online:true,  power:true,  brightness:50, kelvin:null, rgb:null, deaf:true },
};
const sent = [];            // every request the page made
let force = null;           // {status, body} to return from the next command

function applyCommand(name, body){
  const d = world[name];
  if (!d || d.online === false || d.deaf) return;   // accepted, changes nothing
  if (body.action === 'power')      d.power = !!body.value;
  if (body.action === 'brightness') d.brightness = Number(body.value);
  if (body.action === 'kelvin')     d.kelvin = Number(body.value);
}

const SCHEDULE = {
  current:{ band:'afternoon', theme:'reading', brightness:95 },
  hours: Array.from({length:24}, (_,h) => ({
    hour: String(h).padStart(2,'0')+':00', band:'afternoon', theme:'reading', brightness:95,
    lights_off: h >= 23 || h < 7 ? ['Bathroom light 1'] : [],
    devices: [{device:'Table Lamp', scene:'Sunrise'}],
  })),
};
const QUIET = { configured:true, active:false, from:'23:00', to:'07:00', max_brightness:5,
                kept_off:['Bathroom light 1'] };
const THEMES = { themes:[{id:'cozy',name:'Cozy',description:'warm'},
                         {id:'reading',name:'Reading',description:'bright'}] };
const AUTOS = { automations:[
  { id:'a1', name:'Time of day', status:'approved', enabled:true,
    trigger:{type:'cron',hour:'*',minute:0}, action:{type:'timeofday'},
    last_result:{summary:{ok:13,failed:0,skipped:5}} },
  { id:'a2', name:'Proposed thing', status:'pending', enabled:false,
    trigger:{type:'sun',event:'sunset',offset_min:-15}, action:{type:'theme',theme:'cozy'} },
], scheduled:[{id:'a1', next_run:'17:00'}] };

function respond(url, opts){
  const method = (opts && opts.method) || 'GET';
  let body = null;
  try { body = opts && opts.body ? JSON.parse(opts.body) : null; } catch(e){}
  const p = url.replace(/^https?:\/\/[^/]+/, '');
  sent.push({ method, path:p, body });

  const json = (status, obj) => ({
    status, ok: status >= 200 && status < 300,
    json: async () => obj, text: async () => JSON.stringify(obj),
  });

  if (p === '/api/config') return json(200, {lightd_url:'http://x', actor:'frontend:dashboard',
                                             beatsaber:true, claude:true, has_token:true});
  if (p === '/api/claude' || p === '/api/beatsaber') return json(200, {ok:true, detail:'stub'});

  const l = p.replace('/api/lightd','');
  if (l === '/manifest')       return json(200, {devices:DEVICES, counts:{}, notes:''});
  if (l === '/themes')         return json(200, THEMES);
  if (l === '/quiet')          return json(200, QUIET);
  if (l === '/schedule/today') return json(200, SCHEDULE);
  if (l === '/automations' && method === 'GET') return json(200, AUTOS);
  if (l === '/automations' && method === 'POST') return json(200, {id:'a3', status:'pending', owner_notified:true});

  let m = l.match(/^\/devices\/([^/]+)\/state$/);
  if (m){
    const name = decodeURIComponent(m[1]);
    const w = world[name];
    if (!w) return json(404, {detail:'no such device'});
    return json(200, {device:name, transport:'cloud',
      normalized:{online:w.online, power:w.power, brightness:w.brightness, kelvin:w.kelvin, rgb:w.rgb}});
  }
  m = l.match(/^\/devices\/([^/]+)\/command$/);
  if (m){
    if (force){ const f = force; force = null; return json(f.status, f.body); }
    applyCommand(decodeURIComponent(m[1]), body || {});
    return json(200, {ok:true, transport:'cloud'});
  }
  m = l.match(/^\/devices\/([^/]+)\/scenes$/);
  if (m) return json(200, {device:decodeURIComponent(m[1]),
                           scenes:[{name:'Sunrise'},{name:'Green Reign'},{name:'Fall'}]});

  if (l.startsWith('/themes/') && l.includes('/apply'))
    return json(200, {summary:{ok:2,failed:0,skipped:1,confirmed:1,unconfirmed:1},
                      verification:{unconfirmed:[{device:'Bathroom light 1'}]}});
  if (l.startsWith('/daycycle/apply'))
    return json(200, {summary:{ok:2,failed:0,skipped:1,confirmed:2,unconfirmed:0}, verification:{}});
  if (l.startsWith('/automations/')) return json(200, {ok:true});
  return json(404, {detail:'unrouted '+l});
}

/* ---------- boot the page ---------- */
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push('jsdomError: ' + (e.stack || e.message)));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

const dom = new JSDOM(HTML, {
  url: 'http://127.0.0.1:8790/', runScripts: 'dangerously', pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(w){
    w.fetch = (u, o) => Promise.resolve(respond(String(u), o));
    w.confirm = () => true;
    w.alert = () => {};
    // jsdom has no layout, so it ships no scrollIntoView. Stub it and record the
    // calls, so the "put the current hour on screen" behaviour is still tested.
    w.__scrolled = [];
    w.Element.prototype.scrollIntoView = function(opt){
      w.__scrolled.push({cls: this.className, opt: opt});
    };
    w.addEventListener('error', e => errors.push('window.onerror: ' + (e.error && e.error.stack || e.message)));
    w.addEventListener('unhandledrejection', e =>
      errors.push('unhandled rejection: ' + (e.reason && e.reason.stack || e.reason)));
  },
});
const w = dom.window, d = w.document;
const $ = s => d.querySelector(s);
const $$ = s => [...d.querySelectorAll(s)];
const n = s => d.querySelectorAll(s).length;
const wait = ms => new Promise(r => setTimeout(r, ms));
const card = name => $$('.dev').find(x => x.dataset.dev === name);
const liveCards   = () => $$('#devs .dev').map(x => x.dataset.dev);
const silentCards = () => $$('#silent-grid .dev').map(x => x.dataset.dev);
const click = el => el.dispatchEvent(new w.MouseEvent('click', {bubbles:true}));
const lastCommand = () => [...sent].reverse().find(x => /\/command$/.test(x.path));
const toasts = () => $$('#log .msg').map(m => m.className.replace('msg','').trim() + '|' +
                                             m.querySelector('b').textContent + '|' +
                                             m.querySelector('span').textContent);
const lastToast = () => toasts()[toasts().length - 1] || '';

(async function run(){
  await wait(1800);  // boot() settles, including its one full state sweep

  console.log('\n[render]');
  ok('clock is ticking',            $('#clock').textContent !== '--:--');
  eq('24 schedule rows',            n('.hr'), 24);
  eq('theme buttons',               n('#themes button'), 2);
  eq('device cards exclude virtual',n('.dev'), 3);
  eq('device count badge',          $('#c-dev').textContent, '3');
  eq('automation entries',          n('.auto'), 2);
  eq('automation count badge',      $('#c-auto').textContent, '2');
  ok('now-band pill filled',        $('#p-band').textContent === 'afternoon');
  ok('status pill says lightd',     $('#p-status').textContent === 'lightd');
  ok('no overnight ceiling card',   !$('#quiet-card'));
  ok('no overnight pill in the header', !$('#p-quiet'));
  ok('and the page never asks for /quiet',
     !sent.some(x => x.path.endsWith('/quiet')), sent.filter(x => x.path.endsWith('/quiet')).length);
  ok('#log container exists',       !!$('#log'));
  eq('example prompts',             n('#examples button'), 5);
  eq('bubbles seeded',              n('#sky .bubble'), 8);
  ok('clouds drift behind the panes', n('#sky .cloud') >= 6, n('#sky .cloud'));
  ok('every cloud has puffs',         $$('#sky .cloud').every(c => c.children.length >= 4));
  ok('the sun and hills are there',   n('#sky .sun') === 1 && n('#sky .hill') === 2);
  ok('the sky is decoration only',    $('#sky').getAttribute('aria-hidden') === 'true');
  ok('current hour scrolled into view', w.__scrolled.some(x => String(x.cls).split(' ').includes('now')),
     JSON.stringify(w.__scrolled.slice(0,2)));
  ok('and only once, not every tick',   w.__scrolled.length === 1, w.__scrolled.length);
  ok('pending automation flagged',  $$('.auto')[1].classList.contains('pending'));
  ok('pending says not scheduled',  $$('.auto')[1].textContent.includes('tap Approve'));
  ok('offline device marked',       card('Bathroom light 1').classList.contains('unreach'));
  ok('offline device says so',      card('Bathroom light 1').textContent.includes('no answer'));

  console.log('\n[silent devices are grouped, not mixed in]');
  ok('answering devices are in the main grid', liveCards().includes('Table Lamp'));
  ok('a silent device is not in the main grid', !liveCards().includes('Bathroom light 1'),
     liveCards().join(', '));
  ok('it is in the drawer instead',            silentCards().includes('Bathroom light 1'),
     silentCards().join(', '));
  ok('a device that answers but ignores you stays put',
     liveCards().includes('Stubborn Strip'), 'it answers; it just does not obey');
  ok('the drawer appears because something is silent', !$('#silent-wrap').hidden);
  ok('the drawer starts collapsed',            $('#silent-body').hidden);
  ok('the drawer says how many',               /1 not answering/.test($('#b-silent').textContent),
     $('#b-silent').textContent);
  ok('the heading counts both sides',          /2 answering, 1 not/.test($('#dev-note').textContent),
     $('#dev-note').textContent);

  click($('#b-silent'));
  ok('clicking the drawer opens it',           !$('#silent-body').hidden);
  ok('the silent card is reachable when open', !!card('Bathroom light 1'));
  ok('its controls are bound when open',
     typeof card('Bathroom light 1').querySelector('[data-p]').onclick === 'function');

  console.log('\n[devices move between the sections]');
  world['Bathroom light 1'].online = true;      // someone flipped the wall switch
  world['Bathroom light 1'].power = true;
  await w.eval("readState('Bathroom light 1')");
  await wait(400);
  ok('a light that comes back joins the main grid', liveCards().includes('Bathroom light 1'),
     liveCards().join(', '));
  ok('and leaves the drawer',                       !silentCards().includes('Bathroom light 1'));
  ok('the drawer hides when nothing is silent',     $('#silent-wrap').hidden);
  ok('the heading says all are answering',          /all 3 answering/.test($('#dev-note').textContent),
     $('#dev-note').textContent);

  world['Bathroom light 1'].online = false;     // and off again
  await w.eval("readState('Bathroom light 1')");
  await wait(400);
  ok('a light that drops out returns to the drawer', silentCards().includes('Bathroom light 1'));
  ok('and leaves the main grid',                     !liveCards().includes('Bathroom light 1'));
  ok('the drawer stayed open across the move',       !$('#silent-body').hidden);
  click($('#b-silent'));
  ok('it can be collapsed again',                    $('#silent-body').hidden);

  console.log('\n[ordering]');
  const rankOf = nm => { const dv = DEVICES.find(x => x.name === nm);
                         return dv.transports.includes('lan') ? 0
                              : dv.transports.includes('cloud') ? 1 : 2; };
  const ranks = liveCards().map(rankOf);
  ok('lan before cloud before bluetooth',
     ranks.every((r,i) => i === 0 || ranks[i-1] <= r), ranks.join(','));
  const cloudNames = liveCards().filter(nm => rankOf(nm) === 1);
  ok('alphabetical within a transport',
     JSON.stringify(cloudNames) === JSON.stringify([...cloudNames].sort()),
     cloudNames.join(', '));

  console.log('\n[payloads on the wire]');
  // THE regression. 'off' is a non-empty string; lightd reads truthiness.
  const lamp = card('Table Lamp');
  click(lamp.querySelector('[data-p]'));
  await wait(2200);
  eq('power OFF sends boolean false', lastCommand().body, {action:'power', value:false});
  ok('power value is not a string',   typeof lastCommand().body.value === 'boolean',
     'type was ' + typeof lastCommand().body.value);

  click(card('Table Lamp').querySelector('[data-p]'));
  await wait(2200);
  eq('power ON sends boolean true',   lastCommand().body, {action:'power', value:true});

  const br = card('Table Lamp').querySelector('[data-b]');
  br.value = '42'; br.dispatchEvent(new w.Event('change', {bubbles:true}));
  await wait(2200);
  eq('brightness sends a number',     lastCommand().body, {action:'brightness', value:42});

  const kv = card('Table Lamp').querySelector('[data-k]');
  kv.value = '5000'; kv.dispatchEvent(new w.Event('change', {bubbles:true}));
  await wait(2200);
  eq('kelvin sends a number',         lastCommand().body, {action:'kelvin', value:5000});

  click(card('Table Lamp').querySelector('[data-c]'));
  await wait(2200);
  eq('colour sends an rgb array',     lastCommand().body, {action:'color', value:[255,147,41]});
  ok('rgb members are numbers',       lastCommand().body.value.every(x => typeof x === 'number'));

  console.log('\n[readback honesty]');
  // Stubborn Strip answers 200 and does nothing. The page must call that out.
  click(card('Stubborn Strip').querySelector('[data-p]'));
  await wait(2400);
  ok('silent-failure device is reported bad', lastToast().startsWith('bad|'), lastToast());
  ok('and says it did not change',            /did not change/.test(lastToast()), lastToast());

  // Table Lamp obeys, so the same action must read as confirmed.
  click(card('Table Lamp').querySelector('[data-p]'));
  await wait(2400);
  ok('obedient device is reported ok',        lastToast().startsWith('ok|'), lastToast());
  ok('and says confirmed',                    /confirmed/.test(lastToast()), lastToast());

  // Offline device: never claim success.
  click(card('Bathroom light 1').querySelector('[data-p]'));
  await wait(2400);
  ok('offline device is reported bad',        lastToast().startsWith('bad|'), lastToast());
  ok('and says it is not answering',          /not answering/.test(lastToast()), lastToast());

  console.log('\n[refusals and trimming]');
  force = {status:409, body:{reason:'quiet hours: kitchen and bathroom are held off'}};
  click(card('Table Lamp').querySelector('[data-p]'));
  await wait(400);
  ok('409 reads as refused, not success',     /warn\|.*refused/.test(lastToast()), lastToast());

  force = {status:403, body:{reason:'actor_not_bound'}};
  click(card('Table Lamp').querySelector('[data-p]'));
  await wait(400);
  ok('403 actor_not_bound is explained',      /does not act for that actor/.test(lastToast()), lastToast());

  force = {status:429, body:{detail:'over 100 req/min'}};
  click(card('Table Lamp').querySelector('[data-p]'));
  await wait(400);
  ok('429 reads as rate limited',             /rate limited/.test(lastToast()), lastToast());

  force = {status:200, body:{ok:true, clamped:{max_brightness:5, reason:'quiet hours'}}};
  click(card('Table Lamp').querySelector('[data-p]'));
  await wait(2400);
  ok('clamped is reported as trimmed',        /trimmed by quiet hours/.test(lastToast()), lastToast());

  console.log('\n[bulk actions]');
  const before = sent.length;
  click($('[data-cmd="on"]'));
  await wait(4000);
  const bulkCmds = sent.slice(before).filter(x => /\/command$/.test(x.path));
  ok('All on sends to every device',   bulkCmds.length === 3, bulkCmds.length + ' commands');
  ok('All on sends boolean true',      bulkCmds.every(c => c.body.value === true),
     JSON.stringify(bulkCmds.map(c => c.body.value)));
  ok('bulk toast counts confirmations',/of 3 confirmed/.test(lastToast()), lastToast());
  ok('bulk toast names silent lights', /not answering/.test(lastToast()), lastToast());

  const before2 = sent.length;
  click($('#b-off'));
  await wait(4000);
  const offCmds = sent.slice(before2).filter(x => /\/command$/.test(x.path));
  ok('All off sends boolean false',    offCmds.length > 0 && offCmds.every(c => c.body.value === false),
     JSON.stringify(offCmds.map(c => c.body.value)));

  console.log('\n[theme apply]');
  click($('#themes button'));
  await wait(900);
  ok('apply is verified',              sent.some(x => /\/apply\?verify=true/.test(x.path)));
  ok('apply carries brightness',       sent.some(x => /brightness=\d+/.test(x.path)));
  ok('apply reports confirmed/total',  /1 of 2 confirmed/.test(lastToast()), lastToast());
  ok('apply names the silent light',   /Bathroom light 1/.test(lastToast()), lastToast());

  console.log('\n[automation form]');
  $('#a-act').value = 'command'; $('#a-act').dispatchEvent(new w.Event('change', {bubbles:true}));
  $('#a-devact').value = 'power'; $('#a-devact').dispatchEvent(new w.Event('change', {bubbles:true}));
  ok('power uses a select, not free text', !$('#a-devpow').hidden && $('#a-devval').hidden);
  $('#a-devpow').value = 'off';
  $('#a-name').value = 'Test rule';
  $('#a-dev').value = 'Table Lamp';
  click($('#b-create'));
  await wait(400);
  const made = [...sent].reverse().find(x => x.path === '/api/lightd/automations' && x.method === 'POST');
  eq('automation power value is boolean false', made.body.action.value, false);
  ok('created is announced as pending',  /pending/.test(lastToast()), lastToast());
  ok('and points at the phone',          /Approve/.test(lastToast()), lastToast());

  $('#a-devact').value = 'brightness'; $('#a-devact').dispatchEvent(new w.Event('change', {bubbles:true}));
  ok('non-power action shows the text box', $('#a-devpow').hidden && !$('#a-devval').hidden);

  $('#a-trig').value = 'sun'; $('#a-trig').dispatchEvent(new w.Event('change', {bubbles:true}));
  ok('sun trigger reveals its fields',  !$('#w-sun').hidden && !$('#w-off').hidden && $('#w-cron').hidden);

  console.log('\n[navigation, scenes, live]');
  const tab = $$('nav button').find(b => b.dataset.v === 'lights');
  click(tab);
  ok('lights tab switches views',       $('#v-lights').classList.contains('on') &&
                                        !$('#v-today').classList.contains('on'));
  for (const v of ['today','lights','autos','claude','about']){
    click($$('nav button').find(b => b.dataset.v === v));
    ok('tab "'+v+'" opens its view',    $('#v-'+v).classList.contains('on'));
  }
  click($$('nav button').find(b => b.dataset.v === 'lights'));

  click($('.hr'));
  eq('schedule row expands',            n('.detail'), 1);
  click($('.hr'));
  eq('schedule row collapses again',    n('.detail'), 0);

  click(card('Table Lamp').querySelector('[data-scenes]'));
  await wait(400);
  ok('scene modal opens',               $('#modal').classList.contains('on'));
  ok('scenes are listed',               n('[data-scene]') === 3, n('[data-scene]') + ' scenes');
  ok('nbsp scene name survives',        $$('[data-scene]').some(b => b.dataset.scene.includes(' ')));
  $('#m-search').value = 'fall';
  $('#m-search').dispatchEvent(new w.Event('input', {bubbles:true}));
  eq('scene filter narrows the list',   n('[data-scene]'), 1);
  click($('[data-scene]'));
  await wait(300);
  ok('scene is intent, not confirmed',  /intent, not readback/.test(lastToast()), lastToast());
  click($('#m-close'));
  ok('scene modal closes',              !$('#modal').classList.contains('on'));

  const liveBtn = $('#b-live');
  ok('live starts on',                  liveBtn.classList.contains('on') && /Live/.test(liveBtn.textContent));
  click(liveBtn);
  ok('live can be paused',              !liveBtn.classList.contains('on') && /Paused/.test(liveBtn.textContent));
  await wait(2800);                     // let any queued readback land
  const frozen = sent.length;
  await wait(3400);
  eq('paused means no polling',         sent.length, frozen);
  click(liveBtn);
  await wait(3400);
  ok('resumed means polling again',     sent.length > frozen);

  console.log('\n[every control is wired]');
  const ids = ['b-live','b-hour','b-off','b-beat','b-panic','b-refresh','b-refresh2',
               'b-create','b-send','m-close'];
  for (const id of ids) ok('#'+id+' has a handler', typeof $('#'+id).onclick === 'function');
  ok('every nav tab has a handler',     $$('nav button').every(b => typeof b.onclick === 'function'));
  ok('every quick button has a handler',$$('[data-cmd]').every(b => typeof b.onclick === 'function'));
  ok('every switch has a handler',      $$('[data-p]').every(b => typeof b.onclick === 'function'));
  ok('every slider has a handler',      $$('[data-b],[data-k]').every(b => typeof b.onchange === 'function'));
  ok('every swatch has a handler',      $$('[data-c]').every(b => typeof b.onclick === 'function'));
  ok('every pause/delete has a handler',$$('[data-en],[data-del]').every(b => typeof b.onclick === 'function'));
  ok('theme grid is delegated',         typeof $('#themes').onclick === 'function');

  console.log('\n[the token never reaches the page]');
  const src = HTML;
  ok('no Authorization header in the page', !/[Aa]uthorization/.test(src));
  ok('no bearer token in the page',         !/Bearer\s+[A-Za-z0-9_-]{20,}/.test(src));
  ok('no direct call to lightd host',       !/192\.168\.\d+\.\d+:8787/.test(src));
  ok('every lightd call goes via the proxy',
     sent.filter(x => x.path.startsWith('/api/')).length === sent.length);

  console.log('\n[layout and spacing]');
  const css = src.slice(src.indexOf('<style>'), src.indexOf('</style>'));
  const sizes = [...css.matchAll(/font-size:\s*([\d.]+)rem/g)].map(m => parseFloat(m[1]));
  const tiny = sizes.filter(s => s < 0.7);
  ok('nothing smaller than 0.7rem',     tiny.length === 0, 'found ' + tiny.join(', '));
  ok('root size clamps for the panel',  /font-size:clamp\(/.test(css));
  ok('the clamp floor keeps 0.7rem >= 10px',
     (parseFloat((css.match(/font-size:clamp\((\d+)px/) || [])[1] || 0) * 0.7) >= 10,
     (css.match(/font-size:clamp\((\d+)px/) || [])[1] + 'px root');
  ok('main can shrink (minmax 0)',      /grid-template-rows:auto auto minmax\(0,1fr\)/.test(css));
  ok('views scroll, body does not',     /body\{[^}]*overflow:hidden/.test(css) && /\.view\{[^}]*overflow:auto/.test(css));
  ok('device grid reflows by width',    /\.devgrid\{[^}]*repeat\(auto-fill/.test(css));
  ok('narrow screens collapse Today',   /@media\(max-width:66rem\)\{\.today\{grid-template-columns:1fr\}\}/.test(css));
  ok('reduced motion stops the sky',    /prefers-reduced-motion:reduce\)[^}]*\{[^}]*animation:none/.test(css));

  // Grid column count must match the children each row actually emits, or the
  // last column silently overflows its track.
  const cols = (css.match(/\.hr\{[\s\S]*?grid-template-columns:([^;]+);/) || [])[1] || '';
  const trackCount = cols.trim().split(/\s+(?![^(]*\))/).length;
  const rowKids = $('.hr').children.length;
  eq('schedule row children match its grid tracks', rowKids, trackCount);
  ok('long device names are clipped, not wrapped', /\.dev h3 \.nm\{[^}]*text-overflow:ellipsis/.test(css));
  ok('long band names are clipped',                /\.hr \.band\{[^}]*text-overflow:ellipsis/.test(css));
  ok('device rows do not wrap mid-control',        /\.dev \.ctl \.row\{flex-wrap:nowrap;min-width:0\}/.test(css));
  ok('hidden elements are actually hidden',        /\[hidden\]\{display:none!important\}/.test(css));
  ok('swatches can shrink inside their row',       /\.swatches\{[^}]*flex:1;min-width:0\}/.test(css));
  ok('device cards are not stretched to fill',     /\.devgrid\{[\s\S]*?align-items:start\}/.test(css));
  ok('slider label and value are fixed width',     /\.dev \.lbl\{width:[\d.]+rem/.test(css) &&
                                                   /\.dev \.val\{[^}]*width:[\d.]+rem/.test(css));
  ok('toast rail is capped on narrow screens',     /#log\{[^}]*width:min\(/.test(css));
  ok('every colour token is defined',
     [...css.matchAll(/var\(--([a-z0-9-]+)\)/g)].map(m => m[1])
       .every(name => new RegExp('--' + name + ':').test(css)),
     [...new Set([...css.matchAll(/var\(--([a-z0-9-]+)\)/g)].map(m => m[1]))]
       .filter(nm => !new RegExp('--' + nm + ':').test(css)).join(', '));

  console.log('\n[errors]');
  ok('no page errors', errors.length === 0, errors.slice(0,3).join(' | '));

  console.log('\n' + '-'.repeat(56));
  console.log(pass + ' passed, ' + fails.length + ' failed');
  if (fails.length){ console.log('\nFAILED:'); fails.forEach(f => console.log('  - ' + f)); }
  process.exit(fails.length ? 1 : 0);
})();
