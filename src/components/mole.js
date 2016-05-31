import React, { Component, PropTypes } from 'react'
import {
    Animated,
    Easing,
    TouchableWithoutFeedback,
    View
} from 'react-native'
import * as Constants from '../constants.js'
import { MOLE_STATES } from '../constants.js'
import * as Helpers from '../helpers.js'

import Actions from '../flux/actions.js'
import { dispatch } from '../flux/dispatcher.js'

// TODO: Why is this necessary? Values seem to be set incorrectly without this range
function interpolateAnimationHack(animValue) {
    return animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.01, 1]
    })
}

export default class Mole extends Component {
    render() {
        const image = this.props.moleType.image
        const boppedImage = this.props.moleType.boppedImage
        const { tileWidth, tileHeight } = Helpers.getTileSize(this.props.level)
        const moleState = this.props.moleState

        const imageStyle = {
            position: 'absolute',
            bottom: 0,
            left: 0,

            width: tileWidth,
            height: tileHeight,
            resizeMode: 'contain'
        }

        // NOTE: All images are rendered with an opacity of 0 rather than
        // unrendered so there is no flicker when switching between images.
        return <TouchableWithoutFeedback onPress={ () => {
                dispatch({
                    type: Actions.BOP_MOLE,
                    row: this.props.row,
                    col: this.props.col
                })
            }}>
            <View style={{ width: tileWidth, height: tileHeight }}>
                <Animated.Image source={ Constants.IMG_WORMHOLE }
                                style={ Object.assign({}, imageStyle, {
                                    opacity: this.props.wormHoleAnimValue.interpolate({
                                        inputRange: [0, 0.8, 1],
                                        outputRange: [0, 1, 0]
                                    }),
                                    transform: [{
                                        rotate: this.props.wormHoleAnimValue.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '90deg']
                                        })
                                    }, {
                                        scale: this.props.wormHoleAnimValue.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.5, 1]
                                        })
                                    }]
                               })} />
                <Animated.Image source={ image }
                                style={ Object.assign({}, imageStyle, {
                                    opacity: (
                                        moleState === MOLE_STATES.DEFAULT ||
                                        moleState === MOLE_STATES.EVADING) ?
                                            interpolateAnimationHack(this.props.animValue) : 0,
                                    transform: [{
                                        scale: interpolateAnimationHack(this.props.animValue)
                                    }]
                                })} />
                <Animated.Image source={ boppedImage }
                                style={ Object.assign({}, imageStyle, {
                                    opacity: moleState === MOLE_STATES.BOPPED ? 1 : 0,
                                    transform: [{
                                        scale: this.props.bopAnimValue.interpolate({
                                            inputRange: [0, 0.5, 1],
                                            outputRange: [1, Constants.MOLE_SHRINK_SCALE, 1]
                                        })
                                    }]
                                })} />
                <Animated.Image source={ boppedImage }
                                style={ Object.assign({}, imageStyle, {
                                    opacity: moleState === MOLE_STATES.DEFEATED ? 1 : 0,
                                    transform: [{
                                        scale: this.props.bopAnimValue.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [1, 0]
                                        })
                                    }]
                                })} />
                <Animated.Image source={ Constants.IMG_BOMB }
                                style={ Object.assign({}, imageStyle, {
                                    transform: [{
                                        scale: interpolateAnimationHack(this.props.bombAnimValue)
                                    }]
                                })} />
                { this.props.moleType.scoreValue > 0 &&
                  this.props.moleState === MOLE_STATES.DEFEATED &&
                    <Animated.Text style={{
                        position: 'absolute',
                        bottom: tileHeight / 3,
                        left: 0,
                        right: 0,
                        backgroundColor: 'transparent',
                        color: 'white',
                        fontFamily: 'American Typewriter',
                        fontSize: 24,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        transform: [{
                            translateY: this.props.bopAnimValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -tileHeight / 3]
                            })
                        }]
                    }}>+{ this.props.moleType.scoreValue }</Animated.Text> }
            </View>
        </TouchableWithoutFeedback>
    }
}

Mole.propTypes = {
    level: PropTypes.number.isRequired,
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    moleState: PropTypes.oneOf(
        Object.keys(Constants.MOLE_STATES).map((k) => Constants.MOLE_STATES[k])
    ).isRequired,
    moleType: PropTypes.oneOf(Constants.MOLE_TYPES).isRequired,
    numBops: PropTypes.number.isRequired
}
