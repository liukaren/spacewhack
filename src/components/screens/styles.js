import { StyleSheet } from 'react-native'
import * as Constants from '../../constants.js'

export default StyleSheet.create({
    screenBg: {
        alignItems: 'center',
        justifyContent: 'center',

        position: 'absolute',
        top: Constants.NAV_HEIGHT,
        left: 0,
        right: 0,
        bottom: 0,

        backgroundColor: 'black',
        borderColor: 'white',
        borderRadius: 5,
        borderWidth: 3,
        margin: Constants.GUTTER,
    },
    screenBgOverlay: {
        opacity: 0.7
    },
    title: {
        color: 'white',
        fontFamily: Constants.MAIN_FONT,
        fontSize: 30,
        fontWeight: 'bold',
        margin: Constants.GUTTER
    },
    text: {
        color: 'white',
        fontFamily: Constants.MAIN_FONT,
        fontSize: 20,
        margin: Constants.GUTTER
    },
    button: {
        color: 'white',
        backgroundColor: 'gray',
        borderColor: 'white',
        borderRadius: 5,
        borderWidth: 1,
        margin: Constants.GUTTER,
        padding: Constants.GUTTER,
        textAlign: 'center'
    },
    previewImage: {
        width: 100, // TODO
        height: 100,
        margin: Constants.GUTTER,
        resizeMode: 'contain'
    }
})
