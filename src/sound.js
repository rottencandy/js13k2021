import { CPlayer } from './engine/soundbox';

// Utils {{{

const player = new CPlayer;
const makeAudioElement = () => document.createElement('audio');

const loadToElement = (ele, data) => {
  player.init(data);
  player.generate();
  const wave = player.createWave();
  ele.src = URL.createObjectURL(new Blob([wave], { type: 'audio/wav' }));
};

// }}}

// Sound data {{{

const cubeSoundData = {
  songData: [
  { // Instrument 0
   i: [
   0, // OSC1_WAVEFORM
   255, // OSC1_VOL
   128, // OSC1_SEMI
   0, // OSC1_XENV
   2, // OSC2_WAVEFORM
   255, // OSC2_VOL
   143, // OSC2_SEMI
   0, // OSC2_DETUNE
   0, // OSC2_XENV
   43, // NOISE_VOL
   0, // ENV_ATTACK
   0, // ENV_SUSTAIN
   55, // ENV_RELEASE
   95, // ENV_EXP_DECAY
   128, // ARP_CHORD
   0, // ARP_SPEED
   0, // LFO_WAVEFORM
   0, // LFO_AMT
   3, // LFO_FREQ
   1, // LFO_FX_FREQ
   2, // FX_FILTER
   94, // FX_FREQ
   79, // FX_RESONANCE
   0, // FX_DIST
   32, // FX_DRIVE
   84, // FX_PAN_AMT
   2, // FX_PAN_FREQ
   0, // FX_DELAY_AMT
   4 // FX_DELAY_TIME
  ],
  // Patterns
  p: [1],
  // Columns
  c: [
    {n: [168],
     f: []}
    ]
    },
  ],
  rowLen: 5513,   // In sample lengths
  // patternLen is originally 32, shortened since this is not a song
  patternLen: 2,  // Rows per pattern
  endPattern: 0,  // End pattern
  numChannels: 1  // Number of channels
};

// }}}

const cubeSound = makeAudioElement();

let ready = false;

export const initAudio = () => {
  loadToElement(cubeSound, cubeSoundData);
  ready = true;
};

// NOTE: Sounds cannot be played before user has interacted with the page

// load is used to replay if element is already playing
export const playCubeSound = () => {
  if (ready) {
    //cubeSound.load();
    cubeSound.currentTime = 0;
    cubeSound.play();
  }
};
// vim: fdm=marker:et:sw=2:
