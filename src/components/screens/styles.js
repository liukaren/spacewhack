import { StyleSheet } from 'react-native'
import * as Constants from '../../constants.js'

export default styles = StyleSheet.create({
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
    button: {
        color: 'white',
        backgroundColor: 'gray',
        borderColor: 'white',
        borderRadius: 5,
        borderWidth: 1,
        padding: Constants.GUTTER,
        textAlign: 'center'
    }
})
