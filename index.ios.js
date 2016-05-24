/**
* Sample React Native App
* https://github.com/facebook/react-native
* @flow
*/

import React, { Component, PropTypes } from 'react'
import {
    AppRegistry,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native'

import * as Constants from './src/constants.js'
import * as Helpers from './src/helpers.js'
import Timer from './src/timer.js'

import Board from './src/components/board.js'
import NavBar from './src/components/navbar.js'
import LevelScreen from './src/components/screens/level.js'
import PauseScreen from './src/components/screens/pause.js'

import Actions from './src/flux/actions.js'
import { dispatch } from './src/flux/dispatcher.js'
import GameStore from './src/flux/store.js'

class Game extends Component {
    constructor(props) {
        super(props)
        this.state = GameStore.getState()
    }

    componentDidMount() {
        this.fluxListener = GameStore.addListener(() => {
            this.setState(GameStore.getState())
        })
    }

    componentWillUnmount() {
        this.fluxListener.remove()
    }

    startGame() {
        dispatch({ type: Actions.START_GAME })
        this.step()
    }

    getRandomPosition() {
        const numRows = this.state.board.length
        const numCols = this.state.board[0].length
        return {
            row: Math.floor(Math.random() * numRows),
            col: Math.floor(Math.random() * numCols)
        }
    }

    placeRandomMole() {
        const position = this.getRandomPosition()

        if (this.state.board[position.row][position.col] !== null) {
            // There is already something here, just skip this turn
            return
        }

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
                moleType = Constants.MOLE_TYPES[i]
                break
            }
        }

        dispatch({ type: Actions.PLACE_MOLE, row: position.row, col: position.col, moleType })
    }

    step() {
        this.placeRandomMole()

        const timeUntilNextStep = (Math.random() * Constants.ADD_INTERVAL_RANGE_MS) +
            Constants.ADD_INTERVAL_MIN_MS
        this.stepTimeout = new Timer(this.step.bind(this), timeUntilNextStep)
    }

    onEvade(row, col) {
        dispatch({ type: Actions.CLEAR_MOLE, row, col })
    }

    onDefeat(row, col) {
        const mole = this.state.board[row][col]
        dispatch({
            type: Actions.CLEAR_MOLE,
            row, col,
            lifeValue: mole.lifeValue,
            scoreValue: mole.scoreValue
        })
    }

    onPause() {
        dispatch({ type: Actions.PAUSE_GAME })
        this.stepTimeout.pause()
    }

    onResume() {
        dispatch({ type: Actions.RESUME_GAME })
        this.stepTimeout.resume()
    }

    getMainEl() {
        const isPaused = this.state.gameState === Constants.GAME_STATES.PAUSED
        const gameElements = [
            <NavBar key="nav-bar"
                    numLives={ this.state.lives }
                    onTogglePause={ () => isPaused ? this.onResume() : this.onPause() }
                    score={ this.state.score } />,
            <Board key="board"
                   board={ this.state.board }
                   isPaused={ isPaused }
                   isSoundOn={ this.state.isSoundOn }
                   level={ this.state.level }
                   onDefeat={ this.onDefeat.bind(this) }
                   onEvade={ this.onEvade.bind(this) } />
        ]

        switch(this.state.gameState) {
            case Constants.GAME_STATES.INTRO:
                return <LevelScreen level={ this.state.level }
                                    onStart={ this.startGame.bind(this) } />
            case Constants.GAME_STATES.PAUSED:
                // Keep all the game elements so we don't re-animate unnecessarily.
                // Just add a pause overlay.
                return gameElements.concat([
                    <PauseScreen key="pause-screen"
                                 isSoundOn={ this.state.isSoundOn }
                                 onResume={ this.onResume.bind(this) }
                                 onToggleSound={ () => dispatch({
                                     type: Actions.TOGGLE_SOUND
                                 }) } />
                ])
            default:
                return gameElements
        }
    }

    render() {
        const { tileWidth, tileHeight } = Helpers.getTileSize(this.state.level)

        return (
            <Image source={ require('./images/space.png') }
                   style={ styles.background }>
                <StatusBar hidden />
                { this.getMainEl() }
            </Image>
        )
    }
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: 'black',
        resizeMode: 'contain',

        // Ignore static dimensions
        width: null,
        height: null
    }
})

AppRegistry.registerComponent('spacewhack', () => Game)
