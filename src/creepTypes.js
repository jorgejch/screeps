export default {
    bodies: {
        BASIC_HARVESTER_1: [MOVE, CARRY, WORK],                                                    // Total: 200
        BASIC_HARVESTER_2: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK],               // Total: 550
        BASIC_UPGRADER_1: [MOVE, CARRY, WORK],                                                     // Total: 200
        BASIC_UPGRADER_2: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK],                // Total: 550
        BASIC_BUILDER_1: [MOVE, CARRY, WORK],                                                      // Total: 200
        BASIC_BUILDER_2: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK],                 // Total: 550
        BASIC_REPAIRMAN_1: [MOVE, CARRY, WORK],                                                    // Total: 200
        BASIC_REPAIRMAN_2: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK],               // Total: 550
        COMMUTER_HARVESTER_1: [MOVE, CARRY, WORK],                                                 // Total: 200
        COMMUTER_HARVESTER_2: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK],     // Total: 550
        COMMUTER_UPGRADER_1: [MOVE, CARRY, WORK],                                                  // Total: 200
        COMMUTER_UPGRADER_2: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK],      // Total: 550
        STATIONARY_HARVESTER_3: [MOVE, CARRY, WORK, WORK, WORK, WORK, WORK, WORK, WORK],           // Total: 800
        LEECH_UPGRADER_3: [                                                                        // Total: 800
            MOVE, MOVE, MOVE, MOVE, MOVE,
            CARRY, CARRY, CARRY, CARRY, CARRY,
            WORK, WORK, WORK
        ],
        LEECH_REPAIRMAN_3: [                                                                       // Total: 800
            MOVE, MOVE, MOVE, MOVE, MOVE,
            CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
            WORK, WORK
        ],
        LEECH_BUILDER_3: [                                                                         // Total: 800
            MOVE, MOVE, MOVE, MOVE, MOVE,
            CARRY, CARRY, CARRY, CARRY, CARRY,
            WORK, WORK, WORK
        ],
    },
    getTypesBody: function (type) {
        return this.bodies[type]
    }
}