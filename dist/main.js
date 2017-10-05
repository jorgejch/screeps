/* TODO
    -   alternar sources
    -   criar funcao de rebalanceamento
*/

// to remove
Memory.minSpawn1Energy = 150;

/* roles */
const harvesterRole = require('role.harvester');
const upgraderRole = require('role.upgrader');
const builderRole = require('role.builder');
const guardRole = require('role.guard');
const repairmanRole = require('role.repairman');
/* other */
const hr = require('HR');
const garbageCollector = require('GarbageCollector');
const spawner = require('Spawner');
const hq_room = Game.rooms.W71S75;

module.exports.loop = function () {
    // Clean memory from dead creeps.
    garbageCollector.run();
    // Find hostiles
    const hostiles = Game.rooms["W71S75"].find(FIND_HOSTILE_CREEPS);
    // organize creeps
    hr.run(hostiles.length);
    // spawn creeps
    spawner.run(Game.spawns['Spawn1']);

    // attack with towers in case of attack
    if (hostiles.length) {
        const username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room W71S75`);
        const towers = hq_room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        towers.forEach(tower => tower.attack(hostiles[0]));
        if (Memory.harvesters < 2) {
            hq_room.controller.activateSafeMode()
        }
    }

    Object.keys(Game.creeps).forEach(function (key) {
        const creep = Game.creeps[key];

        switch (creep.memory.role) {
            case "harvester": {
                harvesterRole.run(creep, hq_room);
                break;
            }
            case "builder": {
                builderRole.run(creep, hq_room);
                break;
            }
            case "upgrader": {
                upgraderRole.run(creep, hq_room);
                break;
            }
            case "guard": {
                guardRole.run(creep, hq_room);
                break;
            }
            case 'repairman': {
                repairmanRole.run(creep, hq_room);
                break;
            }
        }
    })
};