'use strict'

module.exports = {
    SCOUT_1: [MOVE],                                                                                // Total: 50
    BASIC_WORKER_1: [MOVE, MOVE, CARRY, CARRY, WORK],                                               // Total: 300
    BASIC_WORKER_2: [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK],                             // Total: 550
    BASIC_WORKER_3: [                                                                               // Total: 800
        MOVE, MOVE, MOVE, MOVE,                                                                         // 200
        CARRY, CARRY, CARRY, CARRY,                                                                     // 200
        WORK, WORK, WORK, WORK                                                                          // 200
    ],
    BASIC_WORKER_4: [                                                                               // Total: 1300
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,                                                       // 350
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,                                                // 350
        WORK, WORK, WORK, WORK, WORK, WORK                                                              // 600
    ],
    BASIC_WORKER_5: [                                                                               // Total: 1800
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,                                           // 450
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,                                  // 450
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK                                            // 900
    ],
    BASIC_WORKER_6: [                                                                               // Total: 2300
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,                         // 600
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,             // 600
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK                                // 1100
    ],
    BASIC_WORKER_7: [                                                                               // Total: 3350
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,                                              // 850
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,                                    // 800
        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
        WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,                                              // 1700
        WORK,WORK,WORK,WORK,WORK,WORK,WORK,
    ],
    FREIGHTER_2: [                                                                                  // Total: 550
        MOVE, MOVE, MOVE, MOVE,                                                                         // 200
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,                                                // 350
    ],
    FREIGHTER_3: [                                                                                  // Total: 750
        MOVE, MOVE, MOVE, MOVE, MOVE,                                                                   // 250
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY                            // 500
    ],
    FREIGHTER_4: [                                                                                  // Total: 1300
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,                                           // 450
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,                           // 850
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY
    ],
    FREIGHTER_5: [                                                                                  // Total: 1800
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,                         // 600
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,             // 1200
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY
    ],
    FREIGHTER_6: [                                                                                  // Total: 2300
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,             // 800
        MOVE, MOVE,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,             // 1500
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY
    ],
    STATIONARY_WORKER_2: [                                                                          // Total: 500
        MOVE, CARRY, WORK, WORK, WORK, WORK
    ],
    STATIONARY_WORKER_3: [                                                                          // Total: 800
        MOVE, MOVE, MOVE, CARRY, WORK, WORK, WORK, WORK, WORK, WORK,
    ],
    STATIONARY_WORKER_4: [                                                                          // Total: 1300
        MOVE, MOVE, MOVE, MOVE, MOVE,                                                                   // 250
        CARRY,                                                                                          // 50
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK                                // 1000
    ],
    STATIONARY_WORKER_5: [                                                                          // Total: 1800
        MOVE, MOVE, MOVE, MOVE, MOVE,                                                                   // 250
        CARRY,                                                                                          // 50
        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,WORK, WORK, WORK         // 1500
    ],
    CLAIMER_3: [                                                                                    // Total: 650
        MOVE, CLAIM
    ],
    CLAIMER_4: [                                                                                    // Total: 1300
        MOVE, MOVE,                                                                                     // 100
        CLAIM, CLAIM                                                                                    // 1200
    ],
    ATTACKER_3: [                                                                                   // Total: 750
        TOUGH, TOUGH, TOUGH,                                                                            // 150
        MOVE, MOVE, MOVE, MOVE,                                                                         // 200
        ATTACK, ATTACK, ATTACK, ATTACK, ATTACK                                                          // 400
    ]
}