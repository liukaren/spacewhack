// It's pausable!
// From http://stackoverflow.com/questions/2626005/how-to-pause-a-settimeout-call

// Use states to make it safe to call resume() or pause() at any time.
const STATES = {
    RUNNING: 1,
    PAUSED: 2,
    CLEARED: 3 // Terminal state
}

export default class Timer {
    constructor(callback, delay) {
        this.remaining = delay
        this.callback = callback
        this.state = STATES.PAUSED
        this.resume()
    }

    pause() {
        if (this.state !== STATES.RUNNING) { return }

        this.state = STATES.PAUSED
        clearTimeout(this.timerId)
        this.remaining -= new Date() - this.start
    }

    resume() {
        if (this.state !== STATES.PAUSED) { return }

        this.state = STATES.RUNNING
        this.start = new Date()
        if (this.timerId) { clearTimeout(this.timerId) }
        this.timerId = setTimeout(() => {
            this.state = STATES.CLEARED
            this.callback()
        }, this.remaining)
    }

    clear() {
        this.state = STATES.CLEARED
        clearTimeout(this.timerId)
        this.timerId = null
        this.remaining = 0
    }
}
