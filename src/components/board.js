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
    render() {
        return <View style={ styles.container }>
            { this.props.board.map((row, rowIndex) => (
                <View style={ styles.row } key={ rowIndex }>
                    { row.map((col, colIndex) => (
                        <View style={ styles.col } key={ colIndex }>
                            { col && <Mole row={ rowIndex }
                                           col={ colIndex }
                                           { ...this.props.board[rowIndex][colIndex] }
                                           level={ this.props.level } /> }
                        </View>
                    )) }
                </View>
            )) }
        </View>
    }
}

Board.propTypes = {
    board: PropTypes.arrayOf(PropTypes.arrayOf(
        PropTypes.shape({
            moleState: PropTypes.oneOf(
                Object.keys(Constants.MOLE_STATES).map((k) => Constants.MOLE_STATES[k])
            ).isRequired,
            moleType: PropTypes.oneOf(Constants.MOLE_TYPES).isRequired,
            numBops: PropTypes.number.isRequired
        })
    )).isRequired,
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
