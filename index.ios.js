/**
* Sample React Native App
* https://github.com/facebook/react-native
* @flow
*/

import React, { Component, PropTypes } from 'react'
import {
    Animated,
    AppRegistry,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native'
import { Container } from 'flux/utils'

import * as Constants from './src/constants.js'
import * as Helpers from './src/helpers.js'
import Timer from './src/timer.js'

import Board from './src/components/board.js'
import NavBar from './src/components/navbar.js'
import GameOverScreen from './src/components/screens/gameOver.js'
import LevelScreen from './src/components/screens/level.js'
import PauseScreen from './src/components/screens/pause.js'
import SplashScreen from './src/components/screens/splash.js'

import Actions from './src/flux/actions.js'
import { dispatch } from './src/flux/dispatcher.js'
import GameStore from './src/flux/store.js'

class Game extends Component {
    static getStores() {
        return [GameStore]
    }

    static calculateState() {
        return GameStore.getState()
    }

    startLevel() {
        dispatch({ type: Actions.START_LEVEL })
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
        const stepTimeout = new Timer(this.step.bind(this), timeUntilNextStep)
        dispatch({ type: Actions.SCHEDULE_STEP, stepTimeout })
    }

    getMainEl() {
        const isPaused = this.state.gameState === Constants.GAME_STATES.PAUSE_SCREEN
        const gameElements = [
            <NavBar key="nav-bar"
                    isPaused={ isPaused }
                    numLives={ this.state.lives }
                    score={ this.state.score } />,
            <Board key="board"
                   board={ this.state.board }
                   isPaused={ isPaused }
                   isSoundOn={ this.state.isSoundOn }
                   level={ this.state.level } />
        ]

        switch(this.state.gameState) {
            case Constants.GAME_STATES.SPLASH_SCREEN:
                return <SplashScreen isSoundOn={ this.state.isSoundOn } />
            case Constants.GAME_STATES.LEVEL_SCREEN:
                return <LevelScreen level={ this.state.level }
                                    onStart={ this.startLevel.bind(this) } />
            case Constants.GAME_STATES.PAUSE_SCREEN:
                // Keep all the game elements so we don't re-animate unnecessarily.
                // Just add a pause overlay.
                return gameElements.concat([
                    <PauseScreen key="pause-screen"
                                 isSoundOn={ this.state.isSoundOn } />
                ])
            case Constants.GAME_STATES.GAME_OVER_SCREEN:
                return <GameOverScreen />
            default:
                return <Animated.View style={[ Constants.POSITION_FILL, {
                    transform: [{
                        translateX: this.state.damageAnimValue.interpolate({
                            inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                            outputRange: [-5, 5, -3, 3, -1, 0]
                        })
                    }]
                }]}>
                    { gameElements }
                </Animated.View>
        }
    }

    render() {
        const { tileWidth, tileHeight } = Helpers.getTileSize(this.state.level)

        // A white full-screen flash that happens when the player is damaged
        const damageOverlay =
            <Animated.View style={[ Constants.POSITION_FILL, {
                backgroundColor: 'white',
                opacity: this.state.damageAnimValue.interpolate({
                    inputRange: [0, 0.1, 0.2, 1],
                    outputRange: [0, 1, 0, 0]
                })
            }]} pointerEvents='none' />

        return (
            <Image source={ require('./images/space.png') }
                   style={ styles.background }>
                <StatusBar hidden />
                { this.getMainEl() }
                { damageOverlay }
            </Image>
        )
    }
}

const fluxContainer = Container.create(Game)

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

AppRegistry.registerComponent('spacewhack', () => fluxContainer)
