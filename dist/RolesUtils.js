const generalUtils = require("GeneralUtils");

let roleUtils;
module.exports = roleUtils = {
    harvestSource: function (creep, room, preferesSourceNum = 0, pathStroke = '#ffefd2') {
        const stray_energy = room.find(FIND_DROPPED_RESOURCES,
            {filter: (resource) => resource.resourceType === RESOURCE_ENERGY && resource.energy > 100});
        const pickUpEnergy = !Memory.war
            && stray_energy.length > 0;
            // && room.find(FIND_MY_CREEPS);  // TODO: disallow picking up energy by the enemy


        let source;
        if (pickUpEnergy) {
            // closer sources should be prioritized
            source = generalUtils.sortByPathCost(creep, stray_energy)[0];
        } else {
            if (!Memory.sources.hasOwnProperty(room.name)) {
                Memory.sources[room.name] = room.find(FIND_SOURCES, {filter: (s) => s.energy > 0});
            }
            const sources = Memory.sources[room.name];
            source = sources.length >= preferesSourceNum + 1 ? sources[preferesSourceNum]
                : generalUtils.sortByPathCost(creep, sources)[0];
        }

        const r = pickUpEnergy ? creep.pickup(source) : creep.harvest(source);
        switch (r) {
            case OK:
            case ERR_BUSY:
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(source, {visualizePathStyle: {stroke: pathStroke}});
                break;
            case ERR_INVALID_TARGET:
                if (creep.carry.energy > 0) {
                    creep.memory.harvesting = false;
                }
            default :
                console.log(`${creep.name} unable to move to source due to ${r}`);
        }
    },
};