# cantal-js
Will collect metrics from your nodejs application

## Usage example
```js
import cantal from '@evo/cantal-js';

const requests = new cantal.Counter({
    group: "incoming",
    metric: "requests"
});

createServer((req, res) => {
    requests.incr();
})

// need to be called somewhere once
cantal.start();
```

## ENV
`CANTAL_PATH` - path for storing metrics

## Metrics
### Counter
```js
const requests = new cantal.Counter({
    group: "incoming",
    metric: "requests"
});

requests.incr();
```

### Integer
```js
const memory = new cantal.Integer({
    group: "v8-stats",
    metric: "malloced_memory"
});

memory.set(stats.memory);
// memory.incr();
// memory.decr();
```

## V8 metrics
Some v8 metrics will be collected by default in group `v8-stats`

* `new_space_used_size` - heap new space used size
* `old_space_used_size` - heap old space used size
* `code_space_used_size` - heap code space used size
* `map_space_used_size` - heap map space used size
* `large_object_space_used_size` - heap large object space used size
* `malloced_memory` - allocated memory for the process

Details for collected metrics [here](https://nodejs.org/api/v8.html#v8_v8_getheapspacestatistics)
