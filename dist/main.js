/* TODO
    -   alternar sources
    -   criar funcao de rebalanceamento
    -   autoescale creeps based on energy availability
*/

/* imports */
const generalUtils = require("GeneralUtils");
const hr = require('HR');
const garbageCollector = require('GarbageCollector');
const spawner = require('Spawner');
// roles
const harvesterRole = require('role.harvester');
const conquerorRole = require('role.conqueror');
const upgraderRole = require('role.upgrader');
const builderRole = require('role.builder');
const guardRole = require('role.guard');
const repairmanRole = require('role.repairman');

const HQ_ROOM = Game.rooms.W71S75;
// TODO: source farmed rooms creep counts from here
const FARMED_ROOMS = {"W71S73": {}, "W71S76": {}};

generalUtils.resetStoredStructures();

module.exports.loop = function () {
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
    Object.keys(Game.rooms)
        .filter((roomName) => Game.rooms[roomName].controller !== undefined
            && Game.rooms[roomName].controller.owner !== undefined
            && Game.rooms[roomName].controller.owner.username === "JorgeJCH")
        .forEach(function (roomName) {
            const room = Game.rooms[roomName];
            const hostiles = room.find(FIND_HOSTILE_CREEPS);
            generalUtils.updateStructures(room);
            generalUtils.updateStrayResources(room);

            if (hostiles.length) {
                Memory.war[room.name] = true;
                const username = hostiles[0].owner.username;
                Game.notify(`User ${username} spotted in room ${room.name}`);
                const towers = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                towers.forEach(tower => tower.attack(hostiles[0]));
                if (Memory.harvesters < 2) {
                    room.controller.activateSafeMode()
                }
            }
            else {                  // no hostiles => use towers to repair
                Memory.war[room.name] = false;
                const towers = room.find(FIND_STRUCTURES,
                    {filter: (structure) => (structure.structureType === STRUCTURE_TOWER)});
                towers.forEach(function (tower) {
                    const targets = HQ_ROOM.find(FIND_STRUCTURES,
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
            case "harvester":
                if (creep.memory.subrole === "commuter") {
                    creep.memory.target = "W71S76";
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
                    roomName = creep.memory.target;
                    if (Game.rooms[roomName] === undefined) {
                        upgraderRole.run(creep, Game.flags[roomName], Game.rooms[creep.memory.citizenship], null, true);
                    } else {
                        upgraderRole.run(creep, Game.rooms[roomName], Game.rooms[creep.memory.citizenship], 99);
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
                guardRole.run(creep, HQ_ROOM);
                break;
            case 'repairman':
                repairmanRole.run(creep, HQ_ROOM, HQ_ROOM);
                break;
        }
    })
};