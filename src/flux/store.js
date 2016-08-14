import { Animated, Easing } from 'react-native'
import { ReduceStore } from 'flux/utils'
import Events from 'events'
import Actions from './actions.js'
import Dispatcher from './dispatcher.js'
import * as Constants from '../constants.js'
import * as Helpers from '../helpers.js'
import Timer from '../timer.js'

const CHANGE_EVENT = 'change'
const NUMBER_LEVEL = 3

let state = Object.assign({}, getResetGameState(), { isSoundOn: true })

// http://stackoverflow.com/questions/2450954
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1

        // And swap it with the current element.
        temporaryValue = array[currentIndex]
        array[currentIndex] = array[randomIndex]
        array[randomIndex] = temporaryValue
    }

    return array
}

function getEmptyBoard(level) {
    // Initialize an empty board of `null`s
    const board = []
    const { numCols, numRows } = Constants.LEVELS[level]
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        let row = []
        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            row.push(null)
        }
        board.push(row)
    }
    return board
}

function getCurrentLevel() {
    return Constants.LEVELS[state.level]
}

function getResetLevelState(currentState, level) {
    return {
        board: getEmptyBoard(level),
        damageAnimValue: new Animated.Value(0),
        gameState: Constants.GAME_STATES.LEVEL_SCREEN,
        level,
        lives: Constants.INITIAL_LIVES,
        score: currentState.score,
        numMolesShown: 0,
        numWavesDefeated: 0,
    }
}

function getResetGameState() {
    const level = 0
    return {
        board: getEmptyBoard(level),
        damageAnimValue: new Animated.Value(0),
        gameState: Constants.GAME_STATES.SPLASH_SCREEN,
        level,
        lives: Constants.INITIAL_LIVES,
        score: 0,
        numMolesShown: 0,
        numWavesDefeated: 0,
    }
}

function getRandomPosition(board) {
    const numRows = board.length
    const numCols = board[0].length
    return {
        row: Math.floor(Math.random() * numRows),
        col: Math.floor(Math.random() * numCols)
    }
}

function getRandomMole() {
    const availableMoles = getCurrentLevel().availableMoles

    // Pick a random mole based on its likelihood weight.
    const totalWeight = availableMoles.reduce((sum, moleType) => (
        moleType.likelihoodWeight + sum
    ), 0)

    let moleType
    const randomNum = Math.random() * totalWeight
    for (let i = 0, accruedWeight = 0; i < availableMoles.length; i++) {
        accruedWeight += availableMoles[i].likelihoodWeight
        if (randomNum < accruedWeight) {
            return availableMoles[i]
        }
    }
}

function getInitialMoleData(row, col, moleType) {
    let moleData = {
        animValue: new Animated.Value(0),
        wormHoleAnimValue: new Animated.Value(0),
        bopAnimValue: new Animated.Value(0),
        bombAnimValue: new Animated.Value(0),
        moleState: Constants.MOLE_STATES.DEFAULT,
        moleType,
        numBops: 0
    }

    // Animate the wormhole. Shortly after, animate the mole coming out of it
    Animated.stagger(Constants.MOLE_DELAY_MS, [
        Animated.timing(moleData.wormHoleAnimValue, {
            toValue: 1, duration: Constants.WORMHOLE_ANIMATION_MS
        }),
        Animated.spring(moleData.animValue, { toValue: 1, friction: 3 })
    ]).start()

    // After a timeout, animate the mole away and then call the parent to remove it
    moleData.removeTimeout = new Timer(() => {
        moleData.moleState = Constants.MOLE_STATES.EVADING

        const shouldLeaveBomb = moleData.moleType.missedLifeValue < 0
        if (shouldLeaveBomb) {
            Animated.timing(moleData.bombAnimValue,
                { toValue: 1, duration: Constants.MOLE_LEAVE_MS }).start()
        }

        Animated.timing(moleData.animValue, {
            toValue: 0, duration: Constants.MOLE_LEAVE_MS
        }).start(() => {
            if (shouldLeaveBomb) {
                Helpers.playSound(Constants.SOUNDS.BOMB)
            }

            clearMole(row, col, moleData.moleType.missedLifeValue, 0)
            GameStore.emitChange()
        })

        GameStore.emitChange()
    }, getCurrentLevel().moleDurationMs)

    return moleData
}

const GameStore = Object.assign({}, Events.EventEmitter.prototype, {
    emitChange() {
        this.emit(CHANGE_EVENT)
    },

    addChangeListener(callback) {
        this.on(CHANGE_EVENT, callback)
    },

    removeChangeListener(callback) {
        this.removeListener(CHANGE_EVENT, callback)
    },

    getState() {
        return state
    }
})

// This is a special level where numbered moles must be hit in order.
function numberLevelStep() {
    const currentLevel = getCurrentLevel()

    const moleNumbers = []
    for (let i = 0; i < currentLevel.numRows * currentLevel.numCols; i++) {
        moleNumbers.push(i)
    }
    shuffle(moleNumbers)

    for (let row = 0; row < currentLevel.numRows; row++) {
        for (let col = 0; col < currentLevel.numCols; col++) {
            const moleNumber = moleNumbers[row * currentLevel.numCols + col];

            let moleType = Constants.MOLE_TYPES.NUMBER
            // If it's the last mole, use the mole type that counts for damage and score
            if (moleNumber === currentLevel.numRows * currentLevel.numCols - 1) {
                moleType = Constants.MOLE_TYPES.NUMBER_LAST
            }

            let initialMoleData = getInitialMoleData(row, col, moleType)
            initialMoleData.moleNumber = moleNumber
            state.board[row][col] = initialMoleData
            state.numMolesShown++
        }
    }

    state.currentMoleNumber = 0 // Reset the mole number for the current wave
}

function scheduleStep() {
    const position = getRandomPosition(state.board)
    const currentLevel = getCurrentLevel()

    if (state.level === NUMBER_LEVEL) {
        numberLevelStep()
    } else if (state.board[position.row][position.col] === null) {
        // Only place a mole if there isn't already something here
        const moleType = getRandomMole()
        const initialMoleData = getInitialMoleData(position.row, position.col, moleType)
        state.board[position.row][position.col] = initialMoleData
        state.numMolesShown++ // TODO: Don't count powerups (and innocents?) as moles
    }

    // Check if we've already won. Don't bother queueing a step if so
    if (!currentLevel.winCondition(state)) {
        // Automatically queue up the next step
        const stepRangeMs = currentLevel.stepMaxMs - currentLevel.stepMinMs
        const timeUntilNextStep = (Math.random() * stepRangeMs) + currentLevel.stepMinMs
        state.stepTimeout = new Timer(scheduleStep, timeUntilNextStep)
    }

    GameStore.emitChange()
}

function bopMole(row, col) {
    const moleData = state.board[row][col]

    // Do nothing if the mole is already defeated or leaving
    if (moleData.moleState === Constants.MOLE_STATES.DEFEATED ||
        moleData.moleState === Constants.MOLE_STATES.EVADING) { return }

    // Do nothing if the mole is not the correct number
    if (state.level === NUMBER_LEVEL &&
        moleData.moleNumber !== state.currentMoleNumber) { return }

    // Play a sound
    Helpers.playSound(Constants.SOUNDS.BOP)

    moleData.numBops = moleData.numBops + 1

    moleData.bopAnimValue.setValue(0)
    const bopAnimation = Animated.timing(moleData.bopAnimValue, {
        toValue: 1, easing: Easing.easeIn
    })

    if (moleData.numBops >= moleData.moleType.bopsNeeded) {
        // Clear the remove timeout because the bop will remove it
        moleData.removeTimeout.clear()

        // Increment the mole number for NUMBER_LEVEL
        state.currentMoleNumber++

        // If we defeated a wave in NUMBER_LEVEL
        if (moleData.moleType === Constants.MOLE_TYPES.NUMBER_LAST) {
            state.numWavesDefeated++

            // Re-schedule the next wave for one second from now
            state.stepTimeout.clear();
            state.stepTimeout = new Timer(scheduleStep, 1000)
        }

        // When the animation is finished, remove the mole
        moleData.moleState = Constants.MOLE_STATES.DEFEATED
        bopAnimation.start(() => {
            clearMole(row, col, moleData.moleType.lifeValue, moleData.moleType.scoreValue)
            GameStore.emitChange()
        })
    } else {
        // When the animation is finished, reset state
        moleData.moleState = Constants.MOLE_STATES.BOPPED
        bopAnimation.start(() => {
            moleData.moleState = Constants.MOLE_STATES.DEFAULT
            GameStore.emitChange()
        })
    }
}

function advanceLevel() {
    pauseGame()
    state = getResetLevelState(state, state.level + 1)
    GameStore.emitChange()
}

function pauseGame() {
    state.stepTimeout && state.stepTimeout.pause()
    state.board.map((row) => {
        row.map((col) => col && col.removeTimeout.pause())
    })
}

function resumeGame() {
    state.stepTimeout && state.stepTimeout.resume()
    state.board.map((row) => {
        row.map((col) => col && col.removeTimeout.resume())
    })
}

function stopGame() {
    pauseGame()
    Constants.SOUNDS.MAIN_SONG.stop()
}

function gameOver() {
    stopGame()
    state.gameState = Constants.GAME_STATES.GAME_OVER_SCREEN
    GameStore.emitChange()
}

function clearMole(row, col, lifeChange, scoreChange) {
    state.board[row][col] = null
    state.lives = Math.min(state.lives + lifeChange, Constants.MAX_LIVES)
    state.score = state.score + scoreChange

    const won = getCurrentLevel().winCondition(state)

    // If the player sustained damage, animate the impact.
    if (lifeChange < 0) {
        state.damageAnimValue = new Animated.Value(0)
        Animated.timing(state.damageAnimValue,
            { toValue: 1, easing: Easing.easeOut }).start(() => {
                if (state.lives === 0) { gameOver() }
                if (won) { advanceLevel() }
            })
    } else {
        if (won) { advanceLevel() }
    }
}

Dispatcher.register((action) => {
    switch(action.type) {
        case Actions.START_GAME:
            Helpers.playSound(Constants.SOUNDS.MAIN_SONG, state.isSoundOn, true)
            state.gameState = Constants.GAME_STATES.LEVEL_SCREEN
            break
        case Actions.PAUSE_GAME:
            pauseGame()
            state.gameState = Constants.GAME_STATES.PAUSE_SCREEN
            break
        case Actions.RESUME_GAME:
            resumeGame()
            state.gameState = Constants.GAME_STATES.IN_GAME
            break
        case Actions.QUIT_GAME:
            stopGame()
            state = getResetGameState()
            break
        case Actions.START_LEVEL:
            state.gameState = Constants.GAME_STATES.IN_GAME
            scheduleStep()
            break
        case Actions.BOP_MOLE: {
            bopMole(action.row, action.col)
            break
        }
        case Actions.CLEAR_MOLE:
            clearMole(action.row, action.col, action.lifeChange, action.scoreChange)
            break
        case Actions.TOGGLE_SOUND:
            const newVolume = state.isSoundOn ? 0 : 1
            for (sound in Constants.SOUNDS) {
                Constants.SOUNDS[sound].setVolume(newVolume)
            }
            state.isSoundOn = !state.isSoundOn
            break
        default:
            return
    }

    GameStore.emitChange()
})

export default GameStore
