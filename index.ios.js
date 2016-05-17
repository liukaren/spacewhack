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

const MOLE_TYPES = [{
    image: require('./images/purple.png'),
    boppedImage: require('./images/purpleBopped.png'),
    bopsNeeded: 1,
    likelihoodWeight: 1,
    scoreValue: 10
}, {
    image: require('./images/yellow.png'),
    boppedImage: require('./images/yellowBopped.png'),
    bopsNeeded: 2,
    likelihoodWeight: 1,
    scoreValue: 25
}, {
    image: require('./images/bunny.png'),
    boppedImage: require('./images/bunnyBopped.png'),
    bopsNeeded: 1,
    likelihoodWeight: 0.5,
    scoreValue: 0
}]

const MOLE_STATES = {
    HIDDEN: 1,
    VISIBLE: 2,
    BOPPED: 3,
    DEFEATED: 4,
    EVADING: 5
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
const MOLE_SHRINK_SCALE = 0.5

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
        this.state = { moleState: MOLE_STATES.HIDDEN, numBops: 0 }
    }

    componentWillMount() {
        this.animValue = new Animated.Value(0)
        this.wormHoleAnimValue = new Animated.Value(0)
        this.bopAnimValue = new Animated.Value(0)

        // Animate the wormhole, then animate the mole coming out of it
        Animated.timing(this.wormHoleAnimValue, { toValue: 1, duration: WORMHOLE_ANIMATION_MS }).start()
        this.animateMoleTimeout = setTimeout(() => {
            this.setState({ moleState: MOLE_STATES.VISIBLE })
            Animated.spring(this.animValue, { toValue: 1, friction: 3 }).start()
        }, MOLE_DELAY_MS)

        // After a timeout, animate the mole away and then call the parent to remove it
        this.removeTimeout = setTimeout(() => {
            this.setState({ moleState: MOLE_STATES.EVADING })
            Animated.timing(this.animValue, { toValue: 0 }).start(this.props.onEvade)
        }, this.props.removeTimeoutMs)
    }

    componentWillUnmount() {
        clearTimeout(this.removeTimeout)
        clearTimeout(this.animateMoleTimeout)
        if (this.bopAnimation) { this.bopAnimation.stop() }
    }

    onBop() {
        // Do nothing if the mole is already leaving
        if (this.state.moleState === MOLE_STATES.EVADING) { return; }

        const numBops = this.state.numBops + 1
        this.bopAnimValue.setValue(0)
        this.bopAnimation = Animated.timing(this.bopAnimValue, {
            toValue: 1, easing: Easing.easeIn
        })

        if (numBops >= this.props.moleType.bopsNeeded) {
            // Clear the remove timeout because the bop will remove it
            clearTimeout(this.removeTimeout)

            // When the animation is finished, call the parent fn to remove the mole
            this.setState({ moleState: MOLE_STATES.DEFEATED, numBops })
            this.bopAnimation.start(this.props.onDefeat)
        } else {
            // When the animation is finished, reset state
            this.setState({ moleState: MOLE_STATES.BOPPED, numBops })
            this.bopAnimation.start(() => {
                this.setState({ moleState: MOLE_STATES.VISIBLE })
            })
        }
    }

    render() {
        const image = this.props.moleType.image
        const boppedImage = this.props.moleType.boppedImage
        const { tileWidth, tileHeight } = getTileSize()

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
                { (this.state.moleState === MOLE_STATES.VISIBLE ||
                   this.state.moleState === MOLE_STATES.EVADING) &&
                    <Animated.Image source={ image }
                                    style={{
                                        width: tileWidth,
                                        height: tileHeight,
                                        resizeMode: 'contain',
                                        transform: [{
                                            scale: this.animValue.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.1, MOLE_FULL_SCALE]
                                            })
                                        }]
                                    }} /> }
                { this.state.moleState === MOLE_STATES.BOPPED &&
                    <Animated.Image source={ boppedImage }
                                    style={{
                                        width: tileWidth,
                                        height: tileHeight,
                                        resizeMode: 'contain',
                                        transform: [{
                                            scale: this.bopAnimValue.interpolate({
                                                inputRange: [0, 0.5, 1],
                                                outputRange: [MOLE_FULL_SCALE, MOLE_SHRINK_SCALE, MOLE_FULL_SCALE]
                                            })
                                        }]
                                    }}>
                    </Animated.Image> }
                { this.state.moleState === MOLE_STATES.DEFEATED &&
                    <Animated.Image source={ boppedImage }
                                    style={{
                                        width: tileWidth,
                                        height: tileHeight,
                                        resizeMode: 'contain',
                                        transform: [{
                                            scale: this.bopAnimValue.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [MOLE_FULL_SCALE, 0]
                                            })
                                        }]
                                    }}>
                    </Animated.Image> }
                { this.props.moleType.scoreValue > 0 &&
                  this.state.moleState === MOLE_STATES.DEFEATED &&
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
                            translateY: this.bopAnimValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -tileHeight / 3]
                            })
                        }]
                    }}>+{ this.props.moleType.scoreValue }</Animated.Text> }
            </View>
        </TouchableWithoutFeedback>
    }
}
Mole.propTypes = {
    moleType: PropTypes.oneOf(MOLE_TYPES).isRequired,
    onDefeat: PropTypes.func.isRequired,
    onEvade: PropTypes.func.isRequired, // Call this when animations are done to fully remove
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

        // TODO: Filter out types that are not available in this level.
        // Pick a random mole based on its likelihood weight.
        const totalWeight = MOLE_TYPES.reduce((sum, moleType) => (
            moleType.likelihoodWeight + sum
        ), 0)

        let moleType
        const randomNum = Math.random() * totalWeight
        for (let i = 0, accruedWeight = 0; i < MOLE_TYPES.length; i++) {
            accruedWeight += MOLE_TYPES[i].likelihoodWeight
            if (randomNum < accruedWeight) {
                moleType = MOLE_TYPES[i]
                break
            }
        }

        this.state.board[position.row][position.col] = moleType
    }

    step() {
        this.placeRandomMole()
        this.setState({ board: this.state.board })

        const timeUntilNextStep = (Math.random() * ADD_INTERVAL_RANGE_MS) + ADD_INTERVAL_MIN_MS
        this.stepTimeout = setTimeout(this.step.bind(this), timeUntilNextStep)
    }

    onEvade(row, col) {
        this.state.board[row][col] = null
        this.setState({ board: this.state.board })
    }

    onDefeat(row, col) {
        const mole = this.state.board[row][col]
        if (!mole) {
            console.log("ROW AND COL ARE", row, col)
        }
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
                                                   onDefeat={ () => { this.onDefeat(rowIndex, colIndex) } }
                                                   onEvade={ () => { this.onEvade(rowIndex, colIndex) } }
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
