export default {
    bodies: {
        BASIC_WORKER_1: [MOVE, CARRY, WORK],                                                       // Total: 200
        BASIC_WORKER_2: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK],                  // Total: 550
        BASIC_WORKER_3: [                                                                          // Total: 1000
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            CARRY, CARRY, CARRY, CARRY,
            WORK, WORK, WORK, WORK
        ],
        COMMUTER_WORKER_1: [MOVE, CARRY, WORK],                                                    // Total: 200
        COMMUTER_WORKER_2: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK],        // Total: 550
        COMMUTER_WORKER_3: [                                                                       // Total: 950
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            CARRY, CARRY, CARRY, CARRY, CARRY,
            WORK, WORK, WORK
        ],
        COMMUTER_WORKER_4: [                                                                       // Total: 1250
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            CARRY, CARRY, CARRY, CARRY, CARRY,
            WORK, WORK, WORK, WORK, WORK
        ],
        LOADER_2: [                                                                                // Total: 500
            MOVE, MOVE, MOVE, MOVE, MOVE,
            CARRY, CARRY, CARRY, CARRY, CARRY
        ],
        LOADER_3: [                                                                                // Total: 1000
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY
        ],
        LOADER_4: [                                                                                // Total: 1300
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE, MOVE,
            CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
            CARRY, CARRY, CARRY
        ],
        STATIONARY_WORKER_3: [                                                                     // Total: 900
            MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK
        ],
        STATIONARY_WORKER_4: [                                                                     // Total: 1300
            MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK,
            WORK, WORK, WORK, WORK, WORK, WORK
        ],
        FARREACH_STATIONARY_WORKER_3: [                                                            // Total: 1000
            MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK
        ],
        CLAIMER_2: [                                                                          // Total: 1300
            MOVE, MOVE, CLAIM, CLAIM
        ]
    },
    getTypeBody: function (type) {
        return this.bodies[type]
    }
}