/* ============================================================
   maya cole — portfolio.set
   DAW-styled portfolio. Vanilla JS, no build step.
   ============================================================ */

/* ---------------- DATA ---------------- */

const TRACKS = [
  { id: 't1', name: 'Engineering',   sub: 'AUDIO·career',   color: 'cyan'    },
  { id: 't2', name: 'Side Projects', sub: 'AUDIO·labs',     color: 'amber'   },
  { id: 't3', name: 'Education',     sub: 'AUDIO·school',   color: 'lime'    },
  { id: 't4', name: 'Music',         sub: 'AUDIO·releases', color: 'magenta' },
  { id: 't5', name: 'Writing',       sub: 'MIDI·blog',      color: 'violet'  },
];

const CLIPS = [
  { track: 't1', color: 'cyan',    start: 0.0,  end: 2.2,  title: 'Frontend Intern',              sub: 'Looplab · Berlin',          tag: '2016' },
  { track: 't1', color: 'cyan',    start: 2.3,  end: 5.6,  title: 'Software Engineer',            sub: 'Northwave Audio · Berlin',  tag: '2018' },
  { track: 't1', color: 'cyan',    start: 5.7,  end: 8.3,  title: 'Senior Engineer · Platform',   sub: 'Northwave Audio',           tag: '2021' },
  { track: 't1', color: 'cyan',    start: 8.4,  end: 10.0, title: 'Staff Engineer',               sub: 'Polytone · Remote',         tag: '2024' },

  { track: 't2', color: 'amber',   start: 1.2,  end: 2.9,  title: 'tonemap.fm',                   sub: 'browser MIDI sequencer',    tag: '',    link: { kind: 'project', id: '0-0' } },
  { track: 't2', color: 'amber',   start: 3.6,  end: 5.0,  title: 'inkpoint',                     sub: 'cli notes + tags',          tag: '',    link: { kind: 'project', id: '0-1' } },
  { track: 't2', color: 'amber',   start: 6.1,  end: 7.8,  title: 'wax',                          sub: 'wax cylinder synth (rust)', tag: '',    link: { kind: 'project', id: '1-0' } },
  { track: 't2', color: 'amber',   start: 8.6,  end: 9.9,  title: 'subharmonic',                  sub: 'lo-fi field recorder app',  tag: 'new', link: { kind: 'project', id: '0-2' } },

  { track: 't3', color: 'lime',    start: 0.0,  end: 1.6,  title: 'BSc Computer Science',         sub: 'TU Delft',                  tag: '' },
  { track: 't3', color: 'lime',    start: 4.4,  end: 5.6,  title: 'Sound Design Cert.',           sub: 'School of Sonic Arts',      tag: '' },

  { track: 't4', color: 'magenta', start: 2.7,  end: 3.4,  title: 'half light EP',                sub: '4 tracks · self-released',  tag: '',     link: { kind: 'release', id: 3 } },
  { track: 't4', color: 'magenta', start: 4.8,  end: 5.4,  title: 'mira (single)',                sub: 'feat. iko',                 tag: '',     link: { kind: 'release', id: 2 } },
  { track: 't4', color: 'magenta', start: 6.8,  end: 7.8,  title: 'softboot LP',                  sub: '9 tracks · Klangform',      tag: '',     link: { kind: 'release', id: 1 } },
  { track: 't4', color: 'magenta', start: 9.0,  end: 9.7,  title: 'glasswater',                   sub: 'single · 2025',             tag: 'live', link: { kind: 'release', id: 0 } },

  { track: 't5', color: 'violet',  start: 3.0,  end: 3.4,  title: 'building a tracker in 200 LOC',sub: '',                          tag: '' },
  { track: 't5', color: 'violet',  start: 4.5,  end: 4.8,  title: 'pitch-shifting with FFT',      sub: '',                          tag: '' },
  { track: 't5', color: 'violet',  start: 6.2,  end: 6.6,  title: 'observable patterns in DAWs',  sub: '',                          tag: '' },
  { track: 't5', color: 'violet',  start: 7.8,  end: 8.1,  title: 'why our timeline is 60fps now',sub: '',                          tag: '' },
  { track: 't5', color: 'violet',  start: 9.3,  end: 9.7,  title: 'I rewrote our scheduler again',sub: '',                          tag: 'new' },
];

const PROJECTS = [
  [
    { name: 'tonemap.fm', tag: 'sequencer', color: 'cyan', bpm: 124, key: 'F#m',
      tech: ['TypeScript', 'Web Audio', 'IndexedDB'], links: { repo: '#', readme: '#' },
      body: [
        "A browser-based step sequencer designed for the kind of slow, evolving patterns you build in the early hours of the morning. No login, no cloud, no marketplace.",
        "Patterns live in IndexedDB. Audio is generated in an AudioWorklet so the timing is sample-accurate. The whole thing is about 1800 lines of TypeScript and exists mostly so I have something to test browser audio APIs against.",
        "Most-used feature: drag a row left or right to rotate the pattern. Second most-used: hold shift while clicking to retrigger only on bar boundaries.",
      ],
    },
    { name: 'inkpoint', tag: 'cli', color: 'lime', bpm: 92, key: 'C',
      tech: ['Go', 'BoltDB'], links: { repo: '#', readme: '#' },
      body: [
        "A command-line notebook for people who already live in a terminal. Notes are tagged, full-text searchable, and live in a single BoltDB file so the whole notebook is one rsync target.",
        "I built this because every other CLI notes tool wanted to either be a static site generator or a markdown editor. I just want to write `ink add 'thought'` and forget about it.",
        "There is a fuzzy finder built on top of bubbletea that is genuinely one of the few interactive Go programs I enjoy using.",
      ],
    },
    { name: 'subharmonic', tag: 'mobile', color: 'amber', bpm: 70, key: 'A',
      tech: ['React Native', 'Audio Worklets', 'Swift'], links: { repo: '#', readme: '#' },
      body: [
        "A lo-fi field recorder for iOS. Records 24-bit audio with one-tap markers, a slow-fade visualizer, and no cloud upload of any kind.",
        "v0.4 introduces multi-track layering so you can record a bed of room tone and overdub a single instrument without leaving the app. The mixing happens locally on a Swift audio graph.",
        "Currently in TestFlight. If you want in, the email is in the about tab.",
      ],
    },
    null,
  ],
  [
    { name: 'wax-synth', tag: 'rust · dsp', color: 'magenta', bpm: 110, key: 'Em',
      tech: ['Rust', 'CPAL', 'egui'], links: { repo: '#', readme: '#' },
      body: [
        "A wax cylinder simulation written in Rust. It models the mechanical pickup, the slow drift of a wax surface, and the spectral roll-off you would expect from a horn.",
        "The DSP is straightforward — a comb filter and a soft saturator — but the fun is in the cylinder model. Each cylinder degrades over its lifetime in the patch. After ten thousand triggers it sounds noticeably worse, and that is on purpose.",
        "Runs as a standalone app and as a CLAP plug-in. I keep meaning to add VST3 but it has not become urgent.",
      ],
    },
    { name: 'ribbon', tag: 'webgpu viz', color: 'violet', bpm: 138, key: 'D',
      tech: ['WebGPU', 'TypeScript', 'WGSL'], links: { repo: '#', readme: '#' },
      body: [
        "An audio-reactive ribbon, drawn in WebGPU. It is mostly a vehicle for me to learn the API, but it has shipped in two live shows.",
        "The ribbon is a single triangle strip whose vertex positions are recomputed every frame from an FFT of the line-in signal. The expressive choice is in the temporal smoothing: too little and it looks twitchy, too much and it lags the music.",
        "WGSL is genuinely pleasant to write once you stop trying to make it look like GLSL.",
      ],
    },
    null,
    { name: 'paperloop', tag: 'paper rolls', color: 'rose', bpm: 60, key: 'G',
      tech: ['Python', 'OpenCV', 'MIDI'], links: { repo: '#', readme: '#' },
      body: [
        "Punch a pattern of holes in a strip of paper, hold it up to a webcam, and the holes become MIDI. That is the entire concept.",
        "It is funny how much expressive nuance survives a webcam pipeline. The holes get slightly squashed when you tilt the paper and that becomes pitch bend. The frame rate of the camera becomes the clock.",
        "Demos well. Survives basically no road conditions. A toy.",
      ],
    },
  ],
  [
    { name: 'mksong.sh', tag: 'shell', color: 'lime', bpm: 88, key: '—',
      tech: ['Bash', 'sox', 'ffmpeg'], links: { repo: '#', readme: '#' },
      body: [
        "A shell script that scaffolds a new song project: folders for stems, tracks, exports, and a tiny readme template. I run it more often than I should admit.",
        "Lives in my dotfiles. It is here mostly so I remember it exists.",
      ],
    },
    { name: 'sd-card-mount', tag: 'kext', color: 'cyan', bpm: 0, key: '—',
      tech: ['Swift', 'IOKit'], links: { repo: '#', readme: '#' },
      body: [
        "A tiny macOS utility that auto-mounts SD cards from field recorders into a project-relative folder. The kind of thing that takes 40 minutes to install and saves 40 hours over a year.",
        "Not a real kext anymore — Apple killed those. It is a launchd-managed Swift binary that watches DiskArbitration. The name stuck.",
      ],
    },
    { name: 'flux', tag: 'midi router', color: 'amber', bpm: 120, key: '—',
      tech: ['Rust', 'midir'], links: { repo: '#', readme: '#' },
      body: [
        "A MIDI router with conditional routing rules. If channel 9 → drop. If note > 96 → transpose down an octave. If velocity < 30 → suppress.",
        "Mostly used for live shows where my controller wants to send way too much data and the synths want very little. The rules are a tiny DSL with a hot-reload watcher.",
      ],
    },
    { name: 'looper.lua', tag: 'norns script', color: 'magenta', bpm: 76, key: 'Bm',
      tech: ['Lua', 'norns', 'SuperCollider'], links: { repo: '#', readme: '#' },
      body: [
        "A live looper for the monome norns. Four mono loops, each with independent speed, direction, and grain density. Tap to record, hold to overdub, double-tap to clear.",
        "The grain engine is a tiny SuperCollider patch. The Lua side is just sequencing and UI. Together it is one of the more expressive things I have shipped.",
      ],
    },
  ],
];

const DEVBLOG = [{
  num: "042",
  title: "SIMPLESITEEDIT MODIFIED THIS TITLE",
  date: "2026 · 05 · 12",
  read: "8 min",
  tags: ["scheduling", "rust", "audio"],
  color: "violet",

  body: [
    "Last quarter I made the case for ripping out our job runner and replacing it with something built around explicit deadlines instead of priorities. This week we shipped it. Here is what changed and what I would do differently if I had to do it again.",
    "The old runner used a priority queue with five tiers. In theory tier 5 jobs ran first. In practice the queue was almost always saturated with tier 3 work and the timing of anything time-sensitive drifted by tens of milliseconds. For audio that is the difference between a tight loop and a sloppy one.",
    "The new runner takes a deadline per task and an estimated duration. It builds a short schedule each tick and only admits work that fits. Jobs that miss admission get pushed to a slow lane and the user gets a yellow indicator. It feels deeply unfair to the slow-lane work, but on average everything finishes sooner because the head of the queue stops thrashing.",
    "If I had to do it again I would have built the visualiser first. Half the bugs we caught in week one were obvious from the schedule plot and invisible from logs. Build the picture, then the thing."
  ]
}, {
  num: "041",
  title: "Why our timeline is 60fps now",
  date: "2025 · 11 · 03",
  read: "12 min",
  tags: ["canvas", "perf", "tooling"],
  color: "cyan",

  body: [
    "Our arrangement timeline used to run at a sad 22 fps on a mid-range laptop. It now holds 60 with room to spare. The fix was not a clever algorithm. It was finally taking the GPU seriously.",
    "The original timeline laid out every clip as a positioned DOM node and let the browser do the work. With 400+ clips on a long arrangement the style and layout stages took almost the whole frame. Devtools would not even let me select the clips without freezing.",
    "We moved the canvas to an OffscreenCanvas in a worker, batched all clip draws into a single pass, and kept DOM only for the controls (S/M/arm buttons, scrollbars). Hover and selection became picking against a click map, which is wonderfully boring code.",
    "The interesting part was the playhead. Updating a single transform on a DOM node was already cheap, so we left it in the DOM, layered above the canvas with pointer-events: none. The browser composites that for free."
  ]
}, {
  num: "040",
  title: "Observable patterns in DAW UIs",
  date: "2025 · 06 · 18",
  read: "6 min",
  tags: ["ux", "patterns"],
  color: "amber",

  body: [
    "There is a particular feeling you get when a DAW lets you see what it is doing. Meters that respond. Faders that move when automation reads them. Playheads that align to grids. It is the opposite of the modern web UI, which tends to hide its state behind a spinner.",
    "I think DAWs got this right because they had to. Real-time audio leaves no room for a busy spinner — the work either fits in the buffer or it does not, and the user needs a constant readout of which.",
    "The lesson for general UI work is small but consistent: when state changes continuously, render it continuously. A loading bar that ticks every second is more honest than a spinner that lies for ten."
  ]
}, {
  num: "039",
  title: "Pitch shifting with FFT — a practical guide",
  date: "2024 · 09 · 22",
  read: "15 min",
  tags: ["dsp", "fft", "long-read"],
  color: "lime",

  body: [
    "Pitch shifting is one of those topics that is genuinely simple to describe and unreasonably hard to make sound good. This post walks through a working implementation in about 200 lines of JS and explains where the cheap version goes wrong.",
    "The naive approach is to FFT the input, shift bins, and inverse FFT. This works but smears transients across the whole window. A snare hit becomes a small avalanche. The fix is phase vocoder framing: overlap the windows, track phase per bin across frames, and re-derive phase based on the shift ratio.",
    "We use a 2048-sample window with 75% overlap. That is four FFTs per output sample worth of work, which sounds expensive until you remember that fftw is approximately magic and modern CPUs do not actually mind. On my laptop it runs realtime up to about 16 voices.",
    "The remaining art is in the window function. Hann is fine. Blackman-Harris is better. I have shipped both. Pick one and go."
  ]
}];

const RELEASES = [
  { title: 'glasswater',     kind: 'single',                year: 2025, len: '4:18',  label: 'self',           color: 'cyan',
    blurb: 'A single recorded entirely on a malfunctioning DI box. The dropouts became the percussion.' },
  { title: 'softboot',       kind: 'LP · 9 tracks',         year: 2024, len: '38:02', label: 'Klangform',      color: 'magenta',
    blurb: 'A long-form record made over two winters in Neukölln. Side A is for the world; side B is for you.' },
  { title: 'mira',           kind: 'single · feat. iko',    year: 2021, len: '3:46',  label: 'self',           color: 'amber',
    blurb: 'A duet with iko about a city block that does not exist. Built around one snare loop and patience.' },
  { title: 'half light',     kind: 'EP · 4 tracks',         year: 2019, len: '17:28', label: 'self',           color: 'violet',
    blurb: 'Four pieces about the hour between dusk and sleep. The first thing I felt brave enough to release.' },
  { title: 'remix · "owls"', kind: 'remix · for kira lane', year: 2018, len: '5:12',  label: 'House of Light', color: 'lime',
    blurb: 'A remix for kira lane that turned into a friendship. Strings rebuilt from a phone recording.' },
];

const MUSICBLOG = [
  { title: 'Building a polymeter loop in 7 against 8',
    excerpt: 'A short walkthrough of how a single bar can feel like it never resolves. We start with a simple kick pattern and drift everything else against it.',
    tag: 'theory', date: '2026 · 04 · 02', read: '5 min', color: 'magenta' },
  { title: 'My SM58 is wrong, and I love it',
    excerpt: 'After ten years of recording, the off-axis roll-off has become a tool. Notes on how I now use a mismatched mic to chase warmth.',
    tag: 'gear', date: '2026 · 02 · 14', read: '4 min', color: 'amber' },
  { title: 'On the side B: what an LP’s second half is for',
    excerpt: 'The first half of a record is for the world. The second half is for you. Some thoughts on sequencing and pacing after softboot.',
    tag: 'craft', date: '2025 · 10 · 30', read: '6 min', color: 'cyan' },
  { title: 'Field-recording the M1 in three positions',
    excerpt: 'Ferries, fog, ferries again. A weekend of recording a single coastal road, and what changed when I moved the mic two meters.',
    tag: 'field', date: '2025 · 07 · 11', read: '7 min', color: 'lime' },
];

// Three discrete proficiency tiers so the meter heights cluster into
// clearly readable bands (high / medium / low) rather than a smooth gradient.
const TIER = { high: 92, med: 62, low: 32 };
const TIER_LABEL = { 92: 'H', 62: 'M', 32: 'L' };

const SKILLS = {
  systems: [
    { name: 'TypeScript',     proficiency: TIER.high, color: 'cyan'    },
    { name: 'Python',         proficiency: TIER.high, color: 'lime'    },
    { name: 'Rust',           proficiency: TIER.med,  color: 'amber'   },
    { name: 'Go',             proficiency: TIER.low,  color: 'cyan'    },
    { name: 'C++ (audio)',    proficiency: TIER.low,  color: 'magenta' },
  ],
  craft: [
    { name: 'React',          proficiency: TIER.high, color: 'cyan'    },
    { name: 'Audio Worklets', proficiency: TIER.med,  color: 'violet'  },
    { name: 'WASM',           proficiency: TIER.med,  color: 'amber'   },
    { name: 'WebGPU',         proficiency: TIER.low,  color: 'magenta' },
  ],
  interests: [
    { name: 'DSP Theory',     proficiency: TIER.high, color: 'amber'   },
    { name: 'Polymeter',      proficiency: TIER.med,  color: 'magenta' },
    { name: 'Game Theory',    proficiency: TIER.low,  color: 'cyan'    },
    { name: 'Info Theory',    proficiency: TIER.low,  color: 'violet'  },
  ],
};

const NOW = [
  { k: 'now in',   v: 'Berlin, DE'           },
  { k: 'role',     v: 'Staff Eng · Polytone' },
  { k: 'shipping', v: 'subharmonic v0.4'     },
  { k: 'reading',  v: 'Sound Unbound'        },
  { k: 'spinning', v: 'softboot · side B'    },
  { k: 'open to',  v: 'collabs · remixes'    },
];

const VIEWS = ['arrange', 'session', 'devblog', 'releases', 'music notes', 'about'];

/* ---------------- STATE ---------------- */

const state = {
  view: 'arrange',
  openPost: null,
  playing: true,
  recording: false,
  tempo: 128.0,
  pos: '1.1.1',
  ph: 7.4,
  meterTick: 0,
  arrZoom: 1.0,
  arrScrollX: 0,
  clipPopover: null,
  playingCell: null,
  releasePlaying: null,
  releaseProgress: 0.34,
  trackBtns: TRACKS.reduce((acc, t) => {
    acc[t.id] = { solo: t.id === 't1', mute: false, arm: t.id === 't5' };
    return acc;
  }, {}),
};

/* ---------------- UTIL ---------------- */

function el(tag, attrs, ...children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else node.setAttribute(k, v);
    }
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

const $ = (sel, root = document) => root.querySelector(sel);

/* ---------------- TITLE BAR ---------------- */

function renderTitleBar() {
  const bar = $('.titlebar');
  bar.innerHTML = '';
  bar.append(
    el('div', { class: 'tb-lights' },
      el('span', { class: 'tb-light r' }),
      el('span', { class: 'tb-light y' }),
      el('span', { class: 'tb-light g' }),
    ),
    el('div', { class: 'tb-meta' }, 'file'),
    el('div', { class: 'tb-meta' }, 'edit'),
    el('div', { class: 'tb-meta' }, 'view'),
    el('div', { class: 'tb-meta' }, 'create'),
    el('div', { class: 'tb-meta' }, 'options'),
    el('div', { class: 'tb-title' }, `portfolio.set — ${state.tempo.toFixed(2)} BPM · 4/4 · saved 2s ago`),
    el('div', { class: 'tb-meta' }, '96 kHz · 24-bit'),
  );
}

/* ---------------- TRANSPORT ---------------- */

function renderTransport() {
  const t = $('.transport');
  t.innerHTML = '';

  const playBtn = el('button',
    { class: 'tr-btn' + (state.playing ? ' active' : ''), title: state.playing ? 'Stop' : 'Play',
      onclick: () => { state.playing = !state.playing; renderTransport(); renderTitleBar(); kickMeterLoop(); kickPositionLoop(); kickPlayheadLoop(); }
    },
    state.playing ? '■' : '▶'
  );

  const recBtn = el('button',
    { class: 'tr-btn rec' + (state.recording ? ' active' : ''), title: 'Record',
      onclick: () => { state.recording = !state.recording; renderTransport(); }
    },
    '●'
  );

  const left = el('div', { class: 'tr-section' },
    el('button', { class: 'tr-btn tr-tap', title: 'Tap' }, 'TAP'),
    el('div', { class: 'tr-value big', style: { color: 'var(--clip-amber)' } }, state.tempo.toFixed(2)),
    el('div', { class: 'tr-label' }, 'BPM'),
    el('div', { class: 'tr-divider' }),
    el('div', { class: 'tr-value' }, '4 / 4'),
    el('div', { class: 'tr-divider' }),
    playBtn,
    recBtn,
    el('div', { class: 'tr-value', id: 'pos-display' }, state.pos),
  );

  const tabs = el('div', { class: 'tr-tabs' },
    ...VIEWS.map(v => el('button', {
      class: 'tr-tab' + (state.view === v ? ' active' : ''),
      onclick: () => setView(v),
    }, v))
  );

  const right = el('div', { class: 'tr-section' },
    el('div', { class: 'tr-label' }, 'key'),
    el('div', { class: 'tr-value' }, 'F#m'),
    el('div', { class: 'tr-divider' }),
    el('div', { class: 'tr-label' }, 'cpu'),
    el('div', { class: 'tr-value', style: { color: 'var(--play)' } }, '14%'),
    el('div', { class: 'tr-divider' }),
    el('div', { class: 'tr-label' }, 'audio'),
    el('div', { class: 'tr-value', style: { color: 'var(--clip-cyan)' } }, '● in'),
  );

  t.append(left, tabs, right);
}

/* ---------------- HERO ---------------- */

function renderHero() {
  return el('div', { class: 'hero' },
    el('div', null,
      el('div', { class: 'hero-id' },
        el('span', { class: 'dot' }),
        'online · berlin'
      )
    ),
    el('div', null,
      el('div', { class: 'hero-name' },
        'maya cole',
        el('span', { class: 'punct' }, '.')
      ),
      el('div', { class: 'hero-tagline' },
        el('span', { class: 'accent' }, 'engineer'),
        el('span', { class: 'sep' }, '/'),
        'composer',
        el('span', { class: 'sep' }, '/'),
        'shipping ',
        el('span', { style: { color: 'var(--clip-amber)' } }, 'tools for sound')
      )
    ),
    el('div', { class: 'hero-meter' },
      el('div', { class: 'hero-meter-row' },
        el('span', null, 'SIGNAL'),
        el('div', { class: 'hero-meter-bar' }, el('div', { class: 'fill', style: { width: '74%' } })),
        el('span', { style: { color: 'var(--play)' } }, '-4.2 dB')
      ),
      el('div', { class: 'hero-meter-row' },
        el('span', null, 'UPTIME'),
        el('div', { class: 'hero-meter-bar' }, el('div', { class: 'fill', style: { width: '92%' } })),
        el('span', { style: { color: 'var(--clip-cyan)' } }, '9y · 4mo')
      ),
    ),
  );
}

/* ---------------- CLIP (audio waveform) ---------------- */

function clipWaveform(seed, bars) {
  const arr = new Array(bars);
  for (let i = 0; i < bars; i++) {
    const v = 0.25 + 0.7 * Math.abs(Math.sin(i * 0.7 + seed * 0.13) * Math.cos(i * 0.31 + seed * 0.07));
    arr[i] = v;
  }
  return arr;
}

function renderClip(c, pxPerUnit) {
  const left = c.start * pxPerUnit;
  const width = (c.end - c.start) * pxPerUnit;
  const bars = Math.max(12, Math.floor(width / 3));
  const seed = c.title.charCodeAt(0) + c.title.length * 3;
  const wave = clipWaveform(seed, bars);

  const clipEl = el('div', {
    class: `arr-clip fill-${c.color}` + (c.link ? ' linked' : ''),
    style: { left: left + 'px', width: width + 'px' },
    title: c.link ? `${c.title} — click to expand` : `${c.title} — ${c.sub}`,
  },
    el('div', null,
      el('div', { class: 'arr-clip-title' }, c.title),
      el('div', { class: 'arr-clip-sub' }, c.sub),
    ),
    c.tag ? el('div', { class: 'arr-clip-tag' }, c.tag) : null,
    el('div', { class: 'arr-clip-waveform' },
      ...wave.map(v => el('i', { style: { height: (v * 100) + '%' } }))
    ),
  );

  if (c.link) {
    clipEl.addEventListener('click', (e) => {
      e.stopPropagation();
      openClipPopover(c.link, clipEl);
    });
  }

  return clipEl;
}

/* ---------------- TRACK ROW ---------------- */

function renderTrackRow(track, idx) {
  const btns = state.trackBtns[track.id];
  const row = el('div', { class: 'arr-track-row' });

  const sBtn = el('button', { class: 'arr-iobtn s' + (btns.solo ? ' on' : '') }, 'S');
  const mBtn = el('button', { class: 'arr-iobtn m' + (btns.mute ? ' on' : '') }, 'M');
  const aBtn = el('button', { class: 'arr-iobtn a' + (btns.arm ? ' on' : '') }, '●');
  sBtn.addEventListener('click', () => { btns.solo = !btns.solo; sBtn.classList.toggle('on', btns.solo); });
  mBtn.addEventListener('click', () => { btns.mute = !btns.mute; mBtn.classList.toggle('on', btns.mute); });
  aBtn.addEventListener('click', () => { btns.arm = !btns.arm; aBtn.classList.toggle('on', btns.arm); });

  row.append(
    el('div', { class: 'arr-track-color', style: { background: `var(--clip-${track.color})` } }),
    el('div', { class: 'arr-track-info' },
      el('div', { class: 'arr-track-name' }, `${idx + 1}. ${track.name}`),
      el('div', { class: 'arr-track-sub' }, track.sub),
    ),
    el('div', { class: 'arr-track-iobtns' }, sBtn, mBtn, aBtn),
  );

  return row;
}

/* ---------------- ARRANGEMENT VIEW ---------------- */

let arrCanvas = null;
let arrTimeRef = null;
let arrScrollHeaderRef = null;
let arrPxPerUnit = 80;
let arrBasePxPerUnit = 80;
const ARR_YEARS = 10;
const ARR_ZOOM_MIN = 1.0;
const ARR_ZOOM_MAX = 5.0;

function renderArrangeView() {
  const root = el('div', null);

  root.append(renderHero());

  const grid = el('div', { class: 'arrangement' });

  grid.append(el('div', { class: 'arr-tracks-header' }, `tracks · ${TRACKS.length}`));

  arrTimeRef = el('div', { class: 'arr-time' });
  grid.append(arrTimeRef);

  arrScrollHeaderRef = el('div', { class: 'arr-scroll-header' }, '1.0×');
  arrTimeRef.append(arrScrollHeaderRef);

  const trackCol = el('div', { class: 'arr-tracks' });
  TRACKS.forEach((t, i) => trackCol.append(renderTrackRow(t, i)));
  grid.append(trackCol);

  arrCanvas = el('div', {
    class: 'arr-canvas',
    title: 'scroll = pan · ctrl/⌘ + scroll = zoom',
  });
  arrCanvas.addEventListener('wheel', onArrangementWheel, { passive: false });
  arrTimeRef && arrTimeRef.addEventListener && arrTimeRef.addEventListener('wheel', onArrangementWheel, { passive: false });
  grid.append(arrCanvas);

  root.append(grid);

  // Initial canvas + ticks render
  requestAnimationFrame(() => {
    layoutArrangement();
    if (arrResizeObs) arrResizeObs.disconnect();
    arrResizeObs = new ResizeObserver(layoutArrangement);
    arrResizeObs.observe(arrTimeRef);
  });

  return root;
}

let arrResizeObs = null;

function layoutArrangement() {
  if (!arrCanvas || !arrTimeRef) return;
  const width = arrTimeRef.clientWidth || 900;
  arrBasePxPerUnit = Math.max(80, width / ARR_YEARS);
  arrPxPerUnit = arrBasePxPerUnit * state.arrZoom;

  // clamp scroll within new content width
  const totalWidth = arrPxPerUnit * ARR_YEARS;
  const maxScroll = Math.max(0, totalWidth - width);
  if (state.arrScrollX > maxScroll) state.arrScrollX = maxScroll;
  if (state.arrScrollX < 0) state.arrScrollX = 0;
  const tx = `translateX(${-state.arrScrollX}px)`;

  // ticks
  arrTimeRef.innerHTML = '';
  const timeInner = el('div', { class: 'arr-time-inner', style: { transform: tx } });
  for (let y = 0; y <= ARR_YEARS; y++) {
    timeInner.append(el('div', { class: 'arr-time-tick', style: { left: (y * arrPxPerUnit) + 'px' } }, String(2016 + y)));
  }
  arrTimeRef.append(timeInner);
  // re-append the zoom indicator (innerHTML reset above removed it)
  if (arrScrollHeaderRef) arrTimeRef.append(arrScrollHeaderRef);

  // canvas: tracks then playhead, inside a translated wrapper
  arrCanvas.innerHTML = '';
  const canvasInner = el('div', { class: 'arr-canvas-inner', style: { transform: tx } });
  TRACKS.forEach((t) => {
    const row = el('div', { class: 'arr-canvas-row' });
    CLIPS.filter(c => c.track === t.id).forEach(c => row.append(renderClip(c, arrPxPerUnit)));
    canvasInner.append(row);
  });
  const ph = el('div', { class: 'arr-playhead', style: { left: (state.ph * arrPxPerUnit) + 'px' } });
  ph.id = 'playhead';
  canvasInner.append(ph);
  arrCanvas.append(canvasInner);

  // zoom indicator
  if (arrScrollHeaderRef) {
    arrScrollHeaderRef.textContent = `${state.arrZoom.toFixed(1)}×`;
  }
}

function applyArrangementPan() {
  const tx = `translateX(${-state.arrScrollX}px)`;
  const ci = arrCanvas && arrCanvas.firstChild;
  const ti = arrTimeRef && arrTimeRef.firstChild;
  if (ci) ci.style.transform = tx;
  if (ti) ti.style.transform = tx;
}

function onArrangementWheel(e) {
  if (!arrCanvas || !arrTimeRef) return;
  if (state.clipPopover) closeClipPopover();
  const width = arrTimeRef.clientWidth || 900;
  const base = Math.max(80, width / ARR_YEARS);

  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    const rect = arrCanvas.getBoundingClientRect();
    const cursorView = e.clientX - rect.left;
    const oldZoom = state.arrZoom;
    const factor = Math.exp(-e.deltaY * 0.0015);
    const newZoom = Math.min(ARR_ZOOM_MAX, Math.max(ARR_ZOOM_MIN, oldZoom * factor));
    if (newZoom === oldZoom) return;
    // keep cursor anchor on the same time point
    const cursorContent = cursorView + state.arrScrollX;
    state.arrZoom = newZoom;
    state.arrScrollX = cursorContent * (newZoom / oldZoom) - cursorView;
    layoutArrangement();
    return;
  }

  // pan
  const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
  if (delta === 0) return;
  e.preventDefault();
  const totalWidth = base * state.arrZoom * ARR_YEARS;
  const maxScroll = Math.max(0, totalWidth - width);
  state.arrScrollX = Math.max(0, Math.min(maxScroll, state.arrScrollX + delta));
  applyArrangementPan();
}

/* ---------------- SESSION VIEW ---------------- */

function renderSessionView() {
  const trackHeads  = ['apps', 'research', 'tools'];
  const trackColors = ['cyan', 'magenta', 'lime'];
  const trackRoles  = ['shipping', 'experimental', 'glue code'];

  const root = el('div', null);

  root.append(
    el('div', { class: 'section-head' },
      el('div', null,
        el('h2', null, 'session view'),
        el('div', { class: 'sub' }, 'Projects · launch a clip to read more'),
      ),
      el('div', { class: 'right' }, '3 tracks · 11 clips · 1 stop'),
    )
  );

  const session = el('div', { class: 'session' });

  const tracksCol = el('div', { class: 'session-tracks' });
  tracksCol.append(el('div', { class: 'session-scene-header' }, 'scenes'));
  trackHeads.forEach((t, i) => {
    tracksCol.append(
      el('div', { class: 'session-track-head' },
        el('div', { class: 'swatch', style: { background: `var(--clip-${trackColors[i]})` } }),
        el('span', { class: 'name' }, t),
        el('span', { class: 'role' }, trackRoles[i]),
      )
    );
  });

  const middle = el('div', null);
  const sceneHeader = el('div', { class: 'session-scene-header', style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: 0 } });
  ['scene 01', 'scene 02', 'scene 03', 'scene 04'].forEach((s, i) => {
    sceneHeader.append(el('div', {
      style: { padding: '0 12px', display: 'flex', alignItems: 'center', borderRight: i < 3 ? '1px solid var(--line)' : '0' },
    }, s));
  });
  middle.append(sceneHeader);

  const sideRef = { side: null };

  const grid = el('div', { class: 'session-grid' });
  PROJECTS.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      const key = `${ri}-${ci}`;
      if (!cell) {
        grid.append(el('div', { class: 'session-cell empty' }));
        return;
      }
      const openBtn = el('button', {
        class: 'session-cell-open',
        title: 'open article',
        onclick: (e) => { e.stopPropagation(); openArticle('project', key); },
      }, 'open ›');

      const cellEl = el('div', {
        class: 'session-cell has-clip' + (state.playingCell === key ? ' playing' : ''),
        style: { background: `var(--clip-${cell.color})` },
      },
        el('span', { class: 'play-btn' }),
        openBtn,
        el('div', { class: 'session-cell-name' }, cell.name),
        el('div', { class: 'session-cell-bottom' },
          el('span', null, cell.tag),
          el('span', null, cell.bpm ? `${cell.bpm} BPM` : ''),
        ),
      );
      cellEl.addEventListener('click', () => {
        state.playingCell = (state.playingCell === key ? null : key);
        // toggle classes without full re-render to keep snappy
        grid.querySelectorAll('.session-cell.has-clip').forEach(n => n.classList.remove('playing'));
        if (state.playingCell) cellEl.classList.add('playing');
        renderSessionSide(sideRef.side);
      });
      grid.append(cellEl);
    });
  });
  middle.append(grid);

  const side = el('div', { class: 'session-side' });
  sideRef.side = side;
  renderSessionSide(side);

  session.append(tracksCol, middle, side);
  root.append(session);
  return root;
}

function renderSessionSide(side) {
  side.innerHTML = '';
  side.append(el('h4', null, 'now playing'));

  if (state.playingCell) {
    const [ri, ci] = state.playingCell.split('-').map(Number);
    const cell = PROJECTS[ri][ci];
    const firstLine = (cell.body && cell.body[0]) || '';
    side.append(
      el('div', null,
        el('div', { class: 'now-name' }, cell.name),
        el('div', { class: 'now-desc' }, firstLine.length > 260 ? firstLine.slice(0, 258) + '…' : firstLine),
        el('div', { class: 'chips-row' },
          el('button', {
            class: 'chip cool',
            style: { cursor: 'pointer', fontFamily: 'var(--mono)' },
            onclick: () => openArticle('project', state.playingCell),
          }, 'open article ›'),
        ),
      )
    );
  } else {
    side.append(
      el('div', { class: 'placeholder' },
        'Click a clip to launch.',
        el('br'), el('br'),
        el('span', { class: 'keys' }, 'Q · W · E · R'),
        ' trigger scenes 1–4.',
      )
    );
  }

  side.append(el('h4', { style: { marginTop: '22px' } }, 'quantize'));
  const qRow = el('div', { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' } });
  ['1 bar', '1/2', '1/4', '1/8'].forEach((q, i) => {
    qRow.append(el('button', { class: 'chip', style: i === 0 ? { background: 'var(--bg-3)', color: 'var(--fg)' } : null }, q));
  });
  side.append(qRow);

  side.append(el('h4', { style: { marginTop: '22px' } }, 'tracks'));
  side.append(el('div', { class: 'tracks-list' },
    'apps · 3 clips', el('br'),
    'research · 3 clips', el('br'),
    'tools · 4 clips', el('br'),
  ));
}

/* ---------------- DEVBLOG VIEW (MIDI roll) ---------------- */

function renderMidiClip(color, seed, density = 28) {
  const clip = el('div', { class: 'midi-clip' });
  for (let i = 0; i < density; i++) {
    const t = (i * 0.7 + (seed % 5)) % 1;
    const left = 4 + t * 88 + Math.sin(i * seed) * 2;
    const top = 14 + ((i * 7 + seed * 3) % 70);
    const w = 4 + ((i * 11) % 18);
    clip.append(el('div', {
      class: 'midi-note',
      style: {
        left: left + '%', top: top + '%', width: w + '%',
        background: `var(--clip-${color})`,
      },
    }));
  }
  return clip;
}

function renderDevblogView() {
  const root = el('div', null);
  root.append(
    el('div', { class: 'section-head' },
      el('div', null,
        el('h2', null, 'devblog'),
        el('div', { class: 'sub' }, 'MIDI · piano roll · longform'),
      ),
      el('div', { class: 'right' }, `${DEVBLOG.length} posts · rss · atom`),
    )
  );

  const list = el('div', null);
  DEVBLOG.forEach((post, i) => {
    const track = el('div', {
      class: 'devblog-track clickable',
      onclick: () => openArticle('devblog', i),
    });
    const info = el('div', { class: 'devblog-info' },
      el('div', { class: 'num' }, `post · ${post.num}`),
      el('h3', null, post.title),
      el('div', { class: 'meta' },
        el('span', null, post.date),
        el('span', null, '·'),
        el('span', null, post.read),
      ),
      el('div', { class: 'tags' },
        ...post.tags.map(t => el('span', { class: 'tag' }, t))
      ),
    );
    track.append(info, renderMidiClip(post.color, post.num.charCodeAt(0) + i * 7, 28));
    list.append(track);
  });
  root.append(list);
  return root;
}

/* ---------------- RELEASES VIEW ---------------- */

function renderReleaseCover(color, title) {
  const c = title.charCodeAt(0);
  const variant = c % 4;
  const fill = `var(--clip-${color})`;
  const cover = el('div', { class: 'release-cover', style: { background: 'var(--bg-2)' } });
  cover.append(el('div', { class: 'stripes' }));
  const geo = el('div', { class: 'geo' });
  if (variant === 0) geo.append(el('div', { style: { width: '36px', height: '36px', borderRadius: '50%', background: fill, opacity: '0.85' } }));
  else if (variant === 1) geo.append(el('div', { style: { width: '36px', height: '36px', background: fill, transform: 'rotate(45deg)', opacity: '0.85' } }));
  else if (variant === 2) geo.append(el('div', { style: { width: '44px', height: '8px', background: fill, boxShadow: `0 14px 0 ${fill}, 0 -14px 0 ${fill}` } }));
  else geo.append(el('div', { style: { width: '0', height: '0', borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderBottom: `36px solid ${fill}`, opacity: '0.9' } }));
  cover.append(geo);
  cover.append(el('div', { class: 'label' }, title.toLowerCase()));
  return cover;
}

function releaseWaveData(bars) {
  const data = new Array(bars);
  for (let i = 0; i < bars; i++) {
    const env = 1 - Math.abs((i - bars * 0.5) / (bars * 0.5)) * 0.4;
    data[i] = 0.2 + 0.8 * Math.abs(Math.sin(i * 0.21) * Math.cos(i * 0.07) * env);
  }
  return data;
}

function renderReleaseWave(idx, color) {
  const bars = 80;
  const data = releaseWaveData(bars);
  const isPlaying = state.releasePlaying === idx;
  const progress = isPlaying ? state.releaseProgress : 0.34;
  const played = Math.floor(progress * bars);

  const wave = el('div', { class: 'release-wave', dataset: { idx: String(idx) } });
  data.forEach((v, i) => {
    wave.append(el('i', {
      class: i <= played ? 'played' : '',
      style: {
        height: (v * 30 + 4) + 'px',
        background: i <= played ? `var(--clip-${color})` : 'var(--fg-4)',
        opacity: i <= played ? '1' : '0.45',
      },
    }));
  });
  return wave;
}

function renderReleasesView() {
  const root = el('div', null);
  root.append(
    el('div', { class: 'section-head' },
      el('div', null,
        el('h2', null, 'releases'),
        el('div', { class: 'sub' }, 'Audio · self-released & label'),
      ),
      el('div', { class: 'right' }, `${RELEASES.length} entries · 2018 → 2025`),
    )
  );

  const list = el('div', { id: 'release-list' });
  RELEASES.forEach((r, i) => {
    const row = el('div', { class: 'release-row' });

    const playBtn = el('button', {
      class: 'release-play' + (state.releasePlaying === i ? ' playing' : ''),
    });
    playBtn.addEventListener('click', () => {
      if (state.releasePlaying === i) {
        state.releasePlaying = null;
      } else {
        state.releasePlaying = i;
        state.releaseProgress = 0.34;
        kickReleaseLoop();
      }
      refreshReleaseRow(i);
    });

    row.append(
      renderReleaseCover(r.color, r.title),
      el('div', null,
        el('div', { class: 'release-title' }, r.title),
        el('div', { class: 'release-sub' }, `${r.kind} · ${r.year} · ${r.label}`),
      ),
      renderReleaseWave(i, r.color),
      el('div', { class: 'release-time' }, r.len),
      el('div', { style: { display: 'flex', justifyContent: 'flex-end' } }, playBtn),
    );
    row.dataset.idx = String(i);
    list.append(row);
  });
  root.append(list);
  return root;
}

function refreshReleaseRow(idx) {
  const list = $('#release-list');
  if (!list) return;
  const row = list.querySelector(`.release-row[data-idx="${idx}"]`);
  if (!row) return;
  const r = RELEASES[idx];

  // replace wave
  const oldWave = row.querySelector('.release-wave');
  const newWave = renderReleaseWave(idx, r.color);
  oldWave.replaceWith(newWave);

  // play button class
  const btn = row.querySelector('.release-play');
  btn.classList.toggle('playing', state.releasePlaying === idx);

  // if switching to a new track, reset other rows visually
  if (state.releasePlaying !== null) {
    list.querySelectorAll('.release-play').forEach(b => {
      const ri = Number(b.closest('.release-row').dataset.idx);
      b.classList.toggle('playing', ri === state.releasePlaying);
    });
  }
}

/* ---------------- MUSIC BLOG VIEW ---------------- */

function renderSampleSlice(color) {
  const bars = 80;
  const data = new Array(bars);
  for (let i = 0; i < bars; i++) {
    data[i] = 0.2 + 0.8 * Math.abs(Math.sin(i * 0.31 + color.length) * Math.cos(i * 0.11));
  }
  const slice = el('div', { class: 'slice', style: { color: `var(--clip-${color})` } });
  const wave = el('div', { class: 'wave' });
  data.forEach(v => wave.append(el('i', { style: { height: (v * 100) + '%' } })));
  slice.append(wave);
  [12, 38, 58].forEach((s, i) => {
    slice.append(
      el('div', { class: 'marker', style: { left: s + '%' } },
        el('span', { class: 'lbl' }, `${i + 1}.${(s % 4) + 1}`)
      )
    );
  });
  return slice;
}

function renderMusicBlogView() {
  const root = el('div', null);
  root.append(
    el('div', { class: 'section-head' },
      el('div', null,
        el('h2', null, 'music notes'),
        el('div', { class: 'sub' }, 'Sample slices · craft · gear · theory'),
      ),
      el('div', { class: 'right' }, `${MUSICBLOG.length} entries · slow updates`),
    )
  );

  const grid = el('div', { class: 'musicblog' });
  MUSICBLOG.forEach(p => {
    grid.append(
      el('div', { class: 'mb-card' },
        renderSampleSlice(p.color),
        el('h3', null, p.title),
        el('div', { class: 'excerpt' }, p.excerpt),
        el('div', { class: 'meta' },
          el('span', { class: 'tag' }, '#' + p.tag),
          el('span', null, p.date),
          el('span', null, p.read),
        ),
      )
    );
  });
  root.append(grid);
  return root;
}

/* ---------------- ABOUT VIEW ---------------- */

function renderAboutView() {
  const root = el('div', null);
  root.append(
    el('div', { class: 'section-head' },
      el('div', null,
        el('h2', null, 'about & signal chain'),
        el('div', { class: 'sub' }, 'Bio · skills · now'),
      ),
      el('div', { class: 'right' }, 'v9.4 · last touched today'),
    )
  );

  const info = el('div', { class: 'info-grid' });
  NOW.forEach(n => {
    info.append(
      el('div', { class: 'info-cell' },
        el('div', { class: 'k' }, n.k),
        el('div', { class: 'v' }, n.v),
      )
    );
  });
  root.append(info);

  const about = el('div', { class: 'about' });

  const text = el('div', { class: 'about-text' });
  const lede = el('p', { class: 'lede' });
  lede.append(
    'I build ',
    el('span', { class: 'accent' }, 'tools for people who make sound'),
    ' — daws, instruments, browsers that listen — and on quiet weekends I make the records those tools are for.'
  );
  text.append(lede);
  text.append(el('p', null, 'My day job is staff engineering at Polytone, where I lead the platform team behind a browser-based collaboration tool for studios. Before that I spent six years at Northwave Audio shipping plug-ins to a few hundred thousand producers.'));
  const p2 = el('p');
  p2.append('My nights are ',
    el('span', { class: 'accent-m' }, 'softboot'),
    ', the project I record under: ambient music with a pulse, made mostly with hardware in a small room in Neukölln. The most recent LP came out on Klangform in 2024.'
  );
  text.append(p2);
  text.append(el('p', null, 'I write here when I have something to say, ship side projects when they finally run, and I am usually open to remixes, collabs, and conversations about realtime audio in the browser.'));

  const stack = el('div', { class: 'about-stack' });
  const stackGroup = (title, list, cls) => {
    const chiprow = el('div', { class: 'chiprow' });
    list.forEach(s => chiprow.append(el('span', { class: 'chip ' + cls }, s.name)));
    return el('div', null, el('h4', null, title), chiprow);
  };
  stack.append(stackGroup('systems', SKILLS.systems, 'cool'));
  stack.append(stackGroup('frontend craft', SKILLS.craft, 'violet'));
  stack.append(stackGroup('interests', SKILLS.interests, 'warm'));
  stack.append(
    el('div', null,
      el('h4', null, 'contact'),
      el('div', { class: 'contact' },
        el('div', null, 'maya@cole.studio'),
        el('div', null, '+49 30 · on request'),
        el('div', null, 'signal · keybase · ask'),
      )
    )
  );

  about.append(text, stack);
  root.append(about);
  return root;
}

/* ---------------- MIXER ---------------- */

function levelToDb(level) {
  const clamped = Math.max(0.0001, Math.min(1, level));
  return 20 * Math.log10(clamped);
}

// Flatten SKILLS into a single ordered strip array, tagged with group.
// Group order: systems → craft → studio → interests.
const SKILL_GROUPS = [
  { key: 'systems',   label: 'SYS',    accent: 'cyan'    },
  { key: 'craft',     label: 'CRAFT',  accent: 'magenta' },
  { key: 'interests', label: '~INT',   accent: 'amber'   },
];

const SKILL_STRIPS = SKILL_GROUPS.flatMap(g =>
  SKILLS[g.key].map((s, i) => ({
    name: s.name,
    proficiency: s.proficiency,
    color: s.color,
    group: g.key,
    groupAccent: g.accent,
    groupLabel: g.label,
    isFirstInGroup: i === 0,
  }))
);

function renderMixer() {
  const mixer = $('.mixer');
  mixer.innerHTML = '';

  const master = el('div', { class: 'mixer-master' },
    el('div', null,
      el('div', { class: 'lbl' }, '@'),
      el('div', { class: 'name' }, 'maya cole'),
    ),
    el('div', { class: 'lbl' }, 'eng · composer · b. berlin'),
    el('div', { class: 'links' },
      el('a', { href: '#' }, 'github'),
      el('a', { href: '#' }, 'are.na'),
      el('a', { href: '#' }, 'bandcamp'),
      el('a', { href: '#' }, 'soundcloud'),
      el('a', { href: '#' }, 'read.cv'),
      el('a', { href: '#' }, 'mail'),
    ),
  );
  mixer.append(master);

  const strips = el('div', { class: 'mixer-strips' });
  SKILL_STRIPS.forEach((s, i) => {
    if (s.isFirstInGroup && i > 0) {
      strips.append(el('div', { class: 'mixer-group-divider' }));
    }
    strips.append(renderMixerStrip(s, i));
  });
  strips.append(el('div', { class: 'mixer-group-divider master' }));
  strips.append(renderMasterStrip());
  mixer.append(strips);
}

function renderMixerStrip(strip, idx) {
  const stripColor = `var(--clip-${strip.color})`;
  const accentColor = `var(--clip-${strip.groupAccent})`;
  const faderPct = strip.proficiency;
  const initialDb = levelToDb(strip.proficiency / 100);
  const tierLetter = TIER_LABEL[strip.proficiency] || '·';
  const tierClass = tierLetter === 'H' ? 'tier-high' : tierLetter === 'M' ? 'tier-med' : 'tier-low';
  const tierFullName = tierLetter === 'H' ? 'high' : tierLetter === 'M' ? 'medium' : 'low';

  const meter = el('div', { class: 'strip-meter' });
  const col1 = el('span', { class: 'col' });
  const col2 = el('span', { class: 'col' });
  meter.append(col1, col2);

  const groupTag = strip.isFirstInGroup
    ? el('div', { class: 'strip-group-label', style: { color: accentColor } }, strip.groupLabel)
    : el('div', { class: 'strip-group-label', style: { visibility: 'hidden' } }, '·');

  const node = el('div', {
    class: `mixer-strip skill-strip ${tierClass}`,
    dataset: { idx: String(idx), proficiency: String(strip.proficiency) },
    title: `${strip.name} — ${tierFullName} · ${initialDb.toFixed(1)} dB peak`,
  },
    el('div', { class: 'strip-group-bar', style: { background: accentColor } }),
    groupTag,
    el('div', { class: 'strip-name', style: { color: stripColor } }, strip.name),
    meter,
    el('div', { class: 'strip-readout' },
      el('span', { class: `strip-tier ${tierClass}` }, tierLetter),
      el('span', { class: 'strip-db' }, `${initialDb.toFixed(1)} dB`),
    ),
    el('div', { class: 'strip-fader' },
      el('span', { class: 'knob', style: { left: faderPct + '%', background: stripColor } })
    ),
  );
  return node;
}

function renderMasterStrip() {
  const avg = SKILL_STRIPS.reduce((a, s) => a + s.proficiency, 0) / SKILL_STRIPS.length;
  const meter = el('div', { class: 'strip-meter' });
  meter.append(el('span', { class: 'col' }), el('span', { class: 'col' }));
  const initialDb = levelToDb(avg / 100);

  return el('div', {
    class: 'mixer-strip skill-strip master',
    dataset: { idx: '99', proficiency: String(avg) },
    title: `MASTER — summed skills · ${initialDb.toFixed(1)} dB peak`,
  },
    el('div', { class: 'strip-group-bar', style: { background: 'var(--fg)' } }),
    el('div', { class: 'strip-group-label', style: { color: 'var(--fg-3)' } }, 'BUS'),
    el('div', { class: 'strip-name', style: { color: 'var(--fg)' } }, 'MASTER'),
    meter,
    el('div', { class: 'strip-readout' },
      el('span', { class: 'strip-tier', style: { color: 'var(--fg-3)' } }, 'Σ'),
      el('span', { class: 'strip-db' }, `${initialDb.toFixed(1)} dB`),
    ),
    el('div', { class: 'strip-fader' },
      el('span', { class: 'knob', style: { left: avg + '%', background: 'var(--fg)' } })
    ),
  );
}

const peakHold = new Map(); // idx → { value }
const PEAK_DECAY = 0.92;

function currentLevelForStrip(node, tick) {
  const idx = Number(node.dataset.idx);
  const proficiency = Number(node.dataset.proficiency) / 100; // 0..1 ceiling
  const seed = idx * 13 + 7;

  let base;
  if (!state.playing) {
    base = proficiency * 0.12 + ((seed % 20) / 400);
  } else {
    const t = tick * 0.6 + seed;
    // oscillate in [0.78, 1.0] * proficiency
    const wob = 0.5 + 0.5 * Math.sin(t * 0.7) * Math.cos(t * 0.3 + seed);
    base = proficiency * (0.78 + 0.22 * wob);
  }
  return { level: base, idx, proficiency };
}

function updateMixerMeters() {
  const tick = state.meterTick;
  document.querySelectorAll('.mixer-strip.skill-strip').forEach(node => {
    const { level, idx } = currentLevelForStrip(node, tick);

    const cols = node.querySelectorAll('.strip-meter .col');
    cols.forEach((c, i) => {
      const lvl = Math.max(0.04, Math.min(1, level * (1 - i * 0.18) + (Math.sin((tick + idx * (i + 1)) * 0.4) * 0.05)));
      c.style.transform = `scaleY(${lvl})`;
    });

    // peak hold decays
    const prev = peakHold.get(idx) || { value: 0 };
    const peak = level > prev.value ? level : prev.value * PEAK_DECAY;
    peakHold.set(idx, { value: peak });

    // refresh dB readout at a slower cadence to keep numbers stable
    if (tick % 3 === 0) {
      const dbEl = node.querySelector('.strip-db');
      if (dbEl) dbEl.textContent = `${levelToDb(peak).toFixed(1)} dB`;
    }
  });
}

/* ---------------- VIEW ROUTER ---------------- */

function renderArticleView({ kind, id }) {
  if (kind === 'devblog') return renderDevblogArticle(id);
  if (kind === 'project') return renderProjectArticle(id);
  return el('div', null, 'unknown article');
}

function articleHeader(crumb, label) {
  return el('div', { class: 'article-head' },
    el('button', { class: 'article-back', onclick: closeArticle }, '← back to ' + crumb),
    el('div', { class: 'article-label' }, label),
  );
}

function renderDevblogArticle(idx) {
  const post = DEVBLOG[idx];
  if (!post) return el('div', null, 'post not found');
  const nextPost = DEVBLOG[idx + 1] || DEVBLOG[0]; // wrap

  const wrap = el('div', { class: 'article' });
  wrap.append(articleHeader('devblog', `POST · ${post.num}`));

  const body = el('div', { class: 'article-body' });
  body.append(
    el('h1', { style: { color: `var(--clip-${post.color})` } }, post.title),
    el('div', { class: 'article-meta' },
      el('span', null, post.date),
      el('span', null, '·'),
      el('span', null, post.read),
      el('span', null, '·'),
      ...post.tags.map(t => el('span', { class: 'article-tag' }, '#' + t)),
    ),
    ...post.body.map(p => el('p', null, p)),
    el('div', { class: 'article-next' },
      el('div', { class: 'lbl' }, 'next post'),
      el('button', {
        class: 'article-next-link',
        onclick: () => openArticle('devblog', DEVBLOG.indexOf(nextPost)),
      },
        `${nextPost.num} · ${nextPost.title}  →`
      ),
    ),
  );
  wrap.append(body);
  return wrap;
}

function renderProjectArticle(id) {
  const [ri, ci] = id.split('-').map(Number);
  const project = PROJECTS[ri] && PROJECTS[ri][ci];
  if (!project) return el('div', null, 'project not found');

  const wrap = el('div', { class: 'article' });
  wrap.append(articleHeader('session', `PROJECT · ${project.name}`));

  const body = el('div', { class: 'article-body' });
  body.append(
    el('h1', { style: { color: `var(--clip-${project.color})` } }, project.name),
    el('div', { class: 'article-meta' },
      el('span', null, project.tag),
      project.bpm ? el('span', null, '·') : null,
      project.bpm ? el('span', null, `${project.bpm} BPM`) : null,
      project.key && project.key !== '—' ? el('span', null, '·') : null,
      project.key && project.key !== '—' ? el('span', null, project.key) : null,
    ),
    el('div', { class: 'article-chiprow' },
      ...(project.tech || []).map(t => el('span', { class: 'article-tech-chip' }, t)),
    ),
    el('div', { class: 'article-linkrow' },
      el('a', { class: 'article-link-btn', href: project.links?.repo || '#' }, 'repo  →'),
      el('a', { class: 'article-link-btn', href: project.links?.readme || '#' }, 'readme  →'),
    ),
    ...project.body.map(p => el('p', null, p)),
  );
  wrap.append(body);
  return wrap;
}

function openClipPopover(link, anchorEl) {
  closeClipPopover();
  const rect = anchorEl.getBoundingClientRect();
  state.clipPopover = {
    link,
    anchor: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width },
  };
  renderClipPopover();
}

function closeClipPopover() {
  state.clipPopover = null;
  const existing = document.getElementById('clip-popover');
  if (existing) existing.remove();
  const dismisser = document.getElementById('clip-popover-dismisser');
  if (dismisser) dismisser.remove();
}

function renderClipPopover() {
  const pop = state.clipPopover;
  if (!pop) return;
  const { link, anchor } = pop;

  let title, blurb, linkLabel, onLink;
  if (link.kind === 'project') {
    const [ri, ci] = link.id.split('-').map(Number);
    const project = PROJECTS[ri] && PROJECTS[ri][ci];
    if (!project) return;
    title = project.name;
    blurb = (project.body && project.body[0]) || '';
    linkLabel = 'open project article →';
    onLink = () => { closeClipPopover(); openArticle('project', link.id); };
  } else if (link.kind === 'release') {
    const r = RELEASES[link.id];
    if (!r) return;
    title = r.title;
    blurb = `${r.kind} · ${r.year} · ${r.label}${r.blurb ? ' — ' + r.blurb : ''}`;
    linkLabel = 'play in releases →';
    onLink = () => {
      closeClipPopover();
      setView('releases');
      state.releasePlaying = link.id;
      state.releaseProgress = 0;
      kickReleaseLoop();
    };
  } else {
    return;
  }

  // dismisser (full-screen invisible click target behind popover)
  const dismisser = el('div', {
    id: 'clip-popover-dismisser',
    onclick: closeClipPopover,
  });
  document.body.appendChild(dismisser);

  const popover = el('div', { id: 'clip-popover', class: 'clip-popover' },
    el('div', { class: 'clip-popover-head' },
      el('div', { class: 'clip-popover-title' }, title),
      el('button', { class: 'clip-popover-close', onclick: closeClipPopover, title: 'close' }, '×'),
    ),
    el('div', { class: 'clip-popover-blurb' }, blurb || 'No summary yet.'),
    el('button', { class: 'clip-popover-link', onclick: onLink }, linkLabel),
  );
  document.body.appendChild(popover);

  // position: prefer below clip, fall back above if no room
  const popRect = popover.getBoundingClientRect();
  const margin = 8;
  let top = anchor.bottom + margin;
  if (top + popRect.height > window.innerHeight - margin) {
    top = Math.max(margin, anchor.top - popRect.height - margin);
  }
  let left = anchor.left + anchor.width / 2 - popRect.width / 2;
  left = Math.max(margin, Math.min(window.innerWidth - popRect.width - margin, left));
  popover.style.top = top + 'px';
  popover.style.left = left + 'px';
}

function openArticle(kind, id) {
  state.openPost = { kind, id };
  renderPanel();
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

function closeArticle() {
  if (!state.openPost) return;
  state.openPost = null;
  renderPanel();
}

function setView(v) {
  state.view = v;
  state.openPost = null;
  closeClipPopover();
  renderTransport();
  renderPanel();
}

function renderPanel() {
  const panel = $('.panel');
  panel.innerHTML = '';
  panel.dataset.screenLabel = state.openPost ? `${state.view} · article` : state.view;

  if (state.openPost) {
    panel.append(renderArticleView(state.openPost));
    return;
  }

  let body;
  switch (state.view) {
    case 'arrange':     body = renderArrangeView();     break;
    case 'session':     body = renderSessionView();     break;
    case 'devblog':     body = renderDevblogView();     break;
    case 'releases':    body = renderReleasesView();    break;
    case 'music notes': body = renderMusicBlogView();   break;
    case 'about':       body = renderAboutView();       break;
    default:            body = renderArrangeView();
  }
  panel.append(body);
}

/* ---------------- ANIMATION LOOPS ---------------- */

let meterTimer = null;
function kickMeterLoop() {
  if (meterTimer) { clearInterval(meterTimer); meterTimer = null; }
  if (!state.playing) {
    // still update once so meters fall to idle
    updateMixerMeters();
    return;
  }
  meterTimer = setInterval(() => {
    state.meterTick++;
    updateMixerMeters();
  }, 90);
}

let positionTimer = null;
function kickPositionLoop() {
  if (positionTimer) { clearInterval(positionTimer); positionTimer = null; }
  if (!state.playing) return;
  let bar = 1, beat = 1, sub = 1;
  // parse current position so we continue where we left off
  const m = state.pos.match(/(\d+)\.(\d+)\.(\d+)/);
  if (m) { bar = +m[1]; beat = +m[2]; sub = +m[3]; }
  const tick = 60_000 / state.tempo / 4;
  positionTimer = setInterval(() => {
    sub++;
    if (sub > 4) { sub = 1; beat++; }
    if (beat > 4) { beat = 1; bar++; }
    if (bar > 999) bar = 1;
    state.pos = `${bar}.${beat}.${sub}`;
    const posEl = document.getElementById('pos-display');
    if (posEl) posEl.textContent = state.pos;
  }, tick);
}

let playheadTimer = null;
function kickPlayheadLoop() {
  if (playheadTimer) { clearInterval(playheadTimer); playheadTimer = null; }
  if (!state.playing) return;
  playheadTimer = setInterval(() => {
    state.ph = (state.ph >= ARR_YEARS ? 0 : state.ph + 0.04);
    const ph = document.getElementById('playhead');
    if (ph) ph.style.left = (state.ph * arrPxPerUnit) + 'px';
  }, 60);
}

let releaseTimer = null;
function kickReleaseLoop() {
  if (releaseTimer) { clearInterval(releaseTimer); releaseTimer = null; }
  if (state.releasePlaying == null) return;
  releaseTimer = setInterval(() => {
    if (state.releasePlaying == null) {
      clearInterval(releaseTimer);
      releaseTimer = null;
      return;
    }
    state.releaseProgress = state.releaseProgress >= 0.98 ? 0 : state.releaseProgress + 0.005;
    if (state.view === 'releases') refreshReleaseRow(state.releasePlaying);
  }, 150);
}

/* ---------------- KEY HANDLERS ---------------- */

function bindKeys() {
  window.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'Escape') {
      if (state.clipPopover) {
        e.preventDefault();
        closeClipPopover();
        return;
      }
      if (state.openPost) {
        e.preventDefault();
        closeArticle();
        return;
      }
    }
    if (e.code === 'Space') {
      e.preventDefault();
      state.playing = !state.playing;
      renderTransport();
      renderTitleBar();
      kickMeterLoop(); kickPositionLoop(); kickPlayheadLoop();
      return;
    }
    if (e.key === '1') setView('arrange');
    if (e.key === '2') setView('session');
    if (e.key === '3') setView('devblog');
    if (e.key === '4') setView('releases');
    if (e.key === '5') setView('music notes');
    if (e.key === '6') setView('about');
  });
}

/* ---------------- BOOT ---------------- */

function boot() {
  renderTitleBar();
  renderTransport();
  renderPanel();
  renderMixer();
  bindKeys();
  kickMeterLoop();
  kickPositionLoop();
  kickPlayheadLoop();
}

document.addEventListener('DOMContentLoaded', boot);
