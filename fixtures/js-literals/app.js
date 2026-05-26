// Tiny fixture mirroring the shape of a real personal-site app.js.
// Used by SimpleSiteEdit's tests for the js-literals detection, inference, and round-trip paths.

const POSTS = [
  { title: 'First post', date: '2024-01-15', tags: ['intro'] },
  { title: 'Second post', date: '2024-02-20', tags: ['follow-up'] },
  { title: 'Third post', date: '2024-03-10' },
];

const TRACKS = [
  { id: 't1', name: 'Lead', color: 'cyan' },
  { id: 't2', name: 'Bass', color: 'violet' },
];

// Should be skipped by SimpleSiteEdit with a "nested array" note.
const GRID = [
  [{ x: 0 }, { x: 1 }],
  [{ x: 2 }, { x: 3 }],
];

// Should be skipped by SimpleSiteEdit with an "array of string" note.
const VIEWS = ['home', 'about', 'archive'];

function render() {
  // Just a stub so the file isn't pure data.
  return POSTS.length + TRACKS.length;
}

render();
