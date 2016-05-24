import React, { Component, PropTypes } from 'react'
import {
    Text,
    TouchableHighlight,
    View
} from 'react-native'
import styles from './styles.js'

export default class PauseScreen extends Component {
    render() {
        return <View style={ [styles.screenBg, styles.screenBgOverlay] }>
            <Text style={ styles.title }>
                PAUSED
            </Text>

            <TouchableHighlight onPress={ this.props.onResume }>
                <Text style={ styles.button }>Resume</Text>
            </TouchableHighlight>
        </View>
    }
}

PauseScreen.propTypes = {
    onResume: PropTypes.func.isRequired
}
