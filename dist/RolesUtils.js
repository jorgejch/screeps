const generalUtils = require("GeneralUtils");


let roleUtils;
module.exports = roleUtils = {
    _resolveBestContainer: function (creep, room, resourceType) {
        const containers = Memory.containers[room.name].filter(c => c.store[resourceType] > 0);
        if (containers.length) {
            return generalUtils.sortByLowestPathCost(creep, containers)[0]
        }
        else if (room.storage !== undefined && room.storage.store[resourceType] > 0) {
            return room.storage
        }
        return undefined;
    },
    _getStrayResource: function (creep, roomName){
       return generalUtils.sortByLowestPathCost(creep, Memory.strayResources[roomName])[0];
    },
    targetBuilder: function (creep, roomName, resource) {
        switch (resource) {
            case RESOURCE_ENERGY:
                let targets;
                if (roleUtils.isAnyStructureCritical(roomName)) {
                    targets = Memory.incompleteTowers[roomName];
                }
                else if (Memory.incompleteExtensions[roomName].length !== 0
                    || Memory.incompleteSpawns[roomName].length !== 0) {

                    // towers should not be empty when at war
                    if (Memory.war[roomName] && Memory.emptyTowers[roomName].length !== 0) {
                        targets = Memory.emptyTowers[roomName];
                    }
                    else {
                        targets = Memory.incompleteExtensions[roomName].concat(Memory.incompleteSpawns[roomName]);
                    }
                }
                else {
                    targets = Memory.incompleteTowers[roomName];
                }
                return generalUtils.sortByLowestPathCost(creep, targets)[0];
            default:
                const room = Game.rooms[roomName];
                if (room.storage && _.sum(room.storage.store) < room.storage.storeCapacity) {
                    return room.storage;
                }

                creep.memory.collecting = true;
                return undefined;
        }
    },
    collect: function (creep, room, resourceType, preferredContainer = null, s = '#bcff8c') {
        const strayResource = roleUtils._getStrayResource(creep, room.name);
        let source;
        if (strayResource) {
            // closer sources should be prioritized
            source = strayResource;
        }
        else if (preferredContainer !== null) {
            source = preferredContainer;
        }
        else {
            source = roleUtils._resolveBestContainer(creep, room, resourceType);
        }

        const r = strayResource ? creep.pickup(source) : creep.withdraw(source, resourceType);
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
        const strayResource = roleUtils._getStrayResource(creep, room.name);
        const source = strayResource ? strayResource
            : generalUtils.sortByLowestPathCost(creep, Memory.nonEmptySources[room.name])[0];

        if (source !== undefined) {
            const r = strayResource ? creep.pickup(source): creep.harvest(source);
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
        }
        else {
            console.log(`${creep.name} can't find source to harvest.`)
        }
    },
    isAnyStructureCritical: function (roomName) {
        return Memory.allCriticalStateStructures[roomName].length > /*cuz controller is first*/ 1
    },
};