import React, { Component, PropTypes } from 'react'
import {
    Animated,
    Image,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from 'react-native'
import styles from './styles.js'

import * as Constants from '../../constants.js'
import Actions from '../../flux/actions.js'
import { dispatch } from '../../flux/dispatcher.js'

export default class SplashScreen extends Component {
    constructor(props) {
        super(props)

        this.state = {
            floatAnimValue: new Animated.Value(0)
        }
    }

    floatAnimation() {
        Animated.sequence([
            Animated.timing(this.state.floatAnimValue, {
                toValue: 1,
                duration: 3000
            }),
            Animated.timing(this.state.floatAnimValue, {
                toValue: 0,
                duration: 3000
            })
        ]).start(this.floatAnimation.bind(this))
    }

    componentDidMount() {
        this.floatAnimation()
    }

    render() {
        return <View style={ styles.screenBg }>
            <Text style={ splashStyles.splashText }>Space Whack</Text>

            <View style={ splashStyles.imgContainer }>
                <View style={ splashStyles.spacer } />
                <Animated.Image source={ Constants.IMG_PLANET }
                       style={ [splashStyles.imgPlanet, {
                           transform: [{
                               translateY: this.state.floatAnimValue.interpolate({
                                   inputRange: [0, 1],
                                   outputRange: [-5, 5]
                               })
                           }]
                       }]} />
                <Animated.Image source={ Constants.IMG_ROCK }
                       style={ [splashStyles.imgRock, {
                           transform: [{
                               translateY: this.state.floatAnimValue.interpolate({
                                   inputRange: [0, 1],
                                   outputRange: [5, -5]
                               })
                           }]
                       }]} />
                <View style={ splashStyles.spacer } />
            </View>

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

const splashStyles = StyleSheet.create({
    splashText: {
        color: 'white',
        fontFamily: Constants.SPLASH_FONT,
        fontSize: 50,
    },
    imgContainer: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        alignItems: 'center',
    },
    spacer: {
        flex: 1
    },
    imgPlanet: {
        flex: 4,
        resizeMode: 'contain'
    },
    imgRock: {
        flex: 1,
        resizeMode: 'contain'
    }
})

SplashScreen.propTypes = {
    isSoundOn: PropTypes.bool
}
