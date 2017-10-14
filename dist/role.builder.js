const rolesUtils = require("RolesUtils");
const generalUtils = require("GeneralUtils");

module.exports = {
    run: function (creep, roomSource, roomTarget) {
        if (creep.memory.harvesting && creep.carry.energy === creep.carryCapacity) {
            creep.memory.harvesting = false;
            creep.say("build")
        }
        else if (!creep.memory.harvesting && creep.carry.energy === 0) {
            creep.memory.harvesting = true;
            creep.say("harvest")
        }

        if (creep.memory.harvesting) {
            rolesUtils.harvestSource(creep, roomSource, 999, '#ff2125')
        }
        else {
            let targets;
            let chargeTower = false;    // if there are no construction sites builder should charge incomplete towers
            const sites = Memory.constructionSites[roomTarget.name];

            if (sites.length) {
                targets = sites;
            } else {
                targets = Memory.incompleteTowers[roomTarget.name];
                chargeTower = true;
            }
            // closer targets should be prioritized
            targets = generalUtils.sortByLowestPathCost(creep, targets);

            if (targets.length) {
                if (!chargeTower) {
                    if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ff2125'}});
                    }
                }else {
                    if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ff2125'}});
                    }
                }
            }
            else {
                console.log("Nothing to build. Moving to BuilderPoint.");
                creep.moveTo(Game.flags.BuilderPoint)
            }
        }
    }
};