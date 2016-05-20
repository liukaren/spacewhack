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
import Board from './src/components/board.js'
import NavBar from './src/components/navbar.js'
import PauseScreen from './src/components/pauseScreen.js'

class Game extends Component {
    constructor(props) {
        super(props)

        this.resetGame()
    }

    resetGame() {
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

        this.state = { board, score: 0, level, gameState: Constants.GAME_STATES.INTRO }
        this.stepTimeout = null
    }

    getRandomPosition() {
        const numRows = this.state.board.length
        const numCols = this.state.board[0].length
        return {
            row: Math.floor(Math.random() * numRows),
            col: Math.floor(Math.random() * numCols)
        }
    }

    componentDidMount() {
        this.step()
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

        const timeUntilNextStep = (Math.random() * Constants.ADD_INTERVAL_RANGE_MS) + Constants.ADD_INTERVAL_MIN_MS
        this.stepTimeout = setTimeout(this.step.bind(this), timeUntilNextStep)
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
            score: this.state.score + mole.scoreValue
        })
    }

    onPause() {
        // TODO: actually cancel all animations and timeouts
        this.setState({ gameState: Constants.GAME_STATES.PAUSED })
    }

    onResume() {
        this.setState({ gameState: Constants.GAME_STATES.IN_GAME })
    }

    getMainEl() {
        switch(this.state.gameState) {
            case Constants.GAME_STATES.PAUSED:
                return <PauseScreen onResume={ this.onResume.bind(this) } />
            default:
                return [
                    <NavBar key="nav-bar"
                            numLives={ 3 }
                            onPause={ this.onPause.bind(this) }
                            score={ this.state.score } />,
                    <Board key="board"
                           board={ this.state.board }
                           level={ this.state.level }
                           onDefeat={ this.onDefeat.bind(this) }
                           onEvade={ this.onEvade.bind(this) } />
                ]
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
        resizeMode: 'cover',

        // Ignore static dimensions
        width: null,
        height: null
    }
})

AppRegistry.registerComponent('spacewhack', () => Game)
