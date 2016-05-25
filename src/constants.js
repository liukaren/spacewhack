import Sound from 'react-native-sound'

// Subject to change
export const PLANET_NAME = 'Planet BunBun'
export const SHIP_NAME = 'Starship Carrot'

export const GAME_STATES = {
    SPLASH_SCREEN: 1,
    LEVEL_SCREEN: 2,
    IN_GAME: 3,
    PAUSE_SCREEN: 4
}

export const MOLE_TYPES = [{
    image: require('../images/purple.png'),
    boppedImage: require('../images/purpleBopped.png'),
    bopsNeeded: 1,
    lifeValue: 0,
    likelihoodWeight: 1,
    scoreValue: 10
}, {
    image: require('../images/yellow.png'),
    boppedImage: require('../images/yellowBopped.png'),
    bopsNeeded: 2,
    lifeValue: 0,
    likelihoodWeight: 1,
    scoreValue: 25
}, {
    image: require('../images/bunny.png'),
    boppedImage: require('../images/bunnyBopped.png'),
    bopsNeeded: 1,
    lifeValue: -1,
    likelihoodWeight: 0.5,
    scoreValue: 0
}, {
    image: require('../images/heart.png'),
    boppedImage: require('../images/heart.png'),
    bopsNeeded: 1,
    lifeValue: 1,
    likelihoodWeight: 0.2,
    scoreValue: 0
}]

export const MOLE_STATES = {
    DEFAULT: 1,
    BOPPED: 2,
    DEFEATED: 3,
    EVADING: 4
}

export const LEVELS = [{
    numCols: 3,
    numRows: 5
}]

export const INITIAL_LIVES = 3
export const MAX_LIVES = 4

// -------- TIMING --------

// How long to wait before adding another mole. The actual value will fall between MIN and MAX.
export const ADD_INTERVAL_MIN_MS = 2000
const ADD_INTERVAL_MAX_MS = 3000
export const ADD_INTERVAL_RANGE_MS = ADD_INTERVAL_MAX_MS - ADD_INTERVAL_MIN_MS

export const MOLE_DURATION_MS = 2500 // How long a mole stays after it is added
export const MOLE_ANIMATION_MS = 500 // How long to animate entering / exiting
export const WORMHOLE_ANIMATION_MS = 1000 // How long to animate the wormhole opening and closing
export const MOLE_DELAY_MS = 500 // How long to wait between opening the wormhole and showing the mole

// -------- DRAWING --------

export const GUTTER = 10 // TODO: make this responsive?
export const MAIN_FONT = 'Avenir Next'
export const MOLE_SHRINK_SCALE = 0.5
export const NAV_HEIGHT = 40 // TODO: make this responsive?

// -------- SOUNDS --------
export const SOUND_BOP = new Sound('pop.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) { console.log('failed to load the sound', error) }
})

// -------- IMAGES --------
export const IMG_SOUND_ON = require('../images/soundOn.png')
export const IMG_SOUND_OFF = require('../images/soundOff.png')
