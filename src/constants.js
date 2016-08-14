import Sound from 'react-native-sound'

// -------- POSSIBLE STATES --------

export const GAME_STATES = {
    SPLASH_SCREEN: 1,
    LEVEL_SCREEN: 2,
    IN_GAME: 3,
    PAUSE_SCREEN: 4,
    GAME_OVER_SCREEN: 5
}

export const MOLE_STATES = {
    DEFAULT: 1,
    BOPPED: 2,
    DEFEATED: 3,
    EVADING: 4
}

// -------- TIMING --------

export const MOLE_ANIMATION_MS = 500 // How long to animate entering / exiting
export const WORMHOLE_ANIMATION_MS = 1000 // How long to animate the wormhole opening and closing
export const MOLE_DELAY_MS = 500 // How long to wait between opening the wormhole and showing the mole

// -------- DRAWING --------

export const GUTTER = 10 // TODO: make this responsive?
export const SPLASH_FONT = 'PLENTO'
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

export const IMG_BACKGROUND = require('../images/space.png')
export const IMG_BOMB = require('../images/bomb.png')
export const IMG_ENEMY = require('../images/purple.png')
export const IMG_ENEMY_BOPPED = require('../images/purpleBopped.png')
export const IMG_ENEMY_HARD = require('../images/yellow.png')
export const IMG_ENEMY_HARD_BOPPED = require('../images/yellowBopped.png')
export const IMG_ENEMY_NUMBER = require('../images/pink.png')
export const IMG_ENEMY_NUMBER_BOPPED = require('../images/pinkBopped.png')
export const IMG_INNOCENT = require('../images/bunny.png')
export const IMG_INNOCENT_BOPPED = require('../images/bunnyBopped.png')
export const IMG_SATELLITE = require('../images/satellite.png')
export const IMG_LIFE = require('../images/heart.png')
export const IMG_PAUSE = require('../images/pause.png')
export const IMG_PLANET = require('../images/planet.png')
export const IMG_ROCK = require('../images/rock.png')
export const IMG_SOUND_ON = require('../images/soundOn.png')
export const IMG_SOUND_OFF = require('../images/soundOff.png')
export const IMG_WORMHOLE =  require('../images/wormhole.png')

// -------- OTHER --------

export const MOLE_TYPES = {
    ENEMY: {
        image: IMG_ENEMY,
        boppedImage: IMG_ENEMY_BOPPED,
        bopsNeeded: 1,
        lifeValue: 0,
        likelihoodWeight: 1,
        missedLifeValue: -1,
        scoreValue: 10
    },
    ENEMY_HARD: {
        image: IMG_ENEMY_HARD,
        boppedImage: IMG_ENEMY_HARD_BOPPED,
        bopsNeeded: 2,
        lifeValue: 0,
        likelihoodWeight: 1,
        missedLifeValue: -1,
        scoreValue: 25
    },
    INNOCENT: {
        image: IMG_INNOCENT,
        boppedImage: IMG_INNOCENT_BOPPED,
        bopsNeeded: 1,
        lifeValue: -1,
        likelihoodWeight: 0.5,
        missedLifeValue: 0,
        scoreValue: 0
    },
    LIFE: {
        image: IMG_LIFE,
        boppedImage: IMG_LIFE,
        bopsNeeded: 1,
        lifeValue: 1,
        likelihoodWeight: 0.2,
        missedLifeValue: 0,
        scoreValue: 0
    },

    NUMBER: {
        image: IMG_SATELLITE,
        boppedImage: IMG_SATELLITE,
        bopsNeeded: 1,
        lifeValue: 0,
        likelihoodWeight: 1,
        missedLifeValue: 0,
        scoreValue: 0
    },

    // Only the last numbered mole counts for anything. If missed, it damages
    // the player, if hit, it awards points. However, numbered moles can only
    // be hit in order.
    NUMBER_LAST: {
        image: IMG_ENEMY_NUMBER,
        boppedImage: IMG_ENEMY_NUMBER_BOPPED,
        bopsNeeded: 1,
        lifeValue: 0,
        likelihoodWeight: 1,
        missedLifeValue: -1,
        scoreValue: 100,
    },
}

export const LEVELS = [{
    availableMoles: [MOLE_TYPES.ENEMY, MOLE_TYPES.LIFE],
    numCols: 3,
    numRows: 5,
    moleDurationMs: 2500, // How long a mole stays after it is added
    stepMinMs: 2000,
    stepMaxMs: 2500,
    winCondition: (state) => state.numMolesShown >= 8
}, {
    availableMoles: [MOLE_TYPES.ENEMY, MOLE_TYPES.LIFE, MOLE_TYPES.INNOCENT],
    numCols: 6,
    numRows: 10,
    moleDurationMs: 2500,
    stepMinMs: 1000,
    stepMaxMs: 2000,
    winCondition: (state) => state.numMolesShown >= 12
}, {
    availableMoles: [
        MOLE_TYPES.ENEMY, MOLE_TYPES.LIFE, MOLE_TYPES.INNOCENT, MOLE_TYPES.ENEMY_HARD
    ],
    numCols: 6,
    numRows: 10,
    moleDurationMs: 2500,
    stepMinMs: 1000,
    stepMaxMs: 2000,
    winCondition: (state) => state.numMolesShown >= 12
}, {
    availableMoles: [ // NOTE: unused, just for documentation
        MOLE_TYPES.NUMBER, MOLE_TYPES.NUMBER_LAST
    ],
    numCols: 3,
    numRows: 3,
    moleDurationMs: 6000,
    stepMinMs: 7000,
    stepMaxMs: 7000,
    winCondition: (state) => state.numWavesDefeated >= 3
}]

export const INITIAL_LIVES = 3
export const MAX_LIVES = 4
