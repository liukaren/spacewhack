import React, { Component, PropTypes } from 'react'
import {
    Animated,
    Image,
    StatusBar,
    StyleSheet
} from 'react-native'

import * as Constants from './constants.js'
import * as Helpers from './helpers.js'
import Timer from './timer.js'

import Board from './components/board.js'
import NavBar from './components/navbar.js'
import GameOverScreen from './components/screens/gameOver.js'
import LevelScreen from './components/screens/level.js'
import PauseScreen from './components/screens/pause.js'
import SplashScreen from './components/screens/splash.js'

import GameStore from './flux/store.js'

export default class Game extends Component {
    constructor(props) {
        super(props)

        this.state = GameStore.getState()
    }

    componentDidMount() {
        GameStore.addChangeListener(this._onChange.bind(this))
    }

    componentWillUnmount() {
        GameStore.removeChangeListener(this._onChange.bind(this))
    }

    _onChange() {
        this.setState(GameStore.getState())
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
                   level={ this.state.level } />
        ]

        switch(this.state.gameState) {
            case Constants.GAME_STATES.SPLASH_SCREEN:
                return <SplashScreen isSoundOn={ this.state.isSoundOn } />
            case Constants.GAME_STATES.LEVEL_SCREEN:
                return <LevelScreen level={ this.state.level } />
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
            <Image source={ Constants.IMG_BACKGROUND }
                   style={ styles.background }>
                <StatusBar hidden />
                { this.getMainEl() }
                { damageOverlay }
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
