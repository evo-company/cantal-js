var fs = require('fs')
var mmap = require('mmap.js')
var Int64 = require('node-cint64').Int64
var v8Metrics = require('./v8-stats');
var active_metrics = []
var buffer

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
        new Int64(val).intoBuffer(this.memory)
    }
    incr(val=1) {
        new Int64(this.memory).add(val).intoBuffer(this.memory)
    }
    decr(val=1) {
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
        new Int64(this.memory).add(val).intoBuffer(this.memory)
    }
}

function silentDelete(path) {
    try {
        fs.unlinkSync(path)
    } catch(e) {
        if(e.code != 'ENOENT') {
            throw e;
        }
    }
}

function start() {
    let offset = 00
    let scheme = ""

    v8Metrics.startV8Collect();    
    
    for(var item of active_metrics) {
        offset += item.getSize();
        let typ = item.getType()

        json = JSON.stringify(item.name)
        scheme += `${typ}: ${json}\n`;
    }
    let basepath = process.env.CANTAL_PATH
    if(!basepath) {
        let runtime_dir = process.env.XDG_RUNTIME_DIR

        if(runtime_dir) {
            basepath = `${runtime_dir}/cantal.${process.pid}`
        } else {
            basepath = `/tmp/cantal.${process.getuid()}.${process.pid}`
        }

        console.warn("No CANTAL_PATH is set in the environment, using %s.",
            basepath)
    }

    let tmppath = basepath + '.tmp'
    let metapath = basepath + '.meta'
    let path = basepath + '.values'

    silentDelete(tmppath)
    silentDelete(path)
    silentDelete(metapath)

    let fd = fs.openSync(tmppath, "w+")
    // TODO(optimize) buffer allocation
    let size = Math.max(offset, 4096)
    let zeros = Buffer.alloc(size)
    fs.writeSync(fd, zeros, 0, size)
    buffer = mmap.alloc(size, mmap.PROT_READ|mmap.PROT_WRITE,
                        mmap.MAP_SHARED, fd, 0)
    fs.closeSync(fd)
    fs.renameSync(tmppath, path)

    fs.writeFileSync(tmppath, scheme)
    fs.renameSync(tmppath, metapath)

    offset = 0
    for(var metric of active_metrics) {
        metric.setMemory(buffer.slice(offset, offset + metric.getSize()))
        offset += metric.getSize()
    }
}

module.exports = {
    Integer: Integer,
    Counter: Counter,
    start: start,
}
