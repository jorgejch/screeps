const rolesUtils = require("RolesUtils");

let repairmanRole;
module.exports = repairmanRole = {
    run: function (creep, roomSource, roomTarget) {
        if (creep.memory.harvesting && creep.carry.energy === creep.carryCapacity) {
            creep.memory.harvesting = false;
            creep.say("repair")
        }
        else if (!creep.memory.harvesting && creep.carry.energy === 0) {
            creep.memory.harvesting = true;
            creep.say("harvest")
        }

        if (creep.memory.harvesting) {
            rolesUtils.harvestSource(creep, roomSource, 99, '#251cff')
        } else {
            let target;
            // obtain possible targets based on subroles
            target = roomTarget.find(FIND_STRUCTURES,
                {
                    filter: (structure) => (structure.hits < structure.hitsMax)
                });

            target = target.sort(function (a, b) {
                return a.hits - b.hits
            });

            // execute action on target
            if (target.length) {
                if (creep.repair(target[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target[0], {visualizePathStyle: {stroke: '#251cff'}})
                }
            }
            else {
                console.log(`${creep.name + "|" + creep.memory.subrole} has nothing to repair.`)
            }
        }
    }
}
;