let generalUtils;
module.exports = generalUtils = {
    sortByLowestPathCost: function (reference, collection) {
        return collection.sort(function (a, b) {
            aPathCost = PathFinder.search(reference.pos, a.pos).cost;
            bPathCost = PathFinder.search(reference.pos, b.pos).cost;
            return aPathCost - bPathCost;
        });
    },
    printStats: function () {
        console.log("**Game Stats**");
        console.log(`Cpu bucket count: ${Game.cpu.bucket}`);
        // print creeps stats
        console.log(`Personnel: guards ${Memory.guards.length}/${Memory.numGuards} | distributors ${Memory.distributors.length}/${Memory.numDistributors} | repairmans ${Memory.repairmans.length}/${Memory.numRepairmans} | upgraders  ${Memory.upgraders.length}/${Memory.numUpgraders} | commuter upgraders  ${Memory.commuterUpgraders.length}/${Memory.numCommuterUpgraders} | builders   ${Memory.builders.length}/${Memory.numBuilders} | harvesters ${Memory.harvesters.length}/${Memory.numHarvesters} | commuter harvesters ${Memory.commuterHarvesters.length}/${Memory.numCommuterHarvesters}| conqueror ${Memory.conquerors.length}/${Memory.numConquerors}|`);
        // print available rooms info
        Object.keys(Game.rooms).forEach(function (roomName) {
            const room = Game.rooms[roomName];
            console.log(`Room ${roomName}:
            - State: ${Memory.war[roomName] ? "war" : "peace"}
            - Energy: ${room.energyAvailable}/${room.energyCapacityAvailable}  stored/capacity
            - Citizens: ${_.values(Game.creeps).filter((c) => c.memory.citizenship === roomName).length}`
            )
        });
    },
    resetStoredEntities: function () {
        Memory.allCriticalStateStructures = {};
        Memory.sources = {};
        Memory.nonEmptySources = {};
        Memory.constructionSites = {};
        Memory.incompleteSpawns = {};
        Memory.incompleteTowers = {};
        Memory.towers = {};
        Memory.emptyTowers = {};
        Memory.incompleteExtensions = {};
        Memory.strayResources = {};
        Memory.containers = {};
    },
    updateStructures: function (room, onlySources = false) {
        Memory.sources[room.name] = room.find(FIND_SOURCES);
        Memory.nonEmptySources[room.name] = Memory.sources[room.name].filter((s) => s.energy > 0);

        if (onlySources) {
            return;
        }
        Memory.allCriticalStateStructures[room.name] = room.find(FIND_STRUCTURES, {filter: s => s.hits < 500});
        Memory.containers[room.name] = room.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_CONTAINER});
        Memory.constructionSites[room.name] = room.find(FIND_CONSTRUCTION_SITES);
        Memory.incompleteSpawns[room.name] = room.find(FIND_STRUCTURES).filter(
            (structure) => structure.structureType === STRUCTURE_SPAWN && structure.energy < structure.energyCapacity
        );
        Memory.incompleteExtensions[room.name] = room.find(FIND_STRUCTURES).filter(
            (structure) => structure.structureType === STRUCTURE_EXTENSION
                && structure.energy < structure.energyCapacity
        );

        Memory.towers[room.name] = room.find(FIND_STRUCTURES)
            .filter((structure) => structure.structureType === STRUCTURE_TOWER);
        Memory.incompleteTowers[room.name] = Memory.towers[room.name]
            .filter((structure) => structure.energy < structure.energyCapacity);
        Memory.emptyTowers[room.name] = Memory.incompleteTowers[room.name].length > 0
            ? Memory.incompleteTowers[room.name].filter((structure) => structure.energy < 10) : [];

    },
    updateStrayResources: function (room) {
        // low amount of energy don't matter
        Memory.strayResources[room.name] = room.find(FIND_DROPPED_RESOURCES,
            {
                filter: function (resource) {
                    switch (resource) {
                        case RESOURCE_ENERGY:
                            return resource.energy > 100;
                        default:
                            return resource.amount > 10;
                    }
                }
            }
        );
    },
};