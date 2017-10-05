/* TODO
    -   alternar sources
    -   criar funcao de rebalanceamento
*/

// init personel obj
Memory.personel = {}
// to remove
Memory.minSpawn1Energy = 150;

/* roles */
var harvesterRole = require('role.harvester')
var upgraderRole = require('role.upgrader')
var builderRole = require('role.builder')
var guardRole = require('role.guard')
var repairmanRole = require('role.repairman')
/* utilities */
var hr = require('HR')
var garbageCollector = require('GarbageCollector')
var spawner = require('Spawner')

// the spawn
var spawn = Game.spawns.Spawn1

 module.exports.loop = function(){
    // Clean memory from dead creeps.
    garbageCollector.run()
    // Find hostiles
    var hostiles = Game.rooms["W71S75"].find(FIND_HOSTILE_CREEPS)
    // organize creeps
    hr.run(hostiles.length)
    // spawn creeps
    spawner.run(Game.spawns['Spawn1'])
    
    // attack with towers in case of attack
    if (hostiles.length){
        var username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room W71S75`);
        var towers = Game.rooms["W71S75"].find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        towers.forEach(tower => tower.attack(hostiles[0]));
        if (Game.rooms["W71S75"].creeps.length < 4){
            Game.rooms["W71S75"].controller.activateSafeMode()
        }
    }
    
    Object.keys(Game.creeps).forEach (function(key){
        var creep = Game.creeps[key];

        switch(creep.memory.role){
            case "harvester":   {harvesterRole.run(creep, spawn); break;}
            case "builder":     {builderRole.run(creep); break;}
            case "upgrader":    {upgraderRole.run(creep); break;}
            case "guard":       {guardRole.run(creep); break;}
            case 'repairman':   {repairmanRole.run(creep); break;}
        }
    })
}