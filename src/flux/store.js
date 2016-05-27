import { Animated, Easing } from 'react-native'
import { ReduceStore } from 'flux/utils'
import Actions from './actions.js'
import Dispatcher from './dispatcher.js'
import * as Constants from '../constants.js'
import * as Helpers from '../helpers.js'

function combineState(state, newState) {
    return Object.assign({}, state, newState)
}

function getResetState() {
    const level = 0

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

    return {
        board,
        level,
        lives: Constants.INITIAL_LIVES,
        score: 0,
        gameState: Constants.GAME_STATES.SPLASH_SCREEN,
        stepTimeout: null,
        damageAnimValue: new Animated.Value(0)
    }
}

class GameStore extends ReduceStore {
    getInitialState() {
        return Object.assign({}, getResetState(), { isSoundOn: true })
    }

    reduce(state, action) {
        switch(action.type) {
            case Actions.START_GAME:
                Helpers.playSound(Constants.SOUND_MAIN_SONG, state.isSoundOn, true)
                return combineState(state, { gameState: Constants.GAME_STATES.LEVEL_SCREEN })
            case Actions.PAUSE_GAME:
                state.stepTimeout.pause()
                return combineState(state, { gameState: Constants.GAME_STATES.PAUSE_SCREEN })
            case Actions.RESUME_GAME:
                state.stepTimeout.resume()
                return combineState(state, { gameState: Constants.GAME_STATES.IN_GAME })
            case Actions.QUIT_GAME:
                Constants.SOUND_MAIN_SONG.stop()
                state.stepTimeout.pause()
                return combineState(state, getResetState())
            case Actions.START_LEVEL:
                return combineState(state, { gameState: Constants.GAME_STATES.IN_GAME })
            case Actions.PLACE_MOLE:
                // TODO: Stop mutating the state's board
                state.board[action.row][action.col] = action.moleType
                return combineState(state, { board: state.board })
            case Actions.CLEAR_MOLE:
                // TODO: Stop mutating the state's board
                state.board[action.row][action.col] = null

                let newState = {
                    lives: Math.min(state.lives + action.lifeChange, Constants.MAX_LIVES),
                    score: state.score + action.scoreChange
                }

                if (newState.lives === 0) {
                    newState.gameState = Constants.GAME_STATES.GAME_OVER_SCREEN
                }

                // If the player sustained damage, animate the impact.
                if (action.lifeChange < 0) {
                    newState.damageAnimValue = new Animated.Value(0)
                    Animated.timing(newState.damageAnimValue,
                        { toValue: 1, easing: Easing.easeOut }).start()
                }

                return combineState(state, newState)
            case Actions.SCHEDULE_STEP:
                return combineState(state, { stepTimeout: action.stepTimeout })
            case Actions.TOGGLE_SOUND:
                return combineState(state, { isSoundOn: !state.isSoundOn })
            default:
                return state
        }
    }
}

const singleton = new GameStore(Dispatcher)
export default singleton
