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
                    onPause={ () => dispatch({ type: Actions.PAUSE_GAME }) }
                    onResume={ () => dispatch({ type: Actions.RESUME_GAME }) }
                    score={ this.state.score } />,
            <Board key="board"
                   board={ this.state.board }
                   level={ this.state.level } />
        ]

        switch(this.state.gameState) {
            case Constants.GAME_STATES.SPLASH_SCREEN:
                return <SplashScreen isSoundOn={ this.state.isSoundOn } />
            case Constants.GAME_STATES.LEVEL_SCREEN:
                return <LevelScreen level={ this.state.level }
                                    onStart={ () => dispatch({ type: Actions.START_LEVEL }) } />
            case Constants.GAME_STATES.PAUSE_SCREEN:
                // Keep all the game elements so we don't re-animate unnecessarily.
                // Just add a pause overlay.
                return gameElements.concat([
                    <PauseScreen key="pause-screen"
                                 isSoundOn={ this.state.isSoundOn }
                                 onQuit={ () => dispatch({ type: Actions.QUIT_GAME }) }
                                 onResume={ () => dispatch({ type: Actions.RESUME_GAME }) } />
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

AppRegistry.registerComponent('spacewhack', () => Game)
