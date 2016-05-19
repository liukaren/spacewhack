import { Dimensions } from 'react-native'
import * as Constants from './constants.js'

export function getTileSize(level) {
    const { height, width } = Dimensions.get('window')
    const { numCols, numRows } = Constants.LEVELS[level]
    return {
        tileWidth: width / numCols,
        tileHeight: (height - Constants.NAV_HEIGHT) / numRows
    }
}
