import React, { Component, PropTypes } from 'react'
import {
    Image,
    Text,
    TouchableHighlight,
    View
} from 'react-native'
import { PLANET_NAME, SHIP_NAME } from '../../constants.js'
import styles from './styles.js'

export default class LevelScreen extends Component {
    render() {
        return <View style={ styles.screenBg }>
            <Text style={ styles.title }>Level 1</Text>

            <Text style={ styles.text }>
                Space invaders are appearing through wormholes and attacking { PLANET_NAME }!
            </Text>

            <Image source={ require('../../../images/purple.png') }
                   style={ styles.previewImage } />

            <Text style={ styles.text }>
                You are the captain of { SHIP_NAME }, here to defend your home planet
                with your trusty mallet.
            </Text>

            <TouchableHighlight onPress={ this.props.onStart }>
                <Text style={ styles.button }>Launch</Text>
            </TouchableHighlight>
        </View>
    }
}

LevelScreen.propTypes = {
    onStart: PropTypes.func.isRequired,
    level: PropTypes.number.isRequired
}
