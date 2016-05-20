import React, { Component, PropTypes } from 'react'
import {
    Image,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View
} from 'react-native'
import * as Constants from '../constants.js'

export default class NavBar extends Component {
    render() {
        // Show lives with repeating hearts
        const lifeEls = []
        for (let i = 0; i < this.props.numLives; i++) {
            lifeEls.push(<Image key={ i }
                                source={ require('../../images/heart.png') }
                                style={ styles.lifeImage } />)
        }

        return <View style={ styles.navBar }>
            <Text style={ styles.score }>
                Score: { this.props.score }
            </Text>
            { lifeEls }
            <TouchableWithoutFeedback onPress={ this.props.onPause }>
                <Image source={ require('../../images/pause.png') }
                       style={ styles.pauseButton } />
            </TouchableWithoutFeedback>
        </View>
    }
}

NavBar.propTypes = {
    numLives: PropTypes.number.isRequired,
    onPause: PropTypes.func.isRequired,
    score: PropTypes.number.isRequired,
}

const styles = StyleSheet.create({
    navBar: {
        alignItems: 'center',
        flexDirection: 'row',
        height: Constants.NAV_HEIGHT,
        padding: 10
    },
    score: {
        backgroundColor: 'transparent',
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
    lifeImage: {
        height: Constants.NAV_HEIGHT,
        width: Constants.NAV_HEIGHT,
        resizeMode: 'contain'
    }
})
