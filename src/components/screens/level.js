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
                        Defend the planet against space invaders by tapping
                        on them! We're counting on you!
                    </Text>,
                    <Image key="level-image"
                           source={ Constants.IMG_ENEMY }
                           style={ styles.previewImage } />
                ]
            case 1:
                return [
                    <Text key="level-copy" style={ styles.text }>
                        Great work! Keep going, but this time avoid the
                        innocent citizens of your planet!
                    </Text>,
                    <Image key="level-image"
                           source={ Constants.IMG_INNOCENT }
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
