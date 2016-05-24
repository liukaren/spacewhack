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
import Timer from '../timer.js'

// TODO: Why is this necessary? Values seem to be set incorrectly without this range
function interpolateAnimationHack(animValue) {
    return animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.01, 1]
    })
}

export default class Mole extends Component {
    constructor(props) {
        super(props)
        this.state = { moleState: MOLE_STATES.DEFAULT, numBops: 0 }
    }

    componentWillMount() {
        this.animValue = new Animated.Value(0)
        this.wormHoleAnimValue = new Animated.Value(0)
        this.bopAnimValue = new Animated.Value(0)

        // Animate the wormhole. Shortly after, animate the mole coming out of it
        Animated.stagger(Constants.MOLE_DELAY_MS, [
            Animated.timing(this.wormHoleAnimValue, {
                toValue: 1, duration: Constants.WORMHOLE_ANIMATION_MS
            }),
            Animated.spring(this.animValue, { toValue: 1, friction: 3 })
        ]).start()

        // After a timeout, animate the mole away and then call the parent to remove it
        this.removeTimeout = new Timer(() => {
            this.setState({ moleState: MOLE_STATES.EVADING })
            Animated.timing(this.animValue, { toValue: 0 }).start(this.props.onEvade)
        }, this.props.removeTimeoutMs)
    }

    componentWillUnmount() {
        this.removeTimeout.pause()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isPaused && !this.props.isPaused) { this.removeTimeout.pause() }
        if (!nextProps.isPaused && this.props.isPaused) { this.removeTimeout.resume() }
    }

    onBop() {
        // Do nothing if the mole is already defeated or leaving
        if (this.state.moleState === MOLE_STATES.DEFEATED ||
            this.state.moleState === MOLE_STATES.EVADING) { return }

        // Play a sound
        Helpers.playSound(Constants.SOUND_BOP, this.props.isSoundOn)

        const numBops = this.state.numBops + 1
        this.bopAnimValue.setValue(0)
        this.bopAnimation = Animated.timing(this.bopAnimValue, {
            toValue: 1, easing: Easing.easeIn
        })

        if (numBops >= this.props.moleType.bopsNeeded) {
            // Clear the remove timeout because the bop will remove it
            this.removeTimeout.pause()

            // When the animation is finished, call the parent fn to remove the mole
            this.setState({ moleState: MOLE_STATES.DEFEATED, numBops }, () => {
                this.bopAnimation.start(this.props.onDefeat)
            })
        } else {
            // When the animation is finished, reset state
            this.setState({ moleState: MOLE_STATES.BOPPED, numBops }, () => {
                this.bopAnimation.start(() => {
                    this.setState({ moleState: MOLE_STATES.DEFAULT })
                })
            })
        }
    }

    render() {
        const image = this.props.moleType.image
        const boppedImage = this.props.moleType.boppedImage
        const { tileWidth, tileHeight } = Helpers.getTileSize(this.props.level)
        const moleState = this.state.moleState

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
        return <TouchableWithoutFeedback onPress={ this.onBop.bind(this) }>
            <View style={{ width: tileWidth, height: tileHeight }}>
                <Animated.Image source={ require('../../images/wormhole.png') }
                                style={ Object.assign({}, imageStyle, {
                                    opacity: this.wormHoleAnimValue.interpolate({
                                        inputRange: [0, 0.8, 1],
                                        outputRange: [0, 1, 0]
                                    }),
                                    transform: [{
                                        rotate: this.wormHoleAnimValue.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '90deg']
                                        })
                                    }, {
                                        scale: this.wormHoleAnimValue.interpolate({
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
                                            interpolateAnimationHack(this.animValue) : 0,
                                    transform: [{
                                        scale: interpolateAnimationHack(this.animValue)
                                    }]
                                })} />
                <Animated.Image source={ boppedImage }
                                style={ Object.assign({}, imageStyle, {
                                    opacity: moleState === MOLE_STATES.BOPPED ? 1 : 0,
                                    transform: [{
                                        scale: this.bopAnimValue.interpolate({
                                            inputRange: [0, 0.5, 1],
                                            outputRange: [1, Constants.MOLE_SHRINK_SCALE, 1]
                                        })
                                    }]
                                })} />
                <Animated.Image source={ boppedImage }
                                style={ Object.assign({}, imageStyle, {
                                    opacity: moleState === MOLE_STATES.DEFEATED ? 1 : 0,
                                    transform: [{
                                        scale: this.bopAnimValue.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [1, 0]
                                        })
                                    }]
                                })} />
                { this.props.moleType.scoreValue > 0 &&
                  this.state.moleState === MOLE_STATES.DEFEATED &&
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
                            translateY: this.bopAnimValue.interpolate({
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
    isPaused: PropTypes.bool,
    isSoundOn: PropTypes.bool,
    level: PropTypes.number.isRequired,
    moleType: PropTypes.oneOf(Constants.MOLE_TYPES).isRequired,
    onDefeat: PropTypes.func.isRequired,
    onEvade: PropTypes.func.isRequired, // Call this when animations are done to fully remove
    removeTimeoutMs: PropTypes.number.isRequired
}
