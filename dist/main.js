/* TODO
    -   alternar sources
    -   criar funcao de rebalanceamento
    -   autoescale creeps based on energy availability
*/

/* roles */
const harvesterRole = require('role.harvester');
const conquerorRole = require('role.conqueror');
const upgraderRole = require('role.upgrader');
const builderRole = require('role.builder');
const guardRole = require('role.guard');
const repairmanRole = require('role.repairman');
/* other */
const generalUtils = require("GeneralUtils");
const hr = require('HR');
const garbageCollector = require('GarbageCollector');

const spawner = require('Spawner');
const hq_room = Game.rooms.W71S75;

module.exports.loop = function () {
    garbageCollector.clearDeadScreepsFromMemory();
    generalUtils.resetStoredStructures();
    // update stored entities found in each room
    Object.keys(Game.rooms).forEach(function (roomName) {
        generalUtils.updateStructures(Game.rooms[roomName], roomName === "W71S76" || roomName === "W71S74");
        generalUtils.updateStrayResources(Game.rooms[roomName]);
    });
    hr.updateCreepsRolesCount();
    const hostiles = hq_room.find(FIND_HOSTILE_CREEPS);

    if (hostiles.length) {
        Memory.war = true;
        const username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room W71S75`);
        const towers = hq_room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        towers.forEach(tower => tower.attack(hostiles[0]));
        if (Memory.harvesters < 2) {
            hq_room.controller.activateSafeMode()
        }
    }
    else {                  // no hostiles => use towers to repair
        Memory.war = false;
        const towers = hq_room.find(FIND_STRUCTURES,
            {filter: (structure) => (structure.structureType === STRUCTURE_TOWER)});
        towers.forEach(function (tower) {
            const targets = hq_room.find(FIND_STRUCTURES,
                {
                    filter: (structure) => (structure.hits < structure.hitsMax)
                        && (structure.hitsMax - structure.hits > 100)
                });
            const toRepair = targets.sort(function (a, b) {
                return a.hits - b.hits
            })[0];
            tower.repair(toRepair)
        });
    }

    generalUtils.printStats(Memory.war ? "war" : "peace");
    hr.setRoles(hostiles.length);
    spawner.spawn(Game.spawns['Spawn1']);

    Object.keys(Game.creeps).forEach(function (key) {
        const creep = Game.creeps[key];

        let roomName;
        switch (creep.memory.role) {
            case "harvester":
                if (creep.memory.subrole === "commuter") {
                    roomName = creep.memory.target;
                    if (Game.rooms[roomName] === undefined) {
                        // goto room flag if room not visible
                        harvesterRole.run(creep, Game.flags[roomName], Game.rooms[creep.memory.citizenship], true);
                    } else {
                        harvesterRole.run(creep, Game.rooms[roomName], Game.rooms[creep.memory.citizenship]);
                    }
                }
                else {
                    harvesterRole.run(creep, Game.rooms[creep.memory.citizenship], Game.rooms[creep.memory.citizenship]);
                }
                break;
            case "conqueror":
                roomName = creep.memory.citizenship;
                if (Game.rooms[roomName] === undefined) {
                    conquerorRole.run(creep, Game.flags[roomName], true)
                } else {
                    conquerorRole.run(creep, Game.rooms[roomName])
                }
                break;
            case "builder":
                roomName = creep.memory.citizenship;
                builderRole.run(creep, Game.rooms[roomName], Game.rooms[roomName]);
                break;
            case "upgrader":
                if (creep.memory.subrole === "commuter") {
                    creep.memory.target = "W71S74";
                    roomName = creep.memory.target;
                    if (Game.creeps[roomName] === undefined) {
                        upgraderRole.run(creep, Game.flags[roomName], Game.rooms[creep.memory.citizenship], 99, true);
                    } else {
                        upgraderRole.run(creep, sourceRoom, hq_room, 99);
                    }
                }
                else {
                    upgraderRole.run(
                        creep,
                        Game.rooms[creep.memory.citizenship],
                        Game.rooms[creep.memory.citizenship],
                        99
                    );
                }
                break;
            case "guard":
                guardRole.run(creep, hq_room);
                break;
            case 'repairman':
                repairmanRole.run(creep, hq_room, hq_room);
                break;
        }
    })
};