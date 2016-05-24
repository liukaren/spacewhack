import React, { Component, PropTypes } from 'react'
import {
    Image,
    Text,
    TouchableHighlight,
    View
} from 'react-native'
import styles from './styles.js'
import Actions from '../../flux/actions.js'
import { dispatch } from '../../flux/dispatcher.js'

const IMG_SOUND_ON = require('../../../images/soundOn.png')
const IMG_SOUND_OFF = require('../../../images/soundOff.png')

export default class PauseScreen extends Component {
    render() {
        return <View style={ [styles.screenBg, styles.screenBgOverlay] }>
            <Text style={ styles.title }>
                PAUSED
            </Text>

            <TouchableHighlight onPress={ () => dispatch({ type: Actions.TOGGLE_SOUND })}>
                <Image source={ this.props.isSoundOn ? IMG_SOUND_ON : IMG_SOUND_OFF } />
            </TouchableHighlight>

            <TouchableHighlight onPress={ () => dispatch({ type: Actions.RESUME_GAME }) }>
                <Text style={ styles.button }>Resume</Text>
            </TouchableHighlight>
        </View>
    }
}

PauseScreen.propTypes = {
    isSoundOn: PropTypes.bool
}
