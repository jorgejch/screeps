/* TODO
    -   alternar sources
    -   criar funcao de rebalanceamento
    -   autoescale creeps based on energy availability
*/

/* roles */
const harvesterRole = require('role.harvester');
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
const roomsToExploitFlags = {/*target*/W71S75: [Game.flags.W71S76, Game.flags.W71S74]};

module.exports.loop = function () {
    // clean memory from dead creeps.
    garbageCollector.clearDeadScreepsFromMemory();
    // update creeps roles counts
    hr.updateNumOfCreepsByRoles();
    // look for hostiles in hq
    const hostiles = hq_room.find(FIND_HOSTILE_CREEPS);
    // update stored structures of interest
    generalUtils.updateStoredStructures(hq_room);

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

    generalUtils.print_stats(Memory.war ? "war" : "peace");
    hr.setRoles(hostiles.length);
    spawner.spawn(Game.spawns['Spawn1']);

    // default to room flag if room to exploit is not visible not visible
    if (roomsToExploitFlags[0] !== undefined) {
        roomsToExploitFlags[0] = Game.flags.W71S76;
    }


    Memory.sources = {}; // reset sources obj to recount them
    Object.keys(Game.creeps).forEach(function (key) {
        const creep = Game.creeps[key];

        switch (creep.memory.role) {
            case "harvester":
                if (creep.memory.subrole === "commuter") {
                    const sourceRoom = Game.rooms["W71S76"];
                    if (sourceRoom === undefined) {
                        harvesterRole.run(creep, roomsToExploitFlags[hq_room.name][0], hq_room, true);
                    } else {
                        harvesterRole.run(creep, sourceRoom, hq_room);
                    }
                }
                else {
                    harvesterRole.run(creep, hq_room, hq_room);
                }
                break;
            case "builder":
                builderRole.assignSubrole(creep);

                if (creep.memory.subrole === "expat") {
                    builderRole.run(creep, roomsToExploitFlags[0], roomsToExploitFlags[0]);
                }
                else {
                    builderRole.run(creep, hq_room, hq_room)
                }

                break;
            case "upgrader":
                const sourceRoom = Game.rooms["W71S74"];
                if (creep.memory.subrole === "commuter") {
                    if (sourceRoom === undefined) {
                        upgraderRole.run(creep, roomsToExploitFlags[hq_room.name][1], hq_room, 99, true);
                    } else {
                        upgraderRole.run(creep, sourceRoom, hq_room, 99);
                    }
                }
                else {
                    upgraderRole.run(creep, hq_room, hq_room, 99);
                }
                break;
            case "guard":
                guardRole.run(creep, hq_room);
                break;
            case 'repairman':
                repairmanRole.assignSubrole(creep);
                repairmanRole.run(creep, hq_room, hq_room);
                break;
        }
    })
};