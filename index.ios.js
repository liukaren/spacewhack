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

function getTileSize() {
    const { height, width } = Dimensions.get('window')
    return {
        tileWidth: width / NUM_COLS,
        tileHeight: (height - NAV_HEIGHT) / NUM_ROWS
    }
}

class Mole extends Component {
    componentWillMount() {
        this.animValue = new Animated.Value(0)
        this.wormHoleAnimValue = new Animated.Value(0)

        // Animate the wormhole, then animate the mole coming out of it
        Animated.timing(this.wormHoleAnimValue, { toValue: 1, duration: WORMHOLE_ANIMATION_MS }).start()
        this.animateMoleTimeout = setTimeout(Animated.spring(this.animValue, {
            toValue: 1, friction: 3
        }).start, MOLE_DELAY_MS)
    }

    componentWillUnmount() {
        clearTimeout(this.animateMoleTimeout)
    }

    render() {
        const image = require('./images/alien.png') // TODO: switch based on moleType
        const { tileWidth, tileHeight } = getTileSize()

        return <TouchableWithoutFeedback onPress={ this.props.onBop }>
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
                                            outputRange: [0.5, 0.8]
                                        })
                                    }]
                                }} />
            </View>
        </TouchableWithoutFeedback>
    }
}
Mole.propTypes = {
    moleData: PropTypes.shape({
        moleType: PropTypes.oneOf(Object.keys(MOLE_TYPES).map((t) => MOLE_TYPES[t])),
        onBop: PropTypes.func
    })
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

        // After MOLE_DURATION_MS, remove the mole
        const removeTimeout = setTimeout(() => {
            this.state.board[position.row][position.col] = null
            this.setState({ board: this.state.board })
        }, MOLE_DURATION_MS)

        this.state.board[position.row][position.col] = {
            moleType: MOLE_TYPES.ALIEN,
            removeTimeout // TODO: Clear all timeout on unmount
        }
    }

    step() {
        this.placeRandomMole()
        this.setState({ board: this.state.board })

        const timeUntilNextStep = (Math.random() * ADD_INTERVAL_RANGE_MS) + ADD_INTERVAL_MIN_MS
        this.stepTimeout = setTimeout(this.step.bind(this), timeUntilNextStep)
    }

    onBop(row, col) {
        const mole = this.state.board[row][col]
        clearTimeout(mole.removeTimeout)
        // TODO: play some kind of bop animation here
        this.state.board[row][col] = null
        this.setState({
            board: this.state.board,
            score: this.state.score + mole.moleType.scoreValue
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
                                    { col && <Mole moleData={ col }
                                                   onBop={ () => { this.onBop(rowIndex, colIndex) } } /> }
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
        fontFamily: 'Gill Sans',
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
