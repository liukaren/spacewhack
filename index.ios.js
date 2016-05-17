/**
* Sample React Native App
* https://github.com/facebook/react-native
* @flow
*/

import React, { Component, PropTypes } from 'react'
import {
    Animated,
    AppRegistry,
    Dimensions,
    Easing,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View
} from 'react-native'

const MOLE_TYPES = {
    ALIEN: {
        scoreValue: 10
    }
}

// TODO: make this based on screen size?
const NAV_HEIGHT = 40

// How long to wait before adding another mole. The actual value will fall between MIN and MAX.
const ADD_INTERVAL_MIN_MS = 2000
const ADD_INTERVAL_MAX_MS = 3000
const ADD_INTERVAL_RANGE_MS = ADD_INTERVAL_MAX_MS - ADD_INTERVAL_MIN_MS

const MOLE_DURATION_MS = 2500 // How long a mole stays after it is added
const MOLE_ANIMATION_MS = 500 // How long to animate entering / exiting
const WORMHOLE_ANIMATION_MS = 1000 // How long to animate the wormhole opening and closing
const MOLE_DELAY_MS = 300 // How long to wait between opening the wormhole and showing the mole

const MOLE_FULL_SCALE = 0.8

function getTileSize() {
    const { height, width } = Dimensions.get('window')
    return {
        tileWidth: width / NUM_COLS,
        tileHeight: (height - NAV_HEIGHT) / NUM_ROWS
    }
}

const positionFill = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
}

class Mole extends Component {
    constructor(props) {
        super(props)
        this.state = { isBopped: false }
    }

    componentWillMount() {
        this.animValue = new Animated.Value(0)
        this.wormHoleAnimValue = new Animated.Value(0)

        // Animate the wormhole, then animate the mole coming out of it
        Animated.timing(this.wormHoleAnimValue, { toValue: 1, duration: WORMHOLE_ANIMATION_MS }).start()
        this.animateMoleTimeout = setTimeout(Animated.spring(this.animValue, {
            toValue: 1, friction: 3
        }).start, MOLE_DELAY_MS)

        // After a timeout, animate the mole away and then call the parent to remove it
        this.removeTimeout = setTimeout(() => {
            Animated.spring(this.animValue, { toValue: 0, friction: 3 })
                .start(this.props.removeMole)
        }, this.props.removeTimeoutMs)
    }

    componentWillUnmount() {
        clearTimeout(this.removeTimeout)
        clearTimeout(this.animateMoleTimeout)
    }

    onBop() {
        // Clear the remove timeout because the bop will remove it
        clearTimeout(this.removeTimeout)

        this.setState({ isBopped: true })
        Animated.timing(this.animValue, { toValue: 0, easing: Easing.easeIn })
            .start(this.props.onBop)
    }

    render() {
        // TODO: switch based on moleType
        const image = require('./images/alien.png')
        const boppedImage = require('./images/alienBopped.png')
        const { tileWidth, tileHeight } = getTileSize()

        // NOTE: For bopped elements, animValue is interpolating from 1 to 0
        return <TouchableWithoutFeedback onPress={ this.onBop.bind(this) }>
            <View>
                <Animated.Image source={ require('./images/wormhole.png') }
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    resizeMode: 'contain',
                                    width: tileWidth,
                                    height: tileHeight,
                                    opacity: this.wormHoleAnimValue.interpolate({
                                        inputRange: [0, 0.8, 1],
                                        outputRange: [0, 1, 0]
                                    }),
                                    transform: [{
                                        rotate: this.wormHoleAnimValue.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '90deg']
                                        })
                                    }, {
                                        scale: this.wormHoleAnimValue.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.5, 1]
                                        })
                                    }]
                               }} />
                { !this.state.isBopped &&
                    <Animated.Image source={ image }
                                    style={{
                                        width: tileWidth,
                                        height: tileHeight,
                                        resizeMode: 'contain',
                                        opacity: this.animValue.interpolate({
                                            // Invisible until the start of the animation
                                            inputRange: [0.1, 1],
                                            outputRange: [0, 1]
                                        }),
                                        transform: [{
                                            scale: this.animValue.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.5, MOLE_FULL_SCALE]
                                            })
                                        }]
                                    }} /> }
                { this.state.isBopped &&
                    <View>
                        <Animated.Image source={ boppedImage }
                                        style={{
                                            width: tileWidth,
                                            height: tileHeight,
                                            resizeMode: 'contain',
                                            opacity: this.animValue.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, 1]
                                            }),
                                            transform: [{
                                                scale: this.animValue.interpolate({
                                                    inputRange: [0, 0.5, 1],
                                                    outputRange: [0.5, 1.3, MOLE_FULL_SCALE]
                                                })
                                            }]
                                        }}>
                        </Animated.Image>
                        <Animated.Text style={{
                            position: 'absolute',
                            bottom: tileHeight / 3,
                            left: 0,
                            right: 0,
                            backgroundColor: 'transparent',
                            color: 'white',
                            fontFamily: 'American Typewriter',
                            fontSize: 24,
                            fontWeight: 'bold',
                            textAlign: 'center',
                            transform: [{
                                translateY: this.animValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-tileHeight / 3, 0]
                                })
                            }]
                        }}>+{ this.props.moleType.scoreValue }</Animated.Text>
                    </View> }

            </View>
        </TouchableWithoutFeedback>
    }
}
Mole.propTypes = {
    moleType: PropTypes.oneOf(Object.keys(MOLE_TYPES).map((t) => MOLE_TYPES[t])).isRequired,
    onBop: PropTypes.func.isRequired,
    removeMole: PropTypes.func.isRequired, // Call this when animations are done to fully remove
    removeTimeoutMs: PropTypes.number.isRequired
}

// TODO: Make these variable
const NUM_COLS = 3
const NUM_ROWS = 5

class Game extends Component {
    constructor(props) {
        super(props)

        this.resetGame()
    }

    resetGame() {
        // Initialize an empty board of `null`s
        const board = []
        for (let rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
            let row = []
            for (let colIndex = 0; colIndex < NUM_COLS; colIndex++) {
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

        this.state.board[position.row][position.col] = MOLE_TYPES.ALIEN
    }

    step() {
        this.placeRandomMole()
        this.setState({ board: this.state.board })

        const timeUntilNextStep = (Math.random() * ADD_INTERVAL_RANGE_MS) + ADD_INTERVAL_MIN_MS
        this.stepTimeout = setTimeout(this.step.bind(this), timeUntilNextStep)
    }

    removeMole(row, col) {
        this.state.board[row][col] = null
        this.setState({ board: this.state.board })
    }

    onBop(row, col) {
        const mole = this.state.board[row][col]
        this.state.board[row][col] = null
        this.setState({
            board: this.state.board,
            score: this.state.score + mole.scoreValue
        })
    }

    render() {
        const { tileWidth, tileHeight } = getTileSize()

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
                                                   onBop={ () => { this.onBop(rowIndex, colIndex) } }
                                                   removeMole={ () => { this.removeMole(rowIndex, colIndex) } }
                                                   removeTimeoutMs={ MOLE_DURATION_MS } /> }
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
        height: NAV_HEIGHT,
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
        height: NAV_HEIGHT,
        resizeMode: 'contain'
    },
    lifeImage: {
        height: NAV_HEIGHT,
        width: NAV_HEIGHT,
        resizeMode: 'contain'
    }
})

AppRegistry.registerComponent('spacewhack', () => Game)
