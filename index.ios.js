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
import Mole from './src/components/mole.js'

class Game extends Component {
    constructor(props) {
        super(props)

        this.resetGame()
    }

    resetGame() {
        // Initialize an empty board of `null`s
        const board = []
        for (let rowIndex = 0; rowIndex < Constants.NUM_ROWS; rowIndex++) {
            let row = []
            for (let colIndex = 0; colIndex < Constants.NUM_COLS; colIndex++) {
                row.push(null)
            }
            board.push(row)
        }

        this.state = { board, score: 0 }
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

    render() {
        const { tileWidth, tileHeight } = Helpers.getTileSize()

        // Show lives with repeating hearts
        const numLives = 3 // TODO
        const lifeEls = []
        for (let i = 0; i < numLives; i++) {
            lifeEls.push(<Image key={ i }
                                source={ require('./images/heart.png') }
                                style={ styles.lifeImage } />)
        }

        return (
            <Image source={ require('./images/space.png') }
                   style={ styles.background }>
                <View style={ styles.navBar }>
                    <Text style={ styles.score }>
                        Score: { this.state.score }
                    </Text>
                    { lifeEls }
                    <Image source={ require('./images/pause.png') }
                           style={ styles.pauseButton } />
                </View>
                <View style={styles.container}>
                    <StatusBar hidden />
                    { this.state.board.map((row, rowIndex) => (
                        <View style={ styles.row } key={ rowIndex }>
                            { row.map((col, colIndex) => (
                                <View style={ styles.col } key={ colIndex }>
                                    { col && <Mole moleType={ col }
                                                   onDefeat={ () => { this.onDefeat(rowIndex, colIndex) } }
                                                   onEvade={ () => { this.onEvade(rowIndex, colIndex) } }
                                                   removeTimeoutMs={ Constants.MOLE_DURATION_MS } /> }
                                </View>
                            )) }
                        </View>
                    )) }
                </View>
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
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch'
    },
    row: {
        flex: 1,
        flexDirection: 'row'
    },
    col: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    navBar: {
        alignItems: 'center',
        flexDirection: 'row',
        height: Constants.NAV_HEIGHT,
        padding: 10
    },
    score: {
        backgroundColor: 'transparent',
        color: 'white',
        flex: 1,
        fontFamily: 'Avenir Next',
        fontSize: 20,
        fontWeight: 'bold'
    },
    pauseButton: {
        height: Constants.NAV_HEIGHT,
        resizeMode: 'contain'
    },
    lifeImage: {
        height: Constants.NAV_HEIGHT,
        width: Constants.NAV_HEIGHT,
        resizeMode: 'contain'
    }
})

AppRegistry.registerComponent('spacewhack', () => Game)
