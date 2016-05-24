// It's pausable!
// From http://stackoverflow.com/questions/2626005/how-to-pause-a-settimeout-call
export default class Timer {
    constructor(callback, delay) {
        this.remaining = delay
        this.callback = callback
        this.resume()
    }

    pause() {
        clearTimeout(this.timerId)
        this.remaining -= new Date() - this.start
    }

    resume() {
        this.start = new Date()
        if (this.timerId) { clearTimeout(this.timerId) }
        this.timerId = setTimeout(this.callback, this.remaining)
    }
}
