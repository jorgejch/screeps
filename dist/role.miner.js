const rolesUtils = require("RolesUtils");
const generalUtils = require("GeneralUtils");

let harvesterRole;
module.exports = harvesterRole = {
    run: function (creep, roomSource, roomTarget, goToFlag = false) {
        if (creep.memory.mining && _.sum(creep.carry) === creep.carryCapacity) {
            creep.memory.mining = false;
            creep.say("loading")
        }
        else if (!creep.memory.harvesting && creep.carry.energy === 0) {
            creep.memory.mining = true;
            creep.say("mining");
        }

        if (creep.memory.mining) {
            if (goToFlag === true) {
                const r = creep.moveTo(roomSource, {visualizePathStyle: {stroke: "#1f00ff"}});
                console.log(`${creep.name} moveTo to room flag. Code: ${r}`)
            } else {
                rolesUtils.mineMineral(creep, roomSource, 99, "#1f00ff");
            }

        } else {
            /*
                all local harvesters should be present and all extensions filled
                to allow also charging towers when no structure is critical or at peace time
             */

            }
            // closer targets should be prioritized
            targets = generalUtils.sortByLowestPathCost(creep, targets);

            if (targets.length) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#17ff06'}});
                }
            }
            else {
                console.log("Nothing to fill up. Moving to HarvesterPoint");
                creep.moveTo(Game.flags["HarvesterPoint"])
            }
        }
    }
};