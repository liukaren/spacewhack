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

function getTileSize() {
    const { height, width } = Dimensions.get('window')
    return {
        tileWidth: width / NUM_COLS,
        tileHeight: (height - NAV_HEIGHT) / NUM_ROWS
    }
}

class Mole extends Component {
    render() {
        const image = require('./images/alien.png') // TODO: switch based on moleType
        const animValue = this.props.moleData.animValue
        const { tileWidth, tileHeight } = getTileSize()

        return <TouchableWithoutFeedback onPress={ this.props.onBop }>
            <Animated.Image source={ image }
                style={{
                    width: tileWidth,
                    height: tileHeight,
                    resizeMode: 'contain',
                    // Gets narrower and taller when rising,
                    // then fatter and shorter when descending
                    transform: [{
                        scaleX: animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1.3, 1]
                        })
                    }, {
                        scaleY: animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.7, 1]
                        })
                    }, {
                        translateY: animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [100, 0] // start below the fold, pop over it
                        })
                    }]
                }} />
        </TouchableWithoutFeedback>
    }
}
Mole.propTypes = {
    moleData: PropTypes.shape({
        moleType: PropTypes.oneOf(Object.keys(MOLE_TYPES).map((t) => MOLE_TYPES[t])),
        animValue: PropTypes.object,
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
        const animValue = new Animated.Value(0)

        if (this.state.board[position.row][position.col] !== null) {
            // There is already something here, just skip this turn
            return
        }

        // After MOLE_DURATION_MS, remove the mole
        const timeout = setTimeout(() => {
            // Animate back to 0
            const animValue = this.state.board[position.row][position.col].animValue
            Animated.timing(animValue, { toValue: 0 }).start(() => {
                // When done with the animation, remove the mole
                this.state.board[position.row][position.col] = null
                this.setState({ board: this.state.board })
            })
        }, MOLE_DURATION_MS)

        this.state.board[position.row][position.col] = {
            moleType: MOLE_TYPES.ALIEN,
            animValue,
            removeTimeout: timeout // TODO: Clear all timeout on unmount
        }
        // Animate forwards to 1
        Animated.spring(animValue, { toValue: 1, friction: 3 }).start()
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
                                    <Image source={ require('./images/heart.png') }
                                        style={{
                                            resizeMode: 'contain',
                                            width: tileWidth,
                                            height: tileHeight
                                        }}>
                                        { col && <Mole moleData={ col }
                                                       onBop={ () => { this.onBop(rowIndex, colIndex) } } /> }
                                    </Image>
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
        alignItems: 'center'
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
