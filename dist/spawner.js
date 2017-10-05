module.exports = {
    run : function(spawn){
        if (Memory.harvesters.length >= Memory.numHarvesters && spawn.energy >= Memory.minSpawn1Energy ){
            if (Memory.guards.length < Memory.numGuards){
                var name = 'Guard' + Game.time;
                var creepName = spawn.spawnCreep([MOVE, MOVE, TOUGH, ATTACK], name, {memory: {role: "guard"}});
                console.log("Fazendo guard: " + creepName);
                return;
            }
            else if (Memory.repairmans.length < Memory.numRepairmans){
                var name = 'BigRepairman' + Game.time;
                var creepName = spawn.spawnCreep([MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK], name, {memory: {role: "repairman", exclusive: false}});
                console.log("Fazendo repairman: " + creepName);
                return;
            }
            else if (Memory.upgraders.length < Memory.numUpgraders){
                var name = 'BigUpgrader' + Game.time;
                var creepName = spawn.spawnCreep([MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK], name, {memory: {role: "upgrader"}});
                console.log("Fazendo upgrader: " + creepName);
                return;
            }
            else if (Memory.builders.length < Memory.numBuilders){
                var name = 'MidBuilder' + Game.time;
                var creepName = spawn.spawnCreep([MOVE, CARRY, CARRY, WORK, WORK], name, {memory: {role: "builder"}});
                console.log("Fazendo builder: " + creepName);
                return;
            }
        }

        if (Memory.harvesters.length < Memory.numHarvesters && spawn.energy >= 200){
            var name = 'BigHarvester' + Game.time;
            var creepName = spawn.spawnCreep([MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK], name, {memory: {role: "harvester"}} );
            console.log("Fazendo harvester: " + creepName);
            return;
        }
    }
};