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

class Game extends Component {
    constructor(props) {
        super(props)

        this.state = Object.assign({}, this.getResetState(), {
            isSoundOn: true
        })
    }

    getResetState() {
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

    startGame() {
        this.setState({ gameState: Constants.GAME_STATES.IN_GAME })
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

        this.state.board[position.row][position.col] = moleType
    }

    step() {
        this.placeRandomMole()
        this.setState({ board: this.state.board })

        const timeUntilNextStep = (Math.random() * Constants.ADD_INTERVAL_RANGE_MS) +
            Constants.ADD_INTERVAL_MIN_MS
        this.stepTimeout = new Timer(this.step.bind(this), timeUntilNextStep)
    }

    onEvade(row, col) {
        this.state.board[row][col] = null
        this.setState({ board: this.state.board })
    }

    onDefeat(row, col) {
        const mole = this.state.board[row][col]
        this.state.board[row][col] = null
        this.setState({
            board: this.state.board,
            lives: Math.min(this.state.lives + mole.lifeValue, Constants.MAX_LIVES),
            score: this.state.score + mole.scoreValue
        })
    }

    onPause() {
        this.setState({ gameState: Constants.GAME_STATES.PAUSED })
        this.stepTimeout.pause()
    }

    onResume() {
        this.setState({ gameState: Constants.GAME_STATES.IN_GAME })
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
                                 onToggleSound={ () => {
                                     this.setState({ isSoundOn: !this.state.isSoundOn })
                                 }} />
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
