/* TODO
    -   alternar sources
    -   criar funcao de rebalanceamento
    -   autoescale creeps based on energy availability
*/

/* imports */
const generalUtils = require("GeneralUtils");
const rolesUtils = require("RolesUtils");
const hr = require('HR');
const garbageCollector = require('GarbageCollector');
const spawner = require('Spawner');
// roles
const harvesterRole = require('role.harvester');
const distributorRole = require('role.distributor');
const conquerorRole = require('role.conqueror');
const upgraderRole = require('role.upgrader');
const builderRole = require('role.builder');
const guardRole = require('role.guard');
const repairmanRole = require('role.repairman');

const HQ_ROOM = Game.rooms.E13S15;
// TODO: source farmed rooms creep counts from here
const FARMED_ROOMS = {};

generalUtils.resetStoredEntities();

module.exports.loop = function () {
    return;
    // if cpu bucket is too low wait
    if (Game.cpu.bucket < 100) {
        return;
    }
    else if (Game.cpu.bucket < 5000) {
        Memory.spawningPenalty = -1;
    }
    else {
        Memory.spawningPenalty = 0;
    }

    garbageCollector.clearDeadScreepsFromMemory();

    // loop farmed rooms
    Object.keys(Game.rooms)
        .filter((roomName) => Object.keys(FARMED_ROOMS).includes(roomName))
        .forEach(function (roomName) {
            generalUtils.updateStructures(Game.rooms[roomName], true);
            generalUtils.updateStrayResources(Game.rooms[roomName]);
        });
    // loop my rooms
    Memory.war = {};
    Object.keys(Game.rooms)
        .filter((roomName) => Game.rooms[roomName].controller !== undefined
            && Game.rooms[roomName].controller.owner !== undefined
            && Game.rooms[roomName].controller.owner.username === "JorgeJCH")
        .forEach(function (roomName) {
            const room = Game.rooms[roomName];
            const hostiles = room.find(FIND_HOSTILE_CREEPS);
            Memory.war[room.name] = hostiles.length > 0;
            if (Memory.war[room.name]) {
                const username = hostiles[0].owner.username;
                Game.notify(`User ${username} spotted in room ${room.name}`);
            }
            generalUtils.updateStructures(room);
            generalUtils.updateStrayResources(room);

            // hostiles => towers attack || no hostiles => towers repair
            const towers = Memory.towers[room.name];
            if (towers.length) {
                if (Memory.war[room.name]) {
                    const towers = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                    towers.forEach(tower => tower.attack(hostiles[0]));
                    if (Memory.distributors.length <= 1) {
                        room.controller.activateSafeMode()
                    }
                }
                else {
                    towers.forEach(function (tower) {
                        const targets = room
                            .find(FIND_STRUCTURES, {filter: structure => structure.hitsMax - structure.hits > 99})
                            .sort(function (a, b) {
                                return a.hits - b.hits
                            });
                        tower.repair(targets[0])
                    });
                }
            }
        });

    hr.updateCreepsRolesCount();
    generalUtils.printStats();
    // don't set roles based on hostile creeps on other rooms besides hq for now
    hr.setRoles(HQ_ROOM.find(FIND_HOSTILE_CREEPS).length);
    spawner.spawn(Game.spawns['Spawn1']);

    Object.keys(Game.creeps).forEach(function (key) {
        const creep = Game.creeps[key];

        let roomName;
        switch (creep.memory.role) {
            case "distributor":
                distributorRole.run(creep, creep.memory.citizenship, rolesUtils.targetBuilder);
                break;
            case "harvester":
                if (creep.memory.subrole === "commuter") {
                    roomName = creep.memory.target;
                    if (Game.rooms[roomName] === undefined) {
                        // goto room flag if room not visible
                        harvesterRole.run(creep, roomName, creep.memory.citizenship, true);
                    } else {
                        harvesterRole.run(creep, roomName, creep.memory.citizenship);
                    }
                }
                else {
                    harvesterRole.run(creep, creep.memory.citizenship, creep.memory.citizenship);
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
                if (Game.cpu.bucket > 3000) {
                    roomName = creep.memory.citizenship;
                    builderRole.run(creep, roomName, roomName);
                }
                break;
            case "upgrader":
                if (creep.memory.subrole === "commuter") {
                    roomName = creep.memory.target;
                    if (Game.rooms[roomName] === undefined) {
                        upgraderRole.run(creep, roomName, creep.memory.citizenship, true);
                    } else {
                        upgraderRole.run(creep, roomName, creep.memory.citizenship);
                    }
                }
                else {
                    upgraderRole.run(creep, creep.memory.citizenship, creep.memory.citizenship);
                }
                break;
            case "guard":
                guardRole.run(creep, HQ_ROOM);
                break;
            case 'repairman':
                repairmanRole.run(creep, HQ_ROOM, HQ_ROOM);
                break;
        }
    })
};