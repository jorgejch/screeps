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
const roomsToExploit = [Game.rooms["W71S76"]];

module.exports.loop = function () {
    // print available rooms
    Object.keys(Game.rooms).forEach(function (room) {
        console.log(`Room ${room} is available`)
    });

    // look for hostiles in hq
    const hostiles = hq_room.find(FIND_HOSTILE_CREEPS);

    // clean memory from dead creeps.
    garbageCollector.clearDeadScreepsFromMemory();
    // update creeps roles counts
    hr.updateNumOfCreepsByRoles();
    // organize creeps
    hr.setRoles(hostiles.length);
    // spawn creeps
    spawner.spawn(Game.spawns['Spawn1']);

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
                harvesterRole.assign_subrole(creep);

                if (creep.memory.subrole === "commuter"){
                    harvesterRole.run(creep,roomsToExploit[0], hq_room);
                }
                else {
                    harvesterRole.run(creep, hq_room, hq_room);
                }
                break;
            }
            case "builder": {
                builderRole.assign_subrole(creep);

                if (creep.memory.subrole === "expat") {
                    builderRole.run(creep, roomsToExploit[0], roomsToExploit[0]);
                }
                else{
                    builderRole.run(creep, hq_room, hq_room)
                }

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
                repairmanRole.assign_subrole(creep);
                repairmanRole.run(creep, hq_room, hq_room);
                break;
            }
        }
    })
};