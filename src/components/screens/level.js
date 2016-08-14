import React, { Component, PropTypes } from 'react'
import {
    Image,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from 'react-native'

import * as Constants from '../../constants.js'
import Actions from '../../flux/actions.js'
import { dispatch } from '../../flux/dispatcher.js'
import styles from './styles.js'

export default class LevelScreen extends Component {
    getLevelContents() {
        switch(this.props.level) {
            case 0:
                return [
                    <Text key="level-copy" style={ styles.text }>
                        Defend the planet against space invaders by tapping on them.
                    </Text>,
                    <Image key="level-image"
                           source={ Constants.IMG_ENEMY }
                           style={ styles.previewImage } />,
                    <Text key="level-copy2" style={ styles.text }>
                        We're counting on you!
                    </Text>
                ]
            case 1:
                return [
                    <Text key="level-copy" style={ styles.text }>
                        Great work! The evacuation has begun. Avoid hitting the
                        innocent citizens of your planet!
                    </Text>,
                    <Image key="level-image"
                           source={ Constants.IMG_INNOCENT }
                           style={ styles.previewImage } />
                ]
            case 2:
                return [
                    <Text key="level-copy" style={ styles.text }>
                        Another swarm has arrived! These enemies need two taps
                        to be defeated!
                    </Text>,
                    <Image key="level-image"
                           source={ Constants.IMG_ENEMY_HARD }
                           style={ styles.previewImage } />
                ]
            case 3:
                return [
                    <Text key="level-copy" style={ styles.text }>
                        This enemy has surrounded itself with defenses! You
                        must destroy the satellites in number order before you
                        can defeat it!
                    </Text>,
                    <View key="level-image" style={ levelStyles.imageRow }>
                        <Image source={ Constants.IMG_ENEMY_NUMBER }
                               style={ styles.previewImage } />
                        <Image source={ Constants.IMG_SATELLITE }
                               style={ styles.previewImage } />
                    </View>
                ]
        }
    }

    render() {
        return <View style={ styles.screenBg }>
            <Text style={ styles.title }>Level { this.props.level + 1 }</Text>

            { this.getLevelContents() }

            <TouchableHighlight onPress={ () => dispatch({ type: Actions.START_LEVEL }) }>
                <Text style={ styles.button }>Start Level</Text>
            </TouchableHighlight>
        </View>
    }
}

const levelStyles = StyleSheet.create({
    imageRow: {
        flexDirection: 'row',
    },
});

LevelScreen.propTypes = {
    level: PropTypes.number.isRequired
}
