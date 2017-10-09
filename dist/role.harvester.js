const rolesUtils = require("RolesUtils");
const generalUtils = require("GeneralUtils");

let harvesterRole;
module.exports = harvesterRole = {
    assignSubrole: function (creep) {
    },
    run: function (creep, roomSource, roomTarget, goToFlag = false) {
        if (creep.memory.harvesting && creep.carry.energy === creep.carryCapacity) {
            creep.memory.harvesting = false;
            creep.say("charge")
        }
        else if (!creep.memory.harvesting && creep.carry.energy === 0) {
            creep.memory.harvesting = true;
            creep.say("harvest");
        }

        if (creep.memory.harvesting) {
            if (goToFlag === true) {
                const r = creep.moveTo(roomSource, {visualizePathStyle: {stroke: "#17ff06"}});
                console.log(`${creep.name} moveTo to room flag. Code: ${r}`)
            } else {
                rolesUtils.harvestSource(creep,roomSource, 0, "#17ff06");
            }

        } else {
            let targets;
            const incompleteExtensions = roomTarget.find(FIND_STRUCTURES,
                {
                    filter: (structure) => structure.structureType === STRUCTURE_EXTENSION
                        && structure.energy < structure.energyCapacity
                });

            console.log(`Room ${roomTarget.name} has ${incompleteExtensions.length} incomplete extensions`);

            /*
                all local harvesters should be present and all extensions filled
                to allow also charging towers at peace time
             */
            if (Memory.harvesters.length < Memory.numHarvesters || incompleteExtensions.length !== 0) {
                targets = roomTarget.find(FIND_STRUCTURES, {
                    filter: (structure) => (
                        structure.structureType === STRUCTURE_EXTENSION
                        || structure.structureType === STRUCTURE_SPAWN
                    ) && (structure.energy < structure.energyCapacity)
                });

            }
            else if (Memory.war === true && roomTarget.find(FIND_STRUCTURES, {filter: (structure) => structure.hits === 0}).length)  {
                targets = roomTarget.find(FIND_STRUCTURES, {
                    filter: (structure) => (structure.structureType === STRUCTURE_SPAWN
                        || structure.structureType === STRUCTURE_TOWER
                    ) && (structure.energy < structure.energyCapacity)
                });
            }
            else {
                targets = roomTarget.find(FIND_STRUCTURES, {
                    filter: (structure) => (structure.structureType === STRUCTURE_SPAWN
                        || structure.structureType === STRUCTURE_TOWER
                    ) && (structure.energy < structure.energyCapacity)
                });
            }

            // closer targets should be prioritized
            targets = generalUtils.sortByPathCost(creep, targets);

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