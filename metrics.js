var Int64 = require('node-cint64').Int64
var active_metrics = []

class Integer {
    constructor(name) {
        this.name = name
        this.memory = null
        active_metrics.push(this)
    }
    getSize() {
        return 8;
    }
    getType() {
        return "level 8 signed";
    }
    setMemory(buf) {
        this.memory = buf
    }
    set(val) {
        if (!this.memory) return;
        new Int64(val).intoBuffer(this.memory)
    }
    incr(val=1) {
        if (!this.memory) return;
        new Int64(this.memory).add(val).intoBuffer(this.memory)
    }
    decr(val=1) {
        if (!this.memory) return;
        new Int64(this.memory).sub(val).intoBuffer(this.memory)
    }
}

class Counter {
    constructor(name) {
        this.name = name
        this.memory = null
        active_metrics.push(this)
    }
    getSize() {
        return 8;
    }
    getType() {
        return "counter 8";
    }
    setMemory(buf) {
        this.memory = buf
    }
    incr(val=1) {
        if (!this.memory) return;
        new Int64(this.memory).add(val).intoBuffer(this.memory)
    }
}

module.exports = { Integer, Counter, active_metrics };
