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
    StyleSheet,
    Text,
    View
} from 'react-native'

const MOLE_TYPES = {
    ALIEN: 1
}

// How long to wait before adding another mole. The actual value will fall between MIN and MAX.
const ADD_INTERVAL_MIN_MS = 2000
const ADD_INTERVAL_MAX_MS = 3000
const ADD_INTERVAL_RANGE_MS = ADD_INTERVAL_MAX_MS - ADD_INTERVAL_MIN_MS

const MOLE_DURATION_MS = 2500 // How long a mole stays after it is added
const MOLE_ANIMATION_MS = 500 // How long to animate entering / exiting

class Mole extends Component {
    render() {
        const image = require('./images/alien.png') // TODO: switch based on moleType
        const animValue = this.props.moleData.animValue
        return <Animated.Image source={ image }
            style={{
                flex: 1,
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
                        outputRange: [50, -50] // start below the fold, pop over it
                    })
                }]
            }} />
    }
}
Mole.propTypes = {
    moleData: PropTypes.shape({
        moleType: PropTypes.oneOf(Object.keys(MOLE_TYPES).map((t) => MOLE_TYPES[t])),
        animValue: PropTypes.object
    })
}


class Game extends Component {
    constructor() {
        super()

        const numCols = 3
        const numRows = 5

        // Initialize an empty board of `null`s
        const board = []
        for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
            let row = []
            for (let colIndex = 0; colIndex < numCols; colIndex++) {
                row.push(null)
            }
            board.push(row)
        }

        this.state = { board }

        // TODO: clear these timeouts on unmount
        this.moleRemoveTimeouts = []
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
        this.state.board[position.row][position.col] = {
            moleType: MOLE_TYPES.ALIEN,
            animValue
        }
        // Animate forwards to 1
        Animated.spring(animValue, { toValue: 1, friction: 3 }).start()

        // After MOLE_DURATION_MS, remove the mole
        const timeout = setTimeout(() => {
            // Animate back to 0
            const animValue = this.state.board[position.row][position.col].animValue
            Animated.timing(animValue, { toValue: 0 }).start(() => {
                // When done with the animation, remove the mole
                this.state.board[position.row][position.col] = null
                this.setState({ board: this.state.board })
            })

            this.moleRemoveTimeouts.splice(
                this.moleRemoveTimeouts.indexOf(timeout), 1)
        }, MOLE_DURATION_MS)
        this.moleRemoveTimeouts.push(timeout)
    }

    step() {
        this.placeRandomMole()
        this.setState({ board: this.state.board })

        const timeUntilNextStep = (Math.random() * ADD_INTERVAL_RANGE_MS) + ADD_INTERVAL_MIN_MS
        this.stepTimeout = setTimeout(this.step.bind(this), timeUntilNextStep)
    }

    render() {
        return (
            <View style={styles.container}>
                { this.state.board.map((row, rowIndex) => (
                    <View style={ styles.row } key={ rowIndex }>
                        { row.map((col, colIndex) => (
                            <View style={ styles.col } key={ colIndex }>
                                <Image source={ require('./images/heart.png') }
                                    style={ styles.backgroundImage }>
                                    { col && <Mole moleData={ col } /> }
                                </Image>
                            </View>
                        )) }
                    </View>
                )) }
            </View>
        )
    }
}

const styles = StyleSheet.create({
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
        flexDirection: 'row',

        backgroundColor: 'pink'
    },
    backgroundImage: {
        flex: 1,
        flexDirection: 'row',
        resizeMode: 'contain'
    }
})

AppRegistry.registerComponent('spacewhack', () => Game)
