export const MOLE_TYPES = [{
    image: require('../images/purple.png'),
    boppedImage: require('../images/purpleBopped.png'),
    bopsNeeded: 1,
    likelihoodWeight: 1,
    scoreValue: 10
}, {
    image: require('../images/yellow.png'),
    boppedImage: require('../images/yellowBopped.png'),
    bopsNeeded: 2,
    likelihoodWeight: 1,
    scoreValue: 25
}, {
    image: require('../images/bunny.png'),
    boppedImage: require('../images/bunnyBopped.png'),
    bopsNeeded: 1,
    likelihoodWeight: 0.5,
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

export const MOLE_SHRINK_SCALE = 0.5
export const NAV_HEIGHT = 40 // TODO: make this based on screen size?
