import {getRandomArrayElement, getRoom} from './generalUtils'
import {BaseRoomConfig} from "./BaseRoomConfig";
import {TaskTicket} from "./tasksUtils"
import tasks from "./tasks"

export default class extends BaseRoomConfig {
    constructor() {
        super(
            /* room      */   getRoom("E47S16"),
            /* roomFarms */   ["E47S15", "E48S16", "E47S17"],
            /* spawns    */   ["Spawn1"]
        )
    }

    configureCreepRequirements() {
        if ("E47S16" in Game.rooms) {
            // Setup Required Creeps
            //// Basic Harvester
            this.addOrUpdateCreepTypeNumberToRoomRuleTicket(
                "BASIC_HARVESTER_2",
                4,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {roomName: this.room.name}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_TRANSFER_ENERGY_TO_ROOM_SPAWN_STRUCTS.name, {roomName: this.room.name}
                        )
                    ]
                },
                1
            )

            //// Basic Upgrader
            this.addOrUpdateCreepTypeNumberToRoomRuleTicket(
                "BASIC_UPGRADER_2",
                2,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {roomName: this.room.name}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_UPGRADE_ROOM_CONTROLLER.name, {roomName: this.room.name}
                        )
                    ]
                },
                2
            )

            //// Basic Builder
            this.addOrUpdateCreepTypeNumberToRoomRuleTicket(
                "BASIC_BUILDER_2",
                2,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_HARVEST_CLOSEST_SOURCE.name, {}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_BUILD_ALL.name, {}
                        )
                    ]
                },
                7
            )

            //// Basic Repairman
            this.addOrUpdateCreepTypeNumberToRoomRuleTicket(
                "BASIC_REPAIRMAN_2",
                2,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {roomName: this.room.name}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_REPAIR_ROOM_STRUCTURES.name, {roomName: this.room.name}
                        )
                    ]
                },
                5
            )

            //// Commuter Harvester
            this.addOrUpdateCreepTypeNumberToRoomRuleTicket(
                "COMMUTER_HARVESTER_2",
                8,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {
                                roomName: getRandomArrayElement(this.roomFarms)
                            }
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_TRANSFER_ENERGY_TO_ROOM_SPAWN_STRUCTS.name, {roomName: this.room.name}
                        )
                    ]
                },
                10
            )

            //// Commuter Upgrader
            this.addOrUpdateCreepTypeNumberToRoomRuleTicket(
                "COMMUTER_UPGRADER_2",
                8,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {
                                roomName: getRandomArrayElement(this.roomFarms)
                            }
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_UPGRADE_ROOM_CONTROLLER.name, {roomName: this.room.name}
                        )
                    ]
                },
                15
            )
        }
    }
}