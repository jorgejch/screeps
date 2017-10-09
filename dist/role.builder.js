const rolesUtils = require("RolesUtils");
const generalUtils = require("GeneralUtils");

module.exports = {
    assignSubrole: function (creep) {
        if (_.filter(Memory.builders, {memory: {subrole: "expat"}}).length <= 1
            && _.filter(Memory.builders, {memory: {subrole: "expat"}}).length > 1) {
            creep.memory.subrole = "expat";
            console.log(`${creep.name} assigned to expat.`)
        }
    },
    run: function (creep, roomSource, roomTarget ) {
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
            // closer targets should be prioritized
            const targets = generalUtils.sortByPathCost(creep, roomTarget.find(FIND_CONSTRUCTION_SITES));

            if (targets.length) {
                if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ff2125'}});
                }
            }
            else {
                console.log("Nothing to build. Moving to BuilderPoint.");
                creep.moveTo(Game.flags.BuilderPoint)
            }
        }
    }
};