import React, { Component, PropTypes } from 'react'
import {
    Animated,
    Image,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View
} from 'react-native'

import * as Constants from '../constants.js'
import Actions from '../flux/actions.js'
import { dispatch } from '../flux/dispatcher.js'

export default class NavBar extends Component {
    constructor(props) {
        super(props)
        this.lifeAnimValue = new Animated.Value(1)
    }

    onTogglePause() {
        dispatch({ type: (this.props.isPaused ? Actions.RESUME_GAME : Actions.PAUSE_GAME) })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.numLives > this.props.numLives) {
            // We gained a life. Pop in that bad boy
            this.lifeAnimValue = new Animated.Value(0.1) // TODO: find out why 0.1 is necessary
            Animated.spring(this.lifeAnimValue, { toValue: 1, friction: 3 }).start()
        }
    }

    render() {
        // Show lives with repeating hearts
        const lifeEls = []
        for (let i = 0; i < this.props.numLives; i++) {
            const isMostRecent = i === this.props.numLives - 1
            lifeEls.push(
                <Animated.Image key={ i }
                                source={ Constants.IMG_LIFE }
                                style={ [styles.lifeImage, isMostRecent && {
                                    transform: [{ scale: this.lifeAnimValue }]
                                }] } />
            )
        }

        return <View style={ styles.navBar }>
            <Text style={ styles.score }>
                Score: { this.props.score }
            </Text>
            <View style={ styles.lifeContainer }>
                { lifeEls }
            </View>
            <View style={ styles.pauseContainer }>
                <TouchableWithoutFeedback onPress={ this.onTogglePause.bind(this) }>
                    <Image source={ Constants.IMG_PAUSE }
                           style={ styles.pauseButton } />
                </TouchableWithoutFeedback>
            </View>
        </View>
    }
}

NavBar.propTypes = {
    numLives: PropTypes.number.isRequired,
    score: PropTypes.number.isRequired
}

const styles = StyleSheet.create({
    navBar: {
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'flex-end',
        height: Constants.NAV_HEIGHT,
        padding: 10
    },
    score: {
        color: 'white',
        flex: 1,
        fontFamily: Constants.MAIN_FONT,
        fontSize: 20,
        fontWeight: 'bold'
    },
    pauseButton: {
        height: Constants.NAV_HEIGHT,
        resizeMode: 'contain'
    },
    pauseContainer: {
        flex: 1,
        alignItems: 'flex-end'
    },
    lifeContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'nowrap'
    },
    lifeImage: {
        height: Constants.NAV_HEIGHT,
        width: Constants.NAV_HEIGHT,
        resizeMode: 'contain'
    }
})
