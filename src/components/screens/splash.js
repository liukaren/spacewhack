import React, { Component, PropTypes } from 'react'
import {
    Image,
    Text,
    TouchableHighlight,
    View
} from 'react-native'
import styles from './styles.js'

import * as Constants from '../../constants.js'
import Actions from '../../flux/actions.js'
import { dispatch } from '../../flux/dispatcher.js'

export default class SplashScreen extends Component {
    render() {
        return <View style={ styles.screenBg }>
            <Text style={ styles.splashText }>Space Whack</Text>

            <TouchableHighlight onPress={ () => { dispatch({ type: Actions.START_GAME }) } }>
                <Text style={ styles.button }>Play</Text>
            </TouchableHighlight>

            <TouchableHighlight onPress={ () => dispatch({ type: Actions.TOGGLE_SOUND })}>
                <Image source={ this.props.isSoundOn ?
                    Constants.IMG_SOUND_ON : Constants.IMG_SOUND_OFF } />
            </TouchableHighlight>
        </View>
    }
}

SplashScreen.propTypes = {
    isSoundOn: PropTypes.bool
}
