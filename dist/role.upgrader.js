const roleUtils = require("RolesUtils");

module.exports = {
    run : function(creep, roomSourceName, roomTargetName, goToFlag = false){
        if (creep.memory.harvesting && _.sum(creep.carry) === creep.carryCapacity){
            creep.memory.harvesting = false;
            creep.say("upgrade")
        }
        else if (!creep.memory.harvesting && creep.carry.energy === 0){
            creep.memory.harvesting = true;
            creep.say("harvest")
        }

        if (creep.memory.harvesting){
            if (goToFlag === true) {
                const r = creep.moveTo(Game.flags[roomSourceName], {visualizePathStyle: {stroke: '#ffe900'}});
                console.log(`${creep.name} moveTo to room flag. Code: ${r}`)
            }
            else {
                roleUtils.harvestSource(creep, Game.rooms[roomSourceName], 99, '#ffe900');
            }
        } else {
            if (creep.upgradeController(Game.rooms[roomTargetName].controller) === ERR_NOT_IN_RANGE){
                creep.moveTo(Game.rooms[roomTargetName].controller, {visualizePathStyle: {stroke: '#ffe900' }})
            }
        }             
    }
};