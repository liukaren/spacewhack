import { Dimensions } from 'react-native'
import * as Constants from './constants.js'

export function getTileSize() {
    const { height, width } = Dimensions.get('window')
    return {
        tileWidth: width / Constants.NUM_COLS,
        tileHeight: (height - Constants.NAV_HEIGHT) / Constants.NUM_ROWS
    }
}
