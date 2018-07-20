module.exports = {
    BASIC_WORKER_1: [MOVE, MOVE, CARRY, CARRY, WORK],                                          // Total: 300
    BASIC_WORKER_2: [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK],                        // Total: 550
    BASIC_WORKER_3: [                                                                          // Total: 800
        MOVE, MOVE, MOVE, MOVE,
        CARRY, CARRY, CARRY, CARRY,
        WORK, WORK, WORK, WORK,
    ],
    BASIC_WORKER_4: [                                                                          // Total: 1300
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,                                                   //350
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,                                            //350
        WORK, WORK, WORK, WORK, WORK, WORK                                                          //600
    ],
    BASIC_WORKER_5: [                                                                          // Total: 1800
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,                                       //450
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,                              //450
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK                                        //900
    ],
    BASIC_WORKER_6: [                                                                          // Total: 2300
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,                     //450
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,         //450
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK                            //1100
    ],
    BASIC_WORKER_7: [                                                                          // Total: 2300
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,                     //450
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,         //450
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK                            //1100
    ],
    BASIC_WORKER_8: [                                                                          // Total: 2300
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,                     //450
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,         //450
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK                            //1100
    ],
    COMMUTER_WORKER_1: [MOVE, CARRY, WORK],                                                    // Total: 200
    COMMUTER_WORKER_2: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK],       // Total: 550
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
    LOADER_4: [                                                                                // Total: 1700
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY
    ],
    STATIONARY_WORKER_3: [                                                                     // Total: 700
        MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK,
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
}