import React, { Component, PropTypes } from 'react'
import {
    Image,
    Text,
    TouchableHighlight,
    View
} from 'react-native'
import * as Constants from '../../constants.js'
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
        }
    }

    render() {
        return <View style={ styles.screenBg }>
            <Text style={ styles.title }>Level { this.props.level + 1 }</Text>

            { this.getLevelContents() }

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
