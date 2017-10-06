module.exports = {
    spawn: function (spawn) {
        let name;
        if (Memory.harvesters.length >= Memory.numHarvesters && spawn.energy >= Memory.minSpawn1Energy) {
            if (Memory.guards.length < Memory.numGuards) {
                name = 'Guard' + Game.time;
                return_code = spawn.spawnCreep([MOVE, MOVE, MOVE, TOUGH, ATTACK, ATTACK],
                    name, {memory: {role: "guard"}});
                console.log("Fazendo guard: " + return_code);
                return;
            }
            else if (Memory.repairmans.length < Memory.numRepairmans) {
                name = 'BigRepairman' + Game.time;
                return_code = spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK],
                    name, {
                        memory: {
                            role: "repairman",
                            subrole: "all"
                        }
                    });
                console.log("Fazendo repairman: " + return_code);
                return;
            }
            else if (Memory.upgraders.length < Memory.numUpgraders) {
                name = 'BigUpgrader' + Game.time;
                return_code = spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK, WORK],
                    name, {memory: {role: "upgrader"}});
                console.log("Fazendo upgrader: " + return_code);
                return;
            }
            else if (Memory.builders.length < Memory.numBuilders) {
                name = 'MidBuilder' + Game.time;
                return_code = spawn.spawnCreep([MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK, WORK],
                    name, {memory: {role: "builder", subrole: "local"}});
                console.log("Fazendo builder: " + return_code);
                return;
            }
        }

        if (Memory.harvesters.length < Memory.numHarvesters && spawn.energy >= 200) {
            name = 'BigHarvester' + Game.time;
            return_code = spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK],
                name, {memory: {role: "harvester", subrole: "local"}});
            console.log("Fazendo harvester: " + return_code);

        }
    }
};