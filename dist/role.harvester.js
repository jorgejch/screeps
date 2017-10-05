module.exports = {
    run: function(creep, room){
        if (creep.carry.energy < creep.carryCapacity){
            const sources = room.find(FIND_SOURCES);

            if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE){
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#dcb5ff'}});
            }
        } else {
            const targets = room.find(FIND_STRUCTURES, {
                filter: (structure) =>
                    (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN)
                    && (structure.energy < structure.energyCapacity)
            });

            if (targets.length){
                if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE){
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#3bd1ff'}});
                }
            } 
            else {
                console.log("Nothing to fill up. Moving to HarvesterPoint");
                creep.moveTo(Game.flags["HarvesterPoint"])
            }
        }
    }
};