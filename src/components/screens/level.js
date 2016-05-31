import React, { Component, PropTypes } from 'react'
import {
    Image,
    Text,
    TouchableHighlight,
    View
} from 'react-native'
import styles from './styles.js'

export default class LevelScreen extends Component {
    render() {
        return <View style={ styles.screenBg }>
            <Text style={ styles.title }>Level 1</Text>

            <Text style={ styles.text }>
                Defend the planet against space invaders by tapping
                on them! We're counting on you!
            </Text>

            <Image source={ require('../../../images/purple.png') }
                   style={ styles.previewImage } />

            <TouchableHighlight onPress={ this.props.onStart }>
                <Text style={ styles.button }>Start Level</Text>
            </TouchableHighlight>
        </View>
    }
}

LevelScreen.propTypes = {
    onStart: PropTypes.func.isRequired,
    level: PropTypes.number.isRequired
}
