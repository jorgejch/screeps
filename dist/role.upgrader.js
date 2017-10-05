/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.upgrader');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run: function(creep){
    var room = creep.room
        if (creep.memory.harvesting && creep.carry.energy == creep.carryCapacity){
            creep.memory.harvesting = false
            creep.say("upgrade")

        }
        else if (!creep.memory.harvesting && creep.carry.energy == 0){
            creep.memory.harvesting = true
            creep.say("harvest")

        }

        if (creep.memory.harvesting){
            var sources = room.find(FIND_SOURCES);

            if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE){                     // vai pra source 2
                creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#fff'}});
            }

        } else {
            if (creep.upgradeController(room.controller) == ERR_NOT_IN_RANGE){
                creep.moveTo(room.controller, {visualizePathStyle: {stroke: '#ef0'}})

            }
        }             
    }
};