
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.mantenedor');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run: function(creep){
        var room = Game.rooms["W71S75"]
        if (creep.memory.harvesting && creep.carry.energy == creep.carryCapacity){
            creep.memory.harvesting = false
            creep.say("repair")
        }
        else if (!creep.memory.harvesting && creep.carry.energy == 0){
            creep.memory.harvesting = true
            creep.say("harvest")

        }

        if (creep.memory.harvesting){
            var sources = room.find(FIND_SOURCES);
            if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE){ 
                creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#dff'}});   // com traço
            }

        } else {
            // volunter if exclusive needed
            if (!_.filter(Memory.repairmans, {memory: {exclusive: true}}).length){
                creep.memory.exclusive = true
            }
            
            var target
            // exclusive does only my stuff
            if (!creep.memory.exclusive){
                target = _.sortBy(room.find(FIND_STRUCTURES, {filter: (structure) => (structure.hits < structure.hitsMax)}), function(structure){return structure.hits})
            }
            else {
                target = _.sortBy(room.find(FIND_MY_STRUCTURES, {filter: (structure) => (structure.hits < structure.hitsMax)}), function(structure){return structure.hits})
            }
            
            if (target.length){
                if (creep.repair(target[0]) == ERR_NOT_IN_RANGE){
                    creep.moveTo(target[0], {visualizePathStyle: {stroke: '#df0'}})
                }
            }
            else {
                console.log("Nothing to repair.")
            }
        }             
    }
};