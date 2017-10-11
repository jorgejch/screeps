let generalUtils;
module.exports = generalUtils = {
    sortByPathCost: function (reference, collection) {
        return collection.sort(function (a, b) {
            aPathCost = PathFinder.search(reference.pos, a.pos).cost;
            bPathCost = PathFinder.search(reference.pos, b.pos).cost;
            return aPathCost - bPathCost;
        });
    },
    print_stats: function (state) {
        console.log("**Game Stats**");
        // print creeps stats
        console.log(`State: ${state} | guards ${Memory.guards.length}/${Memory.numGuards} | repairmans ${Memory.repairmans.length}/${Memory.numRepairmans} | upgraders  ${Memory.upgraders.length}/${Memory.numUpgraders} | commuter upgraders  ${Memory.commuterUpgraders.length}/${Memory.numCommuterUpgraders} | builders   ${Memory.builders.length}/${Memory.numBuilders} | harvesters ${Memory.harvesters.length}/${Memory.numHarvesters} | commuter harvesters ${Memory.commuterHarvesters.length}/${Memory.numCommuterHarvesters}|`);
        // print available rooms info
        Object.keys(Game.rooms).forEach(function (roomName) {
            const room = Game.rooms[roomName];
            console.log(`Room ${roomName} is available and has:
            - Energy ${room.energyAvailable}/${room.energyCapacityAvailable}  stored/capacity`)
        });
    },
    updateStoredStructures: function (room) {
        console.log("Updating stored structures");
        Memory.incompleteExtensions[room.name] = room.find(FIND_STRUCTURES,
            {
                filter: (structure) => structure.structureType === STRUCTURE_EXTENSION
                    && structure.energy < structure.energyCapacity
            }
        );
        Memory.incompleteSpawns[room.name] = room.find(FIND_STRUCTURES,
            {
                filter: (structure) => structure.structureType === STRUCTURE_SPAWN
                    && structure.energy < structure.energyCapacity
            }
        );
        Memory.emptyTowers[room.name] = room.find(FIND_STRUCTURES,
            {
                filter: (structure) => structure.structureType === STRUCTURE_TOWER && structure.energy === 0
            }
        );
        Memory.incompleteTowers[room.name] = room.find(FIND_STRUCTURES,
            {
                filter: (structure) => structure.structureType === STRUCTURE_TOWER
                    && structure.energy < structure.energyCapacity
            }
        );
        Memory.constructionSites[room.name] = room.find(FIND_CONSTRUCTION_SITES);
    }
};