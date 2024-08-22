let notes = [];
let keyboardNotes = {};
let synth;
let soundEnabled = false;
let toggleButton;

// Color palette inspired by the Shared Piano image
const colorPalette = [
  '#E6194B', '#3CB44B', '#FFE119', '#4363D8', '#F58231', '#911EB4',
  '#46F0F0', '#F032E6', '#BCF60C', '#FABEBE', '#008080', '#E6BEFF'
];

const keyMap = {
  'a': 261.63, 'w': 277.18, 's': 293.66, 'e': 311.13, 'd': 329.63,
  'f': 349.23, 't': 369.99, 'g': 392.00, 'y': 415.30, 'h': 440.00,
  'u': 466.16, 'j': 493.88, 'k': 523.25, 'o': 554.37, 'l': 587.33,
  'p': 622.25, ';': 659.26,
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  // Initialize synth
  synth = new p5.PolySynth();

  // Create toggle button
  toggleButton = createButton('Enable Sound');
  toggleButton.position(20, 20);
  toggleButton.mousePressed(toggleSound);
}

function draw() {
  background(0, 20); // Slight fade effect

  for (let i = notes.length - 1; i >= 0; i--) {
    let note = notes[i];
    updateNote(note);
    drawNote(note);

    if (note.alpha <= 0) {
      notes.splice(i, 1);
    }
  }
}

function updateNote(note) {
  note.y += 1.5; // Move down slower
  note.x += note.vx; // Add some horizontal movement
  note.vx *= 0.99; // Slow down horizontal movement
  note.radius *= 0.997; // Shrink slowly
  note.alpha -= 0.3; // Fade out slower

  // Bounce off walls
  if (note.x < 0 || note.x > width) {
    note.vx *= -1;
  }

  // Add new point to path
  note.path.push({ x: note.x, y: note.y, radius: note.radius });

  // Remove old points from path
  if (note.path.length > 60) {
    note.path.shift();
  }
}

function drawNote(note) {
  noStroke();

  // Draw path
  for (let i = 0; i < note.path.length; i++) {
    let point = note.path[i];
    let alpha = map(i, 0, note.path.length, 0, note.alpha);
    fill(note.color[0], note.color[1], note.color[2], alpha);
    ellipse(point.x, point.y, point.radius * 2);
  }

  // Draw main drop
  fill(note.color[0], note.color[1], note.color[2], note.alpha);
  ellipse(note.x, note.y, note.radius * 2);
}

function keyPressed() {
  if (keyboardNotes[key]) return; // Prevent key repeat

  let freq = getPitchFromKey(key);
  if (freq !== null) {
    keyboardNotes[key] = true;
    addNote(freq, 100); // Use a default velocity of 100 for keyboard input
  }
}

function keyReleased() {
  let freq = getPitchFromKey(key);
  if (freq !== null) {
    delete keyboardNotes[key];
    // We won't remove notes immediately for this visualization
  }
}

function getPitchFromKey(key) {
  return keyMap[key.toLowerCase()] || null;
}

function addNote(freq, velocity) {
  let colorIndex = Math.round(map(freq, 261.63, 659.26, 0, 11));
  let color = hexToRgb(colorPalette[colorIndex]);

  let note = {
    freq: freq,
    velocity: velocity,
    x: map(freq, 261.63, 659.26, 0, width), // Map frequency to x-position
    y: 0,
    vx: random(-1, 1),
    radius: map(velocity, 0, 127, 15, 60),
    color: color,
    alpha: 255,
    path: []
  };
  notes.push(note);
  if (soundEnabled) {
    playNote(freq, velocity);
  }
}

function playNote(freq, velocity) {
  // Play the note
  synth.play(freq, velocity / 127, 0, 0.3);
}

function hexToRgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    userStartAudio();
    toggleButton.html('Disable Sound');
  } else {
    toggleButton.html('Enable Sound');
  }
}