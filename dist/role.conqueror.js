const rolesUtils = require("RolesUtils");
const generalUtils = require("GeneralUtils");

module.exports = {
    run: function (creep, target, goToFlag = false) {
        // if (creep.memory.harvesting && creep.carry.energy === creep.carryCapacity) {
        //     creep.memory.harvesting = false;
        //     creep.say("conquer")
        // }
        // else if (!creep.memory.harvesting && creep.carry.energy === 0) {
        //     creep.memory.harvesting = true;
        //     creep.say("harvest")
        // }

        // if (creep.memory.harvesting) {
        //     rolesUtils.harvestSource(creep, roomSource, 999, '#ff2125')
        // }
        // else {
        //
        // }

        if (goToFlag) {
            creep.moveTo(target);
        } else {
            const r = creep.claimController(target.controller);
            if (r === ERR_NOT_IN_RANGE) {
                creep.moveTo(target.controller, {visualizePathStyle: {stroke: '#17ff06'}})
            }
            else {
                console.log(`${creep.name} unable to move to controller at ${target.name}`)
            }
        }
    }
};