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
                { text: 'Quit', onPress: () => dispatch({ type: Actions.QUIT_GAME }), style: 'destructive' }
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

            <TouchableHighlight onPress={ () => dispatch({ type: Actions.RESUME_GAME }) }>
                <Text style={ styles.button }>Resume</Text>
            </TouchableHighlight>

            <TouchableHighlight onPress={ this.confirmQuit }>
                <Text style={ styles.button }>Quit</Text>
            </TouchableHighlight>
        </View>
    }
}

PauseScreen.propTypes = {
    isSoundOn: PropTypes.bool
}