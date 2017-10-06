let harvesterRole;
module.exports = harvesterRole = {
    assign_subrole: function (creep) {
    if (_.filter(Memory.harvesters, {memory: {subrole: "commuter"}}).length <= 4
        && _.filter(Memory.harvesters, {memory: {subrole: "local"}}).length > 2){
        creep.memory.subrole = "commuter";
        console.log(`${creep.name} assigned to commute.`)
    }
},
    run: function(creep, roomSource, roomTarget){
        if (creep.carry.energy < creep.carryCapacity){
            const sources = roomSource.find(FIND_SOURCES);

            if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE){
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ddff27'}});
            }
            else {
                console.log(`${creep.name} is unable to harvest source because of ${creep.harvest(sources[0])}`)
            }
        } else {
            const targets = roomTarget.find(FIND_STRUCTURES, {
                filter: (structure) => (
                    structure.structureType === STRUCTURE_EXTENSION
                    || structure.structureType === STRUCTURE_SPAWN
                    || structure.structureType === STRUCTURE_TOWER
                ) && (structure.energy < structure.energyCapacity)
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