module.exports = {
    bodies : {
        BASIC_WORKER_1: [MOVE, CARRY, WORK],
        BASIC_HARVESTER_1: [MOVE, CARRY, WORK],
        BASIC_UPGRADER_1: [MOVE, CARRY, WORK],
        BASIC_BUILDER_1: [MOVE, CARRY, WORK]
    },
    getTypesBody: function (type) {
        // return Object.entries(this.bodies).find(function (entry) {
        //     console.log(JSON.stringify(entry))
        //     console.log(type)
        //     return entry[0] === type
        // })[1]
        return this.bodies[type]
    }
}