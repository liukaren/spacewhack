import React, { Component, PropTypes } from 'react'
import {
    Animated,
    Easing,
    TouchableWithoutFeedback,
    View
} from 'react-native'
import * as Constants from '../constants.js'
import * as Helpers from '../helpers.js'

export default class Mole extends Component {
    constructor(props) {
        super(props)
        this.state = { moleState: Constants.MOLE_STATES.DEFAULT, numBops: 0 }
    }

    componentWillMount() {
        this.animValue = new Animated.Value(0)
        this.wormHoleAnimValue = new Animated.Value(0)
        this.bopAnimValue = new Animated.Value(0)

        // Animate the wormhole
        Animated.timing(this.wormHoleAnimValue, {
            toValue: 1, duration: Constants.WORMHOLE_ANIMATION_MS
        }).start()
        // Shortly after, animate the mole coming out of it
        Animated.sequence([
            Animated.delay(Constants.MOLE_DELAY_MS),
            Animated.spring(this.animValue, { toValue: 1, friction: 3 })
        ]).start()

        // After a timeout, animate the mole away and then call the parent to remove it
        this.removeTimeout = setTimeout(() => {
            this.setState({ moleState: Constants.MOLE_STATES.EVADING })
            Animated.timing(this.animValue, { toValue: 0 }).start(this.props.onEvade)
        }, this.props.removeTimeoutMs)
    }

    componentWillUnmount() {
        clearTimeout(this.removeTimeout)
        clearTimeout(this.animateMoleTimeout)
        if (this.bopAnimation) { this.bopAnimation.stop() }
    }

    onBop() {
        // Do nothing if the mole is already leaving
        if (this.state.moleState === Constants.MOLE_STATES.EVADING) { return; }

        const numBops = this.state.numBops + 1
        this.bopAnimValue.setValue(0)
        this.bopAnimation = Animated.timing(this.bopAnimValue, {
            toValue: 1, easing: Easing.easeIn
        })

        if (numBops >= this.props.moleType.bopsNeeded) {
            // Clear the remove timeout because the bop will remove it
            clearTimeout(this.removeTimeout)

            // When the animation is finished, call the parent fn to remove the mole
            this.setState({ moleState: Constants.MOLE_STATES.DEFEATED, numBops })
            this.bopAnimation.start(this.props.onDefeat)
        } else {
            // When the animation is finished, reset state
            this.setState({ moleState: Constants.MOLE_STATES.BOPPED, numBops })
            this.bopAnimation.start(() => {
                this.setState({ moleState: Constants.MOLE_STATES.DEFAULT })
            })
        }
    }

    render() {
        const image = this.props.moleType.image
        const boppedImage = this.props.moleType.boppedImage
        const { tileWidth, tileHeight } = Helpers.getTileSize()

        return <TouchableWithoutFeedback onPress={ this.onBop.bind(this) }>
            <View>
                <Animated.Image source={ require('../../images/wormhole.png') }
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    resizeMode: 'contain',
                                    width: tileWidth,
                                    height: tileHeight,
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
                               }} />
                { (this.state.moleState === Constants.MOLE_STATES.DEFAULT ||
                   this.state.moleState === Constants.MOLE_STATES.EVADING) &&
                    <Animated.Image source={ image }
                                    style={{
                                        width: tileWidth,
                                        height: tileHeight,
                                        resizeMode: 'contain',
                                        opacity: this.animValue.interpolate({
                                            // Invisible until animating
                                            inputRange: [0, 0.1, 1],
                                            outputRange: [0, 1, 1]
                                        }),
                                        transform: [{
                                            scale: this.animValue.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.1, 1]
                                            })
                                        }]
                                    }} /> }
                { this.state.moleState === Constants.MOLE_STATES.BOPPED &&
                    <Animated.Image source={ boppedImage }
                                    style={{
                                        width: tileWidth,
                                        height: tileHeight,
                                        resizeMode: 'contain',
                                        transform: [{
                                            scale: this.bopAnimValue.interpolate({
                                                inputRange: [0, 0.5, 1],
                                                outputRange: [1, Constants.MOLE_SHRINK_SCALE, 1]
                                            })
                                        }]
                                    }}>
                    </Animated.Image> }
                { this.state.moleState === Constants.MOLE_STATES.DEFEATED &&
                    <Animated.Image source={ boppedImage }
                                    style={{
                                        width: tileWidth,
                                        height: tileHeight,
                                        resizeMode: 'contain',
                                        transform: [{
                                            scale: this.bopAnimValue.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [1, 0]
                                            })
                                        }]
                                    }}>
                    </Animated.Image> }
                { this.props.moleType.scoreValue > 0 &&
                  this.state.moleState === Constants.MOLE_STATES.DEFEATED &&
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
    moleType: PropTypes.oneOf(Constants.MOLE_TYPES).isRequired,
    onDefeat: PropTypes.func.isRequired,
    onEvade: PropTypes.func.isRequired, // Call this when animations are done to fully remove
    removeTimeoutMs: PropTypes.number.isRequired
}
