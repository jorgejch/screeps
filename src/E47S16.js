import {getRandomArrayElement, getRoom, getGameObjectById} from './generalUtils'
import {BaseRoomConfig} from "./BaseRoomConfig";
import {TaskTicket} from "./tasksUtils"
import tasks from "./tasks"


export default class extends BaseRoomConfig {
    constructor() {
        super(
            /* room      */   getRoom("E47S16"),
            /* roomFarms */   ["E47S15", "E48S16", "E47S17"],
        )
    }
    configureCreepRequirements() {
        if ("E47S16" in Game.rooms) {
            // Setup Required Creeps
            //// Stationary Harvester
            this.addCreepTypeQuantityInRoomRule(
                "STATIONARY_HARVESTER_3",
                2,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_DROP_RESOURCE_ON_TOP_ASSIGNED_CONTAINER.name,
                            {roomName: this.room.name, resourceType: RESOURCE_ENERGY}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {roomName: this.room.name}
                        ),
                    ]
                },
                1
            )
            //// Leech Upgrader
            this.addCreepTypeQuantityInRoomRule(
                "LEECH_UPGRADER_3",
                2,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_LEECH_FROM_CLOSEST_CONTAINER_IN_ROOM.name,
                            {roomName: this.room.name, resourceType: RESOURCE_ENERGY, amount: null}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_UPGRADE_ROOM_CONTROLLER.name, {roomName: this.room.name}
                        )
                    ]
                },
                2
            )
            //// Basic Harvester
            this.addCreepTypeQuantityInRoomRule(
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
            this.addCreepTypeQuantityInRoomRule(
                "BASIC_UPGRADER_2",
                3,
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
            this.addCreepTypeQuantityInRoomRule(
                "BASIC_BUILDER_2",
                1,
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
            this.addCreepTypeQuantityInRoomRule(
                "BASIC_REPAIRMAN_2",
                5,
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
            this.addCreepTypeQuantityInRoomRule(
                "COMMUTER_HARVESTER_2",
                10,
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
            this.addCreepTypeQuantityInRoomRule(
                "COMMUTER_UPGRADER_2",
                10,
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