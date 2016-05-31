import { Animated, Easing } from 'react-native'
import { ReduceStore } from 'flux/utils'
import Events from 'events'
import Actions from './actions.js'
import Dispatcher from './dispatcher.js'
import * as Constants from '../constants.js'
import * as Helpers from '../helpers.js'
import Timer from '../timer.js'

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

function getResetLevelState(currentState, level) {
    return {
        board: getEmptyBoard(level),
        damageAnimValue: new Animated.Value(0),
        gameState: Constants.GAME_STATES.LEVEL_SCREEN,
        level,
        lives: Constants.INITIAL_LIVES,
        score: currentState.score,
        numMolesShown: 0
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
        numMolesShown: 0
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
    // TODO: Filter out types that are not available in this level.
    // Pick a random mole based on its likelihood weight.
    const totalWeight = Constants.MOLE_TYPES.reduce((sum, moleType) => (
        moleType.likelihoodWeight + sum
    ), 0)

    let moleType
    const randomNum = Math.random() * totalWeight
    for (let i = 0, accruedWeight = 0; i < Constants.MOLE_TYPES.length; i++) {
        accruedWeight += Constants.MOLE_TYPES[i].likelihoodWeight
        if (randomNum < accruedWeight) {
            return Constants.MOLE_TYPES[i]
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
    }, Constants.LEVELS[state.level].moleDurationMs)

    return moleData
}

const CHANGE_EVENT = 'change'

let state = Object.assign({}, getResetGameState(), { isSoundOn: true })

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

function scheduleStep() {
    const position = getRandomPosition(state.board)

    if (state.board[position.row][position.col] === null) {
        // Only place a mole if there isn't already something here
        const moleType = getRandomMole()
        const initialMoleData = getInitialMoleData(position.row, position.col, moleType)
        state.board[position.row][position.col] = initialMoleData
        state.numMolesShown++
    }

    // Automatically queue up the next step
    const timeUntilNextStep = (Math.random() * Constants.ADD_INTERVAL_RANGE_MS) +
        Constants.ADD_INTERVAL_MIN_MS
    state.stepTimeout = new Timer(scheduleStep, timeUntilNextStep)

    GameStore.emitChange()
}

function bopMole(row, col) {
    const moleData = state.board[row][col]

    // Do nothing if the mole is already defeated or leaving
    if (moleData.moleState === Constants.MOLE_STATES.DEFEATED ||
        moleData.moleState === Constants.MOLE_STATES.EVADING) { return }

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

        // When the animation is finished, remove the mole
        moleData.moleState = Constants.MOLE_STATES.DEFEATED
        bopAnimation.start(() => {
            clearMole(row, col, moleData.moleType.lifeValue, moleData.moleType.scoreValue)
            GameStore.emitChange()
        })

        advanceLevelIfWon()
    } else {
        // When the animation is finished, reset state
        moleData.moleState = Constants.MOLE_STATES.BOPPED
        bopAnimation.start(() => {
            moleData.moleState = Constants.MOLE_STATES.DEFAULT
            GameStore.emitChange()
        })
    }
}

function advanceLevelIfWon() {
    if (Constants.LEVELS[state.level].winCondition(state)) {
        pauseGame()
        state = getResetLevelState(state, state.level + 1)
        GameStore.emitChange()
    }
}

function pauseGame() {
    state.stepTimeout.pause()
    state.board.map((row) => {
        row.map((col) => col && col.removeTimeout.pause())
    })
}

function resumeGame() {
    state.stepTimeout.resume()
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
}

function clearMole(row, col, lifeChange, scoreChange) {
    state.board[row][col] = null
    state.lives = Math.min(state.lives + lifeChange, Constants.MAX_LIVES)
    state.score = state.score + scoreChange

    // If the player sustained damage, animate the impact.
    if (lifeChange < 0) {
        state.damageAnimValue = new Animated.Value(0)
        Animated.timing(state.damageAnimValue,
            { toValue: 1, easing: Easing.easeOut }).start()
    }

    if (state.lives === 0) {
        gameOver()
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
        case Actions.GAME_OVER:
            gameOver()
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
