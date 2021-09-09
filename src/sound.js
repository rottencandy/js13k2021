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

const soundPlayer = (data) => {
  const ele = makeAudioElement();
  loadToElement(ele, data);

  return () => {
    // load is used to replay if element is already playing
    //ele.load();
    ele.currentTime = 0;
    ele.play();
  };
};

// }}}

// Sound data {{{

const cubeMoveSoundData = {
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

const cubeFallSoundData = {
  songData: [
    { // Instrument 0
      i: [
      2, // OSC1_WAVEFORM
      100, // OSC1_VOL
      128, // OSC1_SEMI
      0, // OSC1_XENV
      3, // OSC2_WAVEFORM
      201, // OSC2_VOL
      105, // OSC2_SEMI
      0, // OSC2_DETUNE
      0, // OSC2_XENV
      0, // NOISE_VOL
      19, // ENV_ATTACK
      6, // ENV_SUSTAIN
      56, // ENV_RELEASE
      0, // ENV_EXP_DECAY
      0, // ARP_CHORD
      0, // ARP_SPEED
      0, // LFO_WAVEFORM
      0, // LFO_AMT
      0, // LFO_FREQ
      1, // LFO_FX_FREQ
      2, // FX_FILTER
      13, // FX_FREQ
      0, // FX_RESONANCE
      0, // FX_DIST
      32, // FX_DRIVE
      147, // FX_PAN_AMT
      2, // FX_PAN_FREQ
      28, // FX_DELAY_AMT
      6 // FX_DELAY_TIME
      ],
      // Patterns
      p: [1],
      // Columns
      c: [
        {n: [120],
         f: []}
      ]
    },
  ],
  rowLen: 5513,   // In sample lengths
  patternLen: 10,  // Rows per pattern
  endPattern: 0,  // End pattern
  numChannels: 1  // Number of channels
};

const levelStartSoundData = {
  songData: [
    { // Instrument 0
      i: [
      0, // OSC1_WAVEFORM
      194, // OSC1_VOL
      128, // OSC1_SEMI
      0, // OSC1_XENV
      0, // OSC2_WAVEFORM
      198, // OSC2_VOL
      128, // OSC2_SEMI
      6, // OSC2_DETUNE
      0, // OSC2_XENV
      0, // NOISE_VOL
      61, // ENV_ATTACK
      32, // ENV_SUSTAIN
      123, // ENV_RELEASE
      0, // ENV_EXP_DECAY
      0, // ARP_CHORD
      0, // ARP_SPEED
      0, // LFO_WAVEFORM
      0, // LFO_AMT
      4, // LFO_FREQ
      1, // LFO_FX_FREQ
      2, // FX_FILTER
      15, // FX_FREQ
      86, // FX_RESONANCE
      7, // FX_DIST
      32, // FX_DRIVE
      112, // FX_PAN_AMT
      4, // FX_PAN_FREQ
      25, // FX_DELAY_AMT
      2 // FX_DELAY_TIME
      ],
      // Patterns
      p: [1],
      // Columns
      c: [
        {n: [154],
         f: []}
      ]
    },
  ],
  rowLen: 5513,   // In sample lengths
  patternLen: 15,  // Rows per pattern
  endPattern: 0,  // End pattern
  numChannels: 1  // Number of channels
};

const levelEndSoundData = {
  songData: [
    { // Instrument 0
      i: [
      0, // OSC1_WAVEFORM
      138, // OSC1_VOL
      116, // OSC1_SEMI
      0, // OSC1_XENV
      0, // OSC2_WAVEFORM
      138, // OSC2_VOL
      128, // OSC2_SEMI
      4, // OSC2_DETUNE
      0, // OSC2_XENV
      0, // NOISE_VOL
      29, // ENV_ATTACK
      48, // ENV_SUSTAIN
      75, // ENV_RELEASE
      63, // ENV_EXP_DECAY
      124, // ARP_CHORD
      3, // ARP_SPEED
      0, // LFO_WAVEFORM
      0, // LFO_AMT
      0, // LFO_FREQ
      1, // LFO_FX_FREQ
      2, // FX_FILTER
      147, // FX_FREQ
      160, // FX_RESONANCE
      3, // FX_DIST
      32, // FX_DRIVE
      130, // FX_PAN_AMT
      2, // FX_PAN_FREQ
      60, // FX_DELAY_AMT
      5 // FX_DELAY_TIME
      ],
      // Patterns
      p: [1],
      // Columns
      c: [
        {n: [156],
         f: []}
      ]
    },
  ],
  rowLen: 5513,   // In sample lengths
  patternLen: 15,  // Rows per pattern
  endPattern: 0,  // End pattern
  numChannels: 1  // Number of channels
};

// }}}

// NOTE: Sounds cannot be played before user has interacted with the page

export const playCubeMoveSound = soundPlayer(cubeMoveSoundData);
export const playCubeFallSound = soundPlayer(cubeFallSoundData);
export const playLevelEndSound = soundPlayer(levelEndSoundData);
export const playLevelStartSound = soundPlayer(levelStartSoundData);

// vim: fdm=marker:et:sw=2:
