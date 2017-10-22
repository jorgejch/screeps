const generalUtils = require("GeneralUtils");

let roleUtils;
module.exports = roleUtils = {
    harvestSource: function (creep, room, preferedSourceNum = 0, pathStroke = '#ffefd2') {
        const pickUpResource = !Memory.war[room.name]
            && Memory.strayResources[room.name]
            && Memory.strayResources[room.name].length > 0;

        let source;
        if (pickUpResource) {
            // closer sources should be prioritized
            source = generalUtils.sortByLowestPathCost(creep, Memory.strayResources[room.name])[0];
        } else {
            const sources = Memory.nonEmptySources[room.name] || [];
            source = sources.length >= preferedSourceNum + 1 ? sources[preferedSourceNum]
                : generalUtils.sortByLowestPathCost(creep, sources)[0];
        }

        const r = pickUpResource ? creep.pickup(source) : creep.harvest(source);
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
            default:
                console.log(`${creep.name} unable to move to source due to ${r}`);
        }
    },
    isAnyStructureCritical: function (roomName) {
        return Memory.allStructures.hasOwnProperty(roomName)
            && Memory.allCriticalStateStructures[roomName].length > /*cuz controller is first*/ 1
    },
};