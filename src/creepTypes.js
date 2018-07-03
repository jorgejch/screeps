export default {
    bodies : {
        BASIC_WORKER_1: [MOVE, CARRY, WORK],
        BASIC_HARVESTER_1: [MOVE, CARRY, WORK],                   // Total: 200
        BASIC_HARVESTER_2: [MOVE, MOVE, CARRY, WORK, WORK],       // Total: 350
        BASIC_UPGRADER_1: [MOVE, CARRY, WORK],
        BASIC_UPGRADER_2: [MOVE, MOVE, CARRY, WORK, WORK],
        BASIC_BUILDER_1: [MOVE, CARRY, WORK],
        BASIC_BUILDER_2: [MOVE, MOVE, CARRY, WORK, WORK],
        BASIC_REPAIRMAN_1: [MOVE, CARRY, WORK],
        BASIC_REPAIRMAN_2: [MOVE, MOVE, CARRY, WORK, WORK],
        COMMUTER_HARVESTER_1: [MOVE, CARRY, WORK],
        COMMUTER_HARVESTER_2: [MOVE, MOVE, MOVE, MOVE, CARRY, WORK],
        COMMUTER_UPGRADER_1: [MOVE, CARRY, WORK],
        COMMUTER_UPGRADER_2: [MOVE, MOVE, MOVE, MOVE, CARRY, WORK],
    },
    getTypesBody: function (type) {
        return this.bodies[type]
    }
}