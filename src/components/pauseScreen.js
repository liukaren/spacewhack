import React, { Component, PropTypes } from 'react'
import {
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from 'react-native'
import * as Constants from '../constants.js'

export default class NavBar extends Component {
    render() {
        return <View style={ styles.screenBg }>
            <Text style={ styles.text }>
                PAUSED
            </Text>

            <TouchableHighlight onPress={ this.props.onResume }>
                <Text style={ styles.resumeButton }>Resume</Text>
            </TouchableHighlight>
        </View>
    }
}

NavBar.propTypes = {
    onResume: PropTypes.func.isRequired
}

const styles = StyleSheet.create({
    screenBg: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: 'black',
        borderColor: 'white',
        borderRadius: 5,
        borderWidth: 3,

        margin: Constants.GUTTER
    },
    text: {
        color: 'white',
        fontFamily: Constants.MAIN_FONT,
        fontSize: 30,
        fontWeight: 'bold',
        margin: Constants.GUTTER
    },
    resumeButton: {
        color: 'white',
        backgroundColor: 'gray',
        borderColor: 'white',
        borderRadius: 5,
        borderWidth: 1,
        padding: Constants.GUTTER,
        textAlign: 'center'
    }
})
