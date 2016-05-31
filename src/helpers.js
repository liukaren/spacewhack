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

export function playSound(soundFile, loop) {
    soundFile.setCurrentTime(0)
    if (loop) { soundFile.setNumberOfLoops(-1) }
    soundFile.play()
}

export function objValues(obj) {
    return Object.keys(obj).map((k) => obj[k])
}
