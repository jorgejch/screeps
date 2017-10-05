/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.harvester');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run: function(creep, spawn){
        var room = creep.room

        if (creep.carry.energy < creep.carryCapacity){
            var sources = room.find(FIND_SOURCES);

            if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE){
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#fff'}});
            }
        } else {
            var targets = room.find(FIND_STRUCTURES, {filter: (structure) => (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) 
                && (structure.energy < structure.energyCapacity)})
                
            if (targets.length){
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ff0'}});
                }
            } 
            else {
                console.log("Nothing to fill up. Moving to HarvesterPoint")
                creep.moveTo(Game.flags["HarvesterPoint"])
            }
        }
    }
};