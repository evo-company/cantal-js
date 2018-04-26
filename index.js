var fs = require('fs')
var mmap = require('mmap.js')
var v8Metrics = require('./v8-stats');
var metrics = require('./metrics');
var buffer


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

    for(var item of metrics.active_metrics) {
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
    for(var metric of metrics.active_metrics) {
        metric.setMemory(buffer.slice(offset, offset + metric.getSize()))
        offset += metric.getSize()
    }
}

module.exports = {
    Integer: metrics.Integer,
    Counter: metrics.Counter,
    start: start,
}
