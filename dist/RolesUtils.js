const generalUtils = require("GeneralUtils");


let roleUtils;
module.exports = roleUtils = {
    _resolveBestContainer: function (creep, room) {
        const containers = Memory.containers[room.name].filter(c => Object.keys(c).length);
        if (containers.length) {
            return generalUtils.sortByLowestPathCost(creep, containers)[0]
        }
        else if (room.storage !== undefined && room.storage.store.size > 0){
            return room.storage
        }
        return  undefined;
    },
    targetBuilder: function (creep, roomName, resource) {
        switch (resource) {
            case RESOURCE_ENERGY:
                if (roleUtils.isAnyStructureCritical(roomName)) {
                    return generalUtils.sortByLowestPathCost(creep, Memory.incompleteTowers[roomName])[0];
                }
                else if (Memory.incompleteExtensions[roomName].length !== 0
                    || Memory.incompleteSpawns[roomName].length !== 0) {

                    // towers should not be empty when at war
                    if (!Memory.war[roomName] || Memory.emptyTowers[roomName].length === 0) {

                        return generalUtils.sortByLowestPathCost(creep, Memory.incompleteExtensions[roomName]
                            .concat(Memory.incompleteSpawns[roomName]));
                    }
                    else {
                        targets = Memory.emptyTowers[roomName];
                    }
                }
                else {
                    targets = Memory.incompleteTowers[roomName];
                }
        }
    },
    collect: function (creep, room, resourceType, preferredContainer = null, s = '#bcff8c') {
        const pickUpResource = !Memory.war[room.name]
            && Memory.strayResources[room.name] !== undefined
            && Memory.strayResources[room.name].length > 0;

        let source;
        if (pickUpResource) {
            // closer sources should be prioritized
            source = generalUtils.sortByLowestPathCost(creep, Memory.strayResources[room.name])[0];
        }
        else if (preferredContainer !== null) {
            source = preferredContainer;
        }
        else {
            source = roleUtils._resolveBestContainer(creep, room);
        }

        const r = pickUpResource ? creep.pickup(source) : creep.withdraw(source, resourceType);
        switch (r) {
            case OK:
            case ERR_BUSY:
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(source, {visualizePathStyle: {stroke: s}});
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
            case ERR_INVALID_TARGET:
                if (creep.carry.energy > 0) {
                    creep.memory.collecting = false;
                }
            default:
                console.log(`${creep.name} unable to move to source due to ${r}`);
        }
    },
    harvestSource: function (creep, room, preferedSourceNum = 99, pathStroke = '#ffefd2') {
        const sources = Memory.nonEmptySources[room.name] || [];
        const source = sources.length >= preferedSourceNum + 1 ? sources[preferedSourceNum]
            : generalUtils.sortByLowestPathCost(creep, sources)[0];

        const r = creep.harvest(source);
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