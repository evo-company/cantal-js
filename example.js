let cantal = require('./index.js')
let counter = new cantal.Counter({
    "group": "example",
    "metric": "dots_printed",
    })
let integer = new cantal.Integer({
    "group": "example",
    "metric": "random_value",
    })
cantal.start()

setInterval(function() {
    counter.incr()
    integer.set(10 + Math.floor(Math.random() * 100))
    process.stdout.write(".")
}, 1000)
