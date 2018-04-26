const v8 = require('v8');
const cantal = require('./index');

function startV8Collect() {
    const newSpaceUsedSize = new cantal.Integer({
        group: "v8-stats",
        metric: "new_space_used_size"
    });

    const oldSpaceUsedSize = new cantal.Integer({
        group: "v8-stats",
        metric: "old_space_used_size"
    });

    const codeSpaceUsedSize = new cantal.Integer({
        group: "v8-stats",
        metric: "code_space_used_size"
    });

    const mapSpaceUsedSize = new cantal.Integer({
        group: "v8-stats",
        metric: "map_space_used_size"
    });

    const largeObjectUsedSpaceSize = new cantal.Integer({
        group: "v8-stats",
        metric: "large_object_space_used_size"
    });

    const mallocedMemory = new cantal.Integer({
        group: "v8-stats",
        metric: "malloced_memory"
    });

    setInterval(() => {
        const spaceData = v8.getHeapSpaceStatistics();
        const heapStats = v8.getHeapStatistics();
        
        spaceData.forEach(space => {
            if (space.space_name === "new_space") {
                newSpaceUsedSize.set(space.space_used_size);
            }
            if (space.space_name === "old_space") {
                oldSpaceUsedSize.set(space.space_used_size);
            }
            if (space.space_name === "code_space") {
                codeSpaceUsedSize.set(space.space_used_size);
            }
            if (space.space_name === "map_space") {
                mapSpaceUsedSize.set(space.space_used_size);
            }
            if (space.space_name === "large_object_space") {
                largeObjectUsedSpaceSize.set(space.space_used_size);
            }
        });

        mallocedMemory.set(heapStats.malloced_memory);
    }, 2000);
}

module.exports = { startV8Collect };
