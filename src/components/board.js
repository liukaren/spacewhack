import React, { Component, PropTypes } from 'react'
import {
    StyleSheet,
    View
} from 'react-native'
import * as Constants from '../constants.js'
import Mole from './mole.js'

import Actions from '../flux/actions.js'
import { dispatch } from '../flux/dispatcher.js'

export default class Board extends Component {
    onEvade(row, col) {
        const mole = this.props.board[row][col]
        dispatch({
            type: Actions.CLEAR_MOLE,
            row, col,
            lifeChange: mole.missedLifeValue,
            scoreChange: 0
        })
    }

    onDefeat(row, col) {
        const mole = this.props.board[row][col]
        dispatch({
            type: Actions.CLEAR_MOLE,
            row, col,
            lifeChange: mole.lifeValue,
            scoreChange: mole.scoreValue
        })
    }

    render() {
        return <View style={ styles.container }>
            { this.props.board.map((row, rowIndex) => (
                <View style={ styles.row } key={ rowIndex }>
                    { row.map((col, colIndex) => (
                        <View style={ styles.col } key={ colIndex }>
                            { col && <Mole moleType={ col }
                                           isPaused={ this.props.isPaused }
                                           level={ this.props.level }
                                           onDefeat={ () => { this.onDefeat(rowIndex, colIndex) } }
                                           onEvade={ () => { this.onEvade(rowIndex, colIndex) } }
                                           removeTimeoutMs={ Constants.MOLE_DURATION_MS } /> }
                        </View>
                    )) }
                </View>
            )) }
        </View>
    }
}

Board.propTypes = {
    board: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOf(Constants.MOLE_TYPES))).isRequired,
    isPaused: PropTypes.bool,
    level: PropTypes.number.isRequired
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
        position: 'relative'
    }
})
