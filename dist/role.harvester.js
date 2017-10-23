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
            /*
                all local harvesters should be present and all extensions filled
                to allow also charging towers when no structure is critical or at peace time
             */
            let targets;
            switch (Object.keys(creep.carry)[0]) {
                case RESOURCE_ENERGY:
                    if (rolesUtils.isAnyStructureCritical(roomTargetName)){
                        targets = Memory.incompleteTowers[roomTargetName];
                    }
                    else if (Memory.incompleteExtensions[roomTargetName].length !== 0
                        || Memory.incompleteSpawns[roomTargetName].length !== 0) {

                        // towers should not be empty when at war
                        if (!Memory.war || Memory.emptyTowers[roomTargetName].length === 0) {
                            targets = Memory.incompleteExtensions[roomTargetName]
                                .concat(Memory.incompleteSpawns[roomTargetName]);
                        }
                        else {
                            targets = Memory.emptyTowers[roomTargetName];
                        }
                    }
                    else {
                        targets = Memory.incompleteTowers[roomTargetName];
                    }
                    break;
                default:
                    targets = roomTarget.hasOwnProperty("storage") ? [roomTarget.storage] : [];
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