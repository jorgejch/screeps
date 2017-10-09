const generalUtils = require("GeneralUtils");

let roleUtils;
module.exports = roleUtils = {
    harvestSource: function (creep, room, preferesSourceNum = 0, pathStroke = '#ffefd2') {
        const stray_energy = room.find(FIND_DROPPED_RESOURCES,
            {filter: (resource) => resource.resourceType = RESOURCE_ENERGY});
        const pickUpEnergy = !Memory.war
            && stray_energy.length > 0
        && room.find(FIND_MY_CREEPS).sort();  // don't go picking up energy by the enemy


        let source;
        if (pickUpEnergy) {
            // closer sources should be prioritized
            source = generalUtils.sortByPathCost(creep, stray_energy)[0];
        } else {
            const sources = room.find(FIND_SOURCES, {filter: (s) => s.energy > 0});
            source = sources.length >= preferesSourceNum + 1 ? sources[preferesSourceNum] : generalUtils.sortByPathCost(creep, sources)[0];
        }

        const r = pickUpEnergy ? creep.pickup(source) : creep.harvest(source);
        if (r === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {visualizePathStyle: {stroke: pathStroke}});
        }
        else if (r !== 0) {
            console.log(`${creep.name} unable to move to source due to ${r}`);
        }
    },
};