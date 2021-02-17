/*************************
 * MAGENTA
 ************************/

// button mappings.
const MAPPING_8 = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7 };
const BUTTONS_DEVICE = ["a", "s", "d", "f", "j", "k", "l", ";"];

let OCTAVES = 7;
let NUM_BUTTONS = 8;
let BUTTON_MAPPING = MAPPING_8;
let keyWhitelist;
let TEMPERATURE = getTemperature();

const heldButtonToVisualData = new Map();

// Which notes the pedal is sustaining.
let sustaining = false;
let sustainingNotes = [];

const player = new Player();
const genie = new mm.PianoGenie(CONSTANTS.GENIE_CHECKPOINT);

genie.initialize();
onWindowResize();
window.addEventListener("resize", onWindowResize);
window.addEventListener("orientationchange", onWindowResize);
window.addEventListener("hashchange", () => (TEMPERATURE = getTemperature()));
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

// Slow to start up, so do a fake prediction to warm up the model.
const note = genie.nextFromKeyWhitelist(0, keyWhitelist, TEMPERATURE);

genie.resetState();


/*************************
 * Button actions
 ************************/
function buttonDown(button, fromKeyDown) {
  // If we're already holding this button down, nothing new to do.
  if (heldButtonToVisualData.has(button)) {
    return;
  }

  const note = genie.nextFromKeyWhitelist(
    BUTTON_MAPPING[button],
    keyWhitelist,
    TEMPERATURE
  );
  const pitch = CONSTANTS.LOWEST_PIANO_KEY_MIDI_NOTE + note;
  playAudio(notes[note]);
  size =.1*note;
  createNote[button] = true;
}

function playAudio(x) {
  x.load();
  x.play();
}

function pauseAudio(x) {
  x.pause();
}

/*************************
 * Events
 ************************/
function onKeyDown(event) {
  // Keydown fires continuously and we don't want that.
  if (event.repeat) {
    return;
  }
  const button = getButtonFromKeyCode(event.key);
  if (button != null) {
    buttonDown(button, true);
  }

}

function onKeyUp(event) {
  const button = getButtonFromKeyCode(event.key);
  size = 5;
  createNote[button] = false;
  grow[button] = false;
}

function onWindowResize() {
  OCTAVES = window.innerWidth > 700 ? 7 : 3;
  const bonusNotes = OCTAVES > 6 ? 4 : 0; // starts on an A, ends on a C.
  const totalNotes = CONSTANTS.NOTES_PER_OCTAVE * OCTAVES + bonusNotes;
  const totalWhiteNotes =
    CONSTANTS.WHITE_NOTES_PER_OCTAVE * OCTAVES + (bonusNotes - 1);
  keyWhitelist = Array(totalNotes)
    .fill()
    .map((x, i) => {
      if (OCTAVES > 6) return i;
      // Starting 3 semitones up on small screens (on a C), and a whole octave up.
      return i + 3 + CONSTANTS.NOTES_PER_OCTAVE;
    });
}

/*************************
 * Utils and helpers
 ************************/
function getButtonFromKeyCode(key) {
  // 1 - 8
  if (key >= "1" && key <= String(NUM_BUTTONS)) {
    return parseInt(key) - 1;
  }

  const index = BUTTONS_DEVICE.indexOf(key);
  return index !== -1 ? index : null;
}

function getTemperature() {
  const hash = parseFloat(parseHashParameters()["temperature"]) || 0.25;
  const newTemp = Math.min(1, hash);
  return newTemp;
}

function parseHashParameters() {
  const hash = window.location.hash.substring(1);
  const params = {};
  hash.split("&").map(hk => {
    let temp = hk.split("=");
    params[temp[0]] = temp[1];
  });
  return params;
}
