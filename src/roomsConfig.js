import rules from 'rules'
import {RuleTicket} from 'rulesUtils'
import {TaskTicket} from "tasksUtils"
import tasks from "tasks"


function addOrUpdateCreepTypeNumberToRoomRuleTicket(room, type, requiredQuantity, initParams, priority) {
    const ruleTickets = room.memory.ruleTickets
    const name = rules.CREEP_TYPE_NUMBER_IN_ROOM.name
    const params = {type: type, requiredNumber: requiredQuantity, priority: priority, newCreepParams: initParams}
    const existingRuleTicket = ruleTickets.find(ticket =>  {

        return ticket.ruleParams.type === type} )
    // add ticket if ticket for same type doesn't exist but only update existing ticket's rule params if it does
    if (!existingRuleTicket) {
        // regex that matches a similar creep type (different version)
        const similarTypeRegexStr = `${type.substring(0, type.lastIndexOf("_"))}_\\d+`
        console.log(similarTypeRegexStr)
        const similarTypeRegex = new RegExp(similarTypeRegexStr)

        // remove any existing tickets for similar type
        for (const index in ruleTickets) {
            const ruleTicket = ruleTickets[index]

            if (ruleTicket.ruleParams.type.search(similarTypeRegex) > -1) {
                console.log(JSON.stringify(ruleTicket.ruleParams.type.search(similarTypeRegex)))
                const indexToRemove = ruleTickets.indexOf(ruleTicket)
                if (indexToRemove > -1) {
                    ruleTickets.splice(indexToRemove, 1)
                }
            }
        }

        ruleTickets.push(new RuleTicket(name, params))
    }
    else {
        existingRuleTicket.ruleParams = params
    }
}


export default {
    /**
     * bootstrap rooms once
     */
    bootstrapRoomsConfig: function () {
        Object.values(Game.rooms).filter(function (room) {
            return !("bootstrapped" in room.memory)
        }).forEach(
            function (room) {
                room.memory.orderBook = {}
                room.memory.ruleTickets = []

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
        if ("E47S16" in Game.rooms) {
            const room = Game.rooms["E47S16"]
            // Room props
            room.memory.spawns = ["Spawn1"]

            // Setup Required Creeps
            //// Basic Harvester
            addOrUpdateCreepTypeNumberToRoomRuleTicket(
                room,
                "BASIC_HARVESTER_1",
                3,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {roomName: room.name}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_TRANSFER_ENERGY_TO_ROOM_SPAWN_STRUCTS.name, {roomName: room.name}
                        )
                    ]
                },
                1
            )

            //// Basic Upgrader
            addOrUpdateCreepTypeNumberToRoomRuleTicket(
                room,
                "BASIC_UPGRADER_1",
                4,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {roomName: room.name}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_UPGRADE_ROOM_CONTROLLER.name, {roomName: room.name}
                        )
                    ]
                },
                2
            )

            //// Basic Builder
            addOrUpdateCreepTypeNumberToRoomRuleTicket(
                room,
                "BASIC_BUILDER_1",
                5,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {roomName: room.name}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_BUILD_ROOM.name, {roomName: room.name}
                        )
                    ]
                },
                5
            )

            //// Basic Repairman
            addOrUpdateCreepTypeNumberToRoomRuleTicket(
                room,
                "BASIC_REPAIRMAN_1",
                5,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {roomName: room.name}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_REPAIR_ROOM_STRUCTURES.name, {roomName: room.name}
                        )
                    ]
                },
                10
            )
        }
    }
}