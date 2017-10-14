module.exports = {
    spawn: function (spawn) {
        let name;
        if (Memory.harvesters.length >= Memory.numHarvesters && spawn.energy >= 100) {
            if (Memory.guards.length < Memory.numGuards) {
                name = 'Guard' + Game.time;
                return_code = spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, TOUGH, ATTACK, ATTACK, ATTACK],
                    name, {memory: {role: "guard", citizenship: spawn.room.name}});
                console.log("Fazendo guard: " + return_code);
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
            else if (Memory.commuterHarvesters.length < Memory.numCommuterHarvesters) {
                name = 'BigCommuterHarvester' + Game.time;
                return_code = spawn.spawnCreep(
                    [
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                        WORK, WORK, WORK, WORK
                    ],
                    name,
                    {memory: {role: "harvester", subrole: "commuter", citizenship: spawn.room.name}}
                );
                console.log("Fazendo BigCommuterHarvester: " + return_code);
            }
            else if (Memory.commuterUpgraders.length < Memory.numCommuterUpgraders) {
                name = 'BigCommuterUpgrader' + Game.time;
                return_code = spawn.spawnCreep(
                    [
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                        WORK, WORK, WORK, WORK, WORK
                    ],
                    name,
                    {memory: {role: "upgrader", subrole: "commuter", citizenship: spawn.room.name}}
                );
                console.log("Fazendo big commuter upgrader: " + return_code);
                return;
            }
            else if (Memory.upgraders.length < Memory.numUpgraders) {
                name = 'BigUpgrader' + Game.time;
                return_code = spawn.spawnCreep(
                    [
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                        WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK],
                    name,
                    {memory: {role: "upgrader", subrole: "local",
                        citizenship: Memory.upgraders.filter((c) => c.memory.citizenship === "W71S73").length < 3
                            ? "W71S73" : spawn.room.name}}
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
            else if (Memory.builders.length < Memory.numBuilders) {
                name = 'BigBuilder' + Game.time;
                return_code = spawn.spawnCreep(
                    [
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, WORK,
                        WORK, WORK, WORK, WORK, WORK, WORK, WORK
                    ],
                    name, {memory: {role: "builder", subrole: "local", citizenship: "W71S73"}});
                console.log("Fazendo builder: " + return_code);
                return;
            }
        }

        if (Memory.harvesters.length < Memory.numHarvesters && spawn.energy >= 200) {
            name = 'BigHarvester' + Game.time;
            return_code = spawn.spawnCreep(
                [
                    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    WORK, WORK, WORK, WORK, WORK, WORK, WORK
                ],
                name, {memory: {role: "harvester", subrole: "local", citizenship: spawn.room.name}});
            console.log("Fazendo harvester: " + return_code);

        }
    }
};