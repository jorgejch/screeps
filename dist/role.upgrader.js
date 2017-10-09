const roleUtils = require("RolesUtils");

module.exports = {
    run : function(creep, room){
        if (creep.memory.harvesting && creep.carry.energy === creep.carryCapacity){
            creep.memory.harvesting = false;
            creep.say("upgrade")
        }
        else if (!creep.memory.harvesting && creep.carry.energy === 0){
            creep.memory.harvesting = true;
            creep.say("harvest")
        }

        if (creep.memory.harvesting){
            roleUtils.harvestSource(creep, room, 1, '#ffe900');
        } else {
            if (creep.upgradeController(room.controller) === ERR_NOT_IN_RANGE){
                creep.moveTo(room.controller, {visualizePathStyle: {stroke: '#ffe900' }})
            }
        }             
    }
};