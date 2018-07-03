const _ = require('lodash')
const rulesFactory = require("rulesFactory")
const tasks = require('tasksFactory')

function addRuleToRoom(room, rule) {
    room.memory.rules[rule.name] = rule
}

module.exports = {
    /**
     * bootstrap rooms once
     */
    bootstrapRoomsConfig: function () {
        Object.values(Game.rooms).filter(function (room) {
            return !("bootstrapped" in room.memory)
        }).forEach(
            function (room) {
                room.memory.rules = {}
                room.memory.orderBook = {}

                // mark setup completion for room
                room.memory.bootstrapped = 1
            }
        )
    },
    roomsReset: function () {
        Object.values(Game.rooms).forEach(function (room) {
            room.memory.creepsInventory = {}
        })
    },
    creepsRequirementConfig: function () {
        // if ("E36S19" in Game.rooms) {
        if ("sim" in Game.rooms) {
            // const room = Game.rooms["E36S19"]
            const room = Game.rooms["sim"]
            const source = _.maxBy(room.find(FIND_SOURCES_ACTIVE), function (source) { return source.energy })
            // Room props
            room.memory.spawns = ["Spawn1"]

            // Setup Required Creeps
            const basicCreepsParams = {sourceRoomName: room.name, targetRoomName: room.name}
            //// Basic Harvester
            addRuleToRoom(
                room,
                rulesFactory.getCreepTypeNumberInRoomRule(
                    "BASIC_HARVESTER_1",
                    2,
                    room.name,
                    1,
                    _.merge(basicCreepsParams, {
                            task: new tasks.getBasicHarvestEnergyFromSourceTask(
                                source,
                                new tasks.getTransferEnergyToSpawnersOrExtentionsTask()
                            )

                            )
                        }
                    ),
                )
            //// Basic Upgrader
            addRuleToRoom(
                room,
                rulesFactory.getCreepTypeNumberInRoomRule(
                    "BASIC_UPGRADER_1",
                    2,
                    room.name,
                    2,
                    basicCreepsParams
                ),
            )
            //// Basic Builder
            addRuleToRoom(
                room,
                rulesFactory.getCreepTypeNumberInRoomRule(
                    "BASIC_BUILDER_1",
                    1,
                    room.name,
                    3,
                    basicCreepsParams
                )
            )
        }
    }
}