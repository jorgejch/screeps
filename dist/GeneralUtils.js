let generalUtils;
module.exports = generalUtils = {
    calcutaleRoomTotalEnergyCapacity: function (room) {
        let energyCapacitySum = 0;
        room.find(FIND_STRUCTURES, {filter: (structure) => structure.structureType === STRUCTURE_EXTENSION})
            .forEach(function (structure) {
                energyCapacitySum += structure.energyCapacity;
            });
        room.find(FIND_MY_SPAWNS).forEach(function (structure) {
            energyCapacitySum += structure.energyCapacity;
        });

        return energyCapacitySum;
    },
    sortByPathCost: function (reference, collection) {
        return collection.sort(function (a, b) {
            aPathCost = PathFinder.search(reference.pos, a.pos).cost;
            bPathCost = PathFinder.search(reference.pos, b.pos).cost;
            return aPathCost - bPathCost;
        });
    },
    print_stats : function (state) {
        console.log(`${state} | guards ${Memory.guards.length}/${Memory.numGuards} | repairmans ${Memory.repairmans.length}/${Memory.numRepairmans} | upgraders  ${Memory.upgraders.length}/${Memory.numUpgraders} | builders   ${Memory.builders.length}/${Memory.numBuilders} | harvesters ${Memory.harvesters.length}/${Memory.numHarvesters} | commuter harvesters ${Memory.commuterHarvesters.length}/${Memory.numCommuterHarvesters}|`);
    },
};