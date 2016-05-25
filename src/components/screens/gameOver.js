import React, { Component } from 'react'
import {
    Text,
    TouchableHighlight,
    View
} from 'react-native'
import Actions from '../../flux/actions.js'
import { dispatch } from '../../flux/dispatcher.js'
import styles from './styles.js'

export default class GameOverScreen extends Component {
    render() {
        return <View style={ styles.screenBg }>
            <Text style={ styles.title }>Game Over</Text>

            <TouchableHighlight onPress={ () => dispatch({ type: Actions.QUIT_GAME }) }>
                <Text style={ styles.button }>Restart</Text>
            </TouchableHighlight>
        </View>
    }
}
