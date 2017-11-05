module.exports = {
    spawn: function (spawn) {
        let name;
        let return_code;
        if (Memory.distributors.length >= Memory.numDistributors && spawn.energy >= 100) {
            if (Memory.harvesters.length < Memory.numHarvesters) {
                name = 'BigHarvester' + Game.time;
                return_code = spawn.spawnCreep(
                    [   // total: 2300
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, /* 350 */
                        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, /* 650 */
                        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, /* 1300 */
                    ],
                    name, {memory: {role: "harvester", subrole: "local", citizenship: spawn.room.name}});
                console.log("Fazendo harvester: " + return_code);
                return;
            }
            // if (Memory.harvesters.length < Memory.numHarvesters) {
            //     name = 'SmallHarvester' + Game.time;
            //     return_code = spawn.spawnCreep(
            //         [   // total: 700
            //             MOVE, MOVE, MOVE, MOVE,         /* 200 */
            //             CARRY, CARRY, CARRY, CARRY,     /* 200  */
            //             WORK, WORK, WORK,               /* 300 */
            //         ],
            //         name, {memory: {role: "harvester", subrole: "local", citizenship: spawn.room.name}});
            //     console.log("Fazendo harvester: " + return_code);
            //     return;
            // }
            else if (Memory.commuterHarvesters.length < Memory.numCommuterHarvesters) {
                name = 'BigCommuterHarvester' + Game.time;
                return_code = spawn.spawnCreep(
                    [   // total: 2300
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, /* 700 */
                        MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, /* 600 */
                        CARRY, CARRY, CARRY, CARRY, /* 200 */
                        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK /* 800 */
                    ],
                    name,
                    {
                        memory: {
                            role: "harvester",
                            subrole: "commuter",
                            citizenship: spawn.room.name,
                            target: "W71S74",
                            preferredSource: Memory.commuterHarvesters
                                .filter((s) => s.memory.preferredSource === 0)
                                .length < Memory.commuterHarvesters.length / 2 ? 0 : 1
                        }
                    }
                );
                console.log("Fazendo BigCommuterHarvester: " + return_code);
                return;
            }
            else if (Memory.guards.length < Memory.numGuards) {
                name = 'Guard' + Game.time;
                return_code = spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, TOUGH, ATTACK, ATTACK, ATTACK],
                    name, {memory: {role: "guard", citizenship: spawn.room.name}});
                console.log("Fazendo guard: " + return_code);
                return;
            }
            else if (Memory.builders.length < Memory.numBuilders) {
                name = 'BigBuilder' + Game.time;
                return_code = spawn.spawnCreep(
                    [
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, /* 400 */
                        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, /* 500 */
                        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK /* 900 */
                    ],
                    name, {
                        memory: {
                            role: "builder",
                            subrole: "local",
                            citizenship: Memory.builders.filter((c) => c.memory.citizenship === "W71S75").length < 0
                                ? "W71S75" : "W71S73"
                        }
                    });
                console.log("Fazendo builder: " + return_code);
                return;
            }
            else if (Memory.conquerors.length < Memory.numConquerors) {
                name = 'Conqueror' + Game.time;
                return_code = spawn.spawnCreep(
                    [
                        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, /*100*/
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, /*600*/
                        HEAL, WORK, WORK, CARRY, CLAIM, /*1100*/
                    ],
                    name, {memory: {role: "conqueror", citizenship: "W71S73"}});
                console.log("Fazendo conqueror: " + return_code);
                return;
            }
            else if (Memory.commuterUpgraders.length < Memory.numCommuterUpgraders) {
                name = 'BigCommuterUpgrader' + Game.time;
                return_code = spawn.spawnCreep(
                    [   // total: 2300
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, /* 700 */
                        MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, /* 600 */
                        MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, /* 300 */
                        WORK, WORK, WORK, WORK, WORK, WORK, WORK, /* 700 */
                    ],
                    name,
                    {memory: {role: "upgrader", subrole: "commuter", citizenship: spawn.room.name, target: "W71S76"}}
                );
                console.log("Fazendo big commuter upgrader: " + return_code);
                return;
            }
            else if (Memory.upgraders.length < Memory.numUpgraders) {
                name = 'BigUpgrader' + Game.time;
                return_code = spawn.spawnCreep(
                    [
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, /* 550 */
                        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, /* 450 */
                        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, /* 800 */
                    ],
                    name,
                    {
                        memory: {
                            role: "upgrader", subrole: "local",
                            citizenship: Memory.upgraders.filter((c) => c.memory.citizenship === "W71S73").length < 3
                                ? "W71S73" : spawn.room.name
                        }
                    }
                );
                console.log("Fazendo upgrader: " + return_code);
                return;
            }
            else if (Memory.repairmans.length < Memory.numRepairmans) {
                name = 'BigRepairman' + Game.time;
                return_code = spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK],
                    name, {
                        memory: {
                            role: "repairman",
                            subrole: "all",
                            citizenship: spawn.room.name
                        }
                    });
                console.log("Fazendo repairman: " + return_code);
                return;
            }
        }
        if (Memory.distributors.length < Memory.numDistributors) {
            name = 'BigDistributor' + Game.time;
            return_code = spawn.spawnCreep(
                [   // total: 2300
                    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, /* 700 */
                    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, /* 400 */
                    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, /* 600 */
                    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, /* 600 */
                ],
                name, {
                    memory: {
                        role: "distributor",
                        subrole: "local",
                        citizenship: spawn.room.name,
                        resourceType: RESOURCE_ENERGY
                    }
                });
            console.log("Fazendo distributor: " + return_code);
        }
        // if (Memory.distributors.length < Memory.numDistributors) {
        //     name = 'SmallDistributor' + Game.time;
        //     return_code = spawn.spawnCreep(
        //         [   // total: 1150
        //             MOVE, MOVE, MOVE, MOVE, // MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,     /* 700 */
        //             CARRY, CARRY, CARRY, CARRY, // CARRY, CARRY, CARRY, CARRY, CARRY,                          /* 450 */
        //         ],
        //         name, {
        //             memory: {
        //                 role: "distributor",
        //                 subrole: "local",
        //                 citizenship: spawn.room.name,
        //                 resourceType: RESOURCE_ENERGY
        //             }
        //         });
        //     console.log("Fazendo distributor: " + return_code);
        // }
    }
};