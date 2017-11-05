const rolesUtils = require("RolesUtils");
const generalUtils = require("GeneralUtils");

let harvesterRole;
module.exports = harvesterRole = {
    run: function (creep, roomSourceName, roomTargetName, goToFlag = false) {
        if (creep.memory.harvesting && _.sum(creep.carry) === creep.carryCapacity) {
            creep.memory.harvesting = false;
            creep.say("charge")
        }
        else if (!creep.memory.harvesting && creep.carry.energy === 0) {
            creep.memory.harvesting = true;
            creep.say("harvest");
        }

        if (creep.memory.harvesting) {
            if (goToFlag === true) {
                const r = creep.moveTo(Game.flags[roomSourceName], {visualizePathStyle: {stroke: "#17ff06"}});
                console.log(`${creep.name} moveTo to room flag. Code: ${r}`)
            } else {
                rolesUtils.harvestSource(creep, Game.rooms[roomSourceName], 99, "#17ff06");
            }

        } else {
            // closer targets should be prioritized
            const roomStorage = Game.rooms[roomTargetName].storage;
            const incompleteContainers = Memory.containers[roomTargetName].filter(
                c => _.sum(c.store) < c.storeCapacity);
            const targets = generalUtils.sortByLowestPathCost(creep,
                roomStorage !== undefined && _.sum(roomStorage.store) < roomStorage.storeCapacity
                    ? incompleteContainers.concat([roomStorage]) : incompleteContainers);

            if (targets && targets.length) {
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