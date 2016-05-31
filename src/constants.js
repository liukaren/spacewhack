import Sound from 'react-native-sound'

export const GAME_STATES = {
    SPLASH_SCREEN: 1,
    LEVEL_SCREEN: 2,
    IN_GAME: 3,
    PAUSE_SCREEN: 4,
    GAME_OVER_SCREEN: 5
}

export const MOLE_TYPES = [{
    image: require('../images/purple.png'),
    boppedImage: require('../images/purpleBopped.png'),
    bopsNeeded: 1,
    lifeValue: 0,
    likelihoodWeight: 1,
    missedLifeValue: -1,
    scoreValue: 10
}, {
    image: require('../images/yellow.png'),
    boppedImage: require('../images/yellowBopped.png'),
    bopsNeeded: 2,
    lifeValue: 0,
    likelihoodWeight: 1,
    missedLifeValue: -1,
    scoreValue: 25
}, {
    image: require('../images/bunny.png'),
    boppedImage: require('../images/bunnyBopped.png'),
    bopsNeeded: 1,
    lifeValue: -1,
    likelihoodWeight: 0.5,
    missedLifeValue: 0,
    scoreValue: 0
}, {
    image: require('../images/heart.png'),
    boppedImage: require('../images/heart.png'),
    bopsNeeded: 1,
    lifeValue: 1,
    likelihoodWeight: 0.2,
    missedLifeValue: 0,
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
    numRows: 5,
    moleDurationMs: 2500, // How long a mole stays after it is added
    winCondition: (state) => state.numMolesShown === 1
}, {
    numCols: 6,
    numRows: 10,
    moleDurationMs: 2500,
    winCondition: () => false
}]

export const INITIAL_LIVES = 3
export const MAX_LIVES = 4

// -------- TIMING --------

// How long to wait before adding another mole. The actual value will fall between MIN and MAX.
export const ADD_INTERVAL_MIN_MS = 2000
const ADD_INTERVAL_MAX_MS = 3000
export const ADD_INTERVAL_RANGE_MS = ADD_INTERVAL_MAX_MS - ADD_INTERVAL_MIN_MS

export const MOLE_ANIMATION_MS = 500 // How long to animate entering / exiting
export const WORMHOLE_ANIMATION_MS = 1000 // How long to animate the wormhole opening and closing
export const MOLE_DELAY_MS = 500 // How long to wait between opening the wormhole and showing the mole

// -------- DRAWING --------

export const GUTTER = 10 // TODO: make this responsive?
export const MAIN_FONT = 'Avenir Next'
export const MOLE_SHRINK_SCALE = 0.5
export const NAV_HEIGHT = 40 // TODO: make this responsive?
export const POSITION_FILL = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
}
export const MOLE_LEAVE_MS = 500

// -------- SOUNDS --------

function loadSound(fileName) {
    return new Sound(fileName, Sound.MAIN_BUNDLE, (error) => {
        if (error) { console.log(`Failed to load sound file: ${fileName}`, error) }
    })
}

export const SOUNDS = {
    BOP: loadSound('pop.mp3'),
    BOMB: loadSound('bomb.wav'),
    MENU_SONG: loadSound('menu.mp3'),
    MAIN_SONG: loadSound('subdream.mp3')
}

// -------- IMAGES --------

export const IMG_BOMB = require('../images/bomb.png')
export const IMG_SOUND_ON = require('../images/soundOn.png')
export const IMG_SOUND_OFF = require('../images/soundOff.png')
export const IMG_ENEMY = require('../images/purple.png')
export const IMG_INNOCENT = require('../images/bunny.png')
