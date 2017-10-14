const roleUtils = require("RolesUtils");

module.exports = {
    run : function(creep, roomSource, roomTarget, preferredSource = 1, goToFlag = false){
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
                const r = creep.moveTo(roomSource, {visualizePathStyle: {stroke: '#ffe900'}});
                console.log(`${creep.name} moveTo to room flag. Code: ${r}`)
            }
            else {
                roleUtils.harvestSource(creep, roomSource, preferredSource, '#ffe900');
            }
        } else {
            if (creep.upgradeController(roomTarget.controller) === ERR_NOT_IN_RANGE){
                creep.moveTo(roomTarget.controller, {visualizePathStyle: {stroke: '#ffe900' }})
            }
        }             
    }
};