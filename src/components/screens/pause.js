import React, { Component, PropTypes } from 'react'
import {
    Alert,
    Image,
    Text,
    TouchableHighlight,
    View
} from 'react-native'
import styles from './styles.js'
import * as Constants from '../../constants.js'
import Actions from '../../flux/actions.js'
import { dispatch } from '../../flux/dispatcher.js'

export default class PauseScreen extends Component {
    confirmQuit() {
        Alert.alert(
            'Abandon ship?', null, [
                { text: 'Cancel', onPress: () => {}, style: 'cancel'},
                { text: 'Quit', onPress: this.props.onQuit, style: 'destructive' }
            ]
        )
    }

    render() {
        return <View style={ [styles.screenBg, styles.screenBgOverlay] }>
            <Text style={ styles.title }>
                PAUSED
            </Text>

            <TouchableHighlight onPress={ () => dispatch({ type: Actions.TOGGLE_SOUND })}>
                <Image source={ this.props.isSoundOn ?
                    Constants.IMG_SOUND_ON : Constants.IMG_SOUND_OFF } />
            </TouchableHighlight>

            <TouchableHighlight onPress={ this.confirmQuit.bind(this) }>
                <Text style={ styles.button }>Quit Game</Text>
            </TouchableHighlight>

            <TouchableHighlight onPress={ this.props.onResume }>
                <Text style={ styles.button }>Resume</Text>
            </TouchableHighlight>
        </View>
    }
}

PauseScreen.propTypes = {
    isSoundOn: PropTypes.bool,
    onResume: PropTypes.func.isRequired,
    onQuit: PropTypes.func.isRequired
}
