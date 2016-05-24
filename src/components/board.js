import React, { Component, PropTypes } from 'react'
import {
    StyleSheet,
    View
} from 'react-native'
import * as Constants from '../constants.js'
import Mole from './mole.js'

export default class Board extends Component {
    render() {
        return <View style={ styles.container }>
            { this.props.board.map((row, rowIndex) => (
                <View style={ styles.row } key={ rowIndex }>
                    { row.map((col, colIndex) => (
                        <View style={ styles.col } key={ colIndex }>
                            { col && <Mole moleType={ col }
                                           isPaused={ this.props.isPaused }
                                           level={ this.props.level }
                                           onDefeat={ () => { this.props.onDefeat(rowIndex, colIndex) } }
                                           onEvade={ () => { this.props.onEvade(rowIndex, colIndex) } }
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
    level: PropTypes.number.isRequired,
    onDefeat: PropTypes.func.isRequired,
    onEvade: PropTypes.func.isRequired
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
