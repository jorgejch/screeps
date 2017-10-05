/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('HR');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    recount_creeps: function(numGuards, numHarvesters, numBuilders, numUpgraders, numRepairmans){
        
    },
    run : function(num_hostiles) {
        var assigments = { 
            war: function(){
                Memory.numGuards = num_hostiles
                Memory.numHarvesters = 5
                Memory.numBuilders = 3
                Memory.numUpgraders = 0
                Memory.numRepairmans = 5; 
                
                if (Memory.upgraders.length > Memory.numUpgraders){
                    for (var i = Memory.numUpgraders; i < upgraders.length; i++ ){
                        if (Memory.harvesters.length < Memory.numHarvesters){
                            Memory.upgraders[i].memory.role = "harvester"
                        }
                        else if (Memory.builders.length < Memory.numBuilders) {
                            Memory.upgraders[i].memory.role = "builder"
                        }
                    }
                }
                
                if (Memory.builders.length > Memory.numBuilders){
                    for (var i = Memory.numBuilders; i < builders.length; i++ ){
                        if (Memory.harvesters.length < Memory.numHarvesters){
                            Memory.builders[i].memory.role = "harvester"
                        }       
                        else {
                            break
                        }
                    }
                }
                
                if (Memory.harvesters.length > Memory.numHarvesters){
                    for (var i = Memory.numHarvesters; i < harvesters.length; i++ ){
                        if (Memory.builders.length < Memory.numBuilders){
                            Memory.harvesters[i].memory.role = "builder"
                        }       
                        else {
                            break
                        }
                    }
                }
            },
            peace: function(){
                Memory.numGuards = 0;
                Memory.numHarvesters = 5;
                Memory.numBuilders = 3;
                Memory.numUpgraders = 5;
                Memory.numRepairmans = 3; 
                
                if (Memory.harvesters.length > Memory.numHarvesters){
                    for (var i = Memory.numHarvesters; i < Memory.harvesters.length; i++ ){
                        if (Memory.upgraders.length < Memory.numUpgraders){
                            Memory.harvesters[i].memory.role = "upgrader"
                        }
                        else if (Memory.builders.length < Memory.numBuilders){
                            Memory.harvesters[i].memory.role = "builder"
                        }       
                        else {
                            break
                        }
                    }
                }
                
                if (Memory.builders.length > Memory.numBuilders){
                    for (var i = Memory.numBuilders; i < Memory.builders.length; i++ ){
                        if (Memory.upgraders.length < Memory.numUpgraders){
                            Memory.builders[i].memory.role = "upgrader"
                        }
                        else if (Memory.harvesters.length < Memory.numHarvesters){
                            Memory.builders[i].memory.role = "harvester"
                        }
                        else if (Memory.repairmans.length < Memory.numRepairmans){
                            Memory.builders[i].memory.role = "repairman"
                        }    
                        else {
                            break
                        }
                    }
                }
                
                if (Memory.upgraders.length > Memory.numUpgraders){
                    for (var i = Memory.numUpgraders; i < Memory.upgraders.length; i++ ){
                        if (Memory.builders.length < Memory.numBuilders){
                            Memory.upgraders[i].memory.role = "builder"
                        }
                        else if (Memory.harvesters.length < Memory.numHarvesters) {
                            Memory.upgraders[i].memory.role = "harvester"
                        }
                    }
                }
            },
            // TODO: fix the idea
            unordered_peace: function(){
                Memory.numGuards = 0;
                Memory.numHarvesters = 3;
                Memory.numBuilders = 10;
                Memory.numUpgraders = 3;
                
                if (guards.length > Memory.numGuards){
                    for (var i = Memory.numGuards; i < Memory.guards.length; i++ ){
                        if (Memory.upgraders.length < Memory.numUpgraders){
                            Memory.guards[i].memory.role = "upgrader"
                        }
                        else if (Memory.harvesters.length < Memory.numHarvesters){
                            Memory.guards[i].memory.role = "harvester"
                        } else if (Memory.builders.length < Memory.numBuilders){
                            Memory.guards[i].memory.role = "builder"
                        }
                        else {
                            break
                        }
                    }
                }
            }
        }
        
        Memory.guards = _.filter(Game.creeps,{ memory : {role: 'guard'}});
        Memory.builders = _.filter(Game.creeps,{ memory : {role: 'builder'}});
        Memory.harvesters = _.filter(Game.creeps,{ memory : {role: 'harvester'}});
        Memory.upgraders = _.filter(Game.creeps,{ memory : {role: 'upgrader'}});
        Memory.repairmans = _.filter(Game.creeps,{ memory : {role: 'repairman'}});
        
        if (num_hostiles){
            console.log(`war: guards ${Memory.guards.length}/${Memory.numGuards}; repairmans ${Memory.repairmans.length}/${Memory.numRepairmans}; upgraders ${Memory.upgraders.length}/${Memory.numUpgraders}; builders ${Memory.builders.length}/${Memory.numBuilders}; harvesters ${Memory.harvesters.length}/${Memory.numHarvesters}`)
            assigments.war()
        } 
        else {
            console.log(`peace: guards ${Memory.guards.length}/${Memory.numGuards}; repairmans ${Memory.repairmans.length}/${Memory.numRepairmans}; upgraders ${Memory.upgraders.length}/${Memory.numUpgraders}; builders ${Memory.builders.length}/${Memory.numBuilders}; harvesters ${Memory.harvesters.length}/${Memory.numHarvesters}`)
            assigments.peace()
        }
    }
};