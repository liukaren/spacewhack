import { ReduceStore } from 'flux/utils'
import Actions from './actions.js'
import Dispatcher from './dispatcher.js'
import * as Constants from '../constants.js'

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
        gameState: Constants.GAME_STATES.INTRO
    }
}

class GameStore extends ReduceStore {
    getInitialState() {
        return Object.assign({}, getResetState(), { isSoundOn: true })
    }

    reduce(state, action) {
        switch(action.type) {
            case Actions.START_GAME:
            case Actions.RESUME_GAME:
                return combineState(state, { gameState: Constants.GAME_STATES.IN_GAME })
            case Actions.PAUSE_GAME:
                return combineState(state, { gameState: Constants.GAME_STATES.PAUSED })
            case Actions.PLACE_MOLE:
                // TODO: Stop mutating the state's board
                state.board[action.row][action.col] = action.moleType
                return combineState(state, { board: state.board })
            case Actions.CLEAR_MOLE:
                // TODO: Stop mutating the state's board
                state.board[action.row][action.col] = null
                const lifeValue = action.lifeValue || 0
                const scoreValue = action.scoreValue || 0
                return combineState(state, {
                    lives: Math.min(state.lives + lifeValue, Constants.MAX_LIVES),
                    score: state.score + scoreValue
                })
            case Actions.TOGGLE_SOUND:
                return combineState(state, { isSoundOn: !state.isSoundOn })
            default:
                return state
        }
    }
}

const singleton = new GameStore(Dispatcher)
export default singleton
