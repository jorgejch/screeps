import {getRandomArrayElement, getRoom} from './generalUtils'
import {BaseRoomConfig} from "./BaseRoomConfig";
import {TaskTicket} from "./tasks"
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
            this.addCreepRoleQuantityInRoomRule(
                "STATIONARY_HARVESTER",
                "STATIONARY_WORKER_3",
                2,
                {
                    taskTicketQueue: [
                        new TaskTicket(tasks.ALLOCATE_TARGET_CONTAINER_IN_ROOM.name, {roomName: this.room.name}),
                        new TaskTicket(tasks.GOTO_ASSIGNED_TARGET_CONTAINER.name, {}),
                        new TaskTicket(tasks.CYCLIC_HARVEST_IN_PLACE.name, {}),
                    ]
                },
                1
            )
            //// Basic Harvester
            this.addCreepRoleQuantityInRoomRule(
                "BASIC_HARVESTER",
                "BASIC_WORKER_2",
                1,
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
                0
            )
            //// Storage Loader
            this.addCreepRoleQuantityInRoomRule(
                "STORAGE_LOADER",
                "LOADER_4",
                2,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.ALLOCATE_SOURCE_CONTAINER_IN_ROOM.name,
                            {roomName: this.room.name}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_LEECH_FROM_ASSIGNED_CONTAINER_IN_ROOM.name,
                            {roomName: this.room.name, resourceType: RESOURCE_ENERGY, amount: null}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_TRANSFER_RESOURCE_TO_ROOM_STORAGE.name,
                            {roomName: this.room.name, resourceType: RESOURCE_ENERGY, amount: null}
                        )
                    ]
                },
                2
            )
            //// Leech Loader
            this.addCreepRoleQuantityInRoomRule(
                "SPAWN_AND_EXTENSION_LOADER",
                "LOADER_2",
                2,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_LEECH_FROM_ROOM_STORAGE.name,
                            {roomName: this.room.name, resourceType: RESOURCE_ENERGY, amount: null}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_TRANSFER_ENERGY_TO_ROOM_SPAWN_STRUCTS.name, {roomName: this.room.name}
                        )
                    ]
                },
                3
            )
            //// Leech Tower Loader
            this.addCreepRoleQuantityInRoomRule(
                "TOWER_LOADER",
                "LOADER_2",
                1,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_LEECH_FROM_ROOM_STORAGE.name,
                            {roomName: this.room.name, resourceType: RESOURCE_ENERGY, amount: null}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_STORE_STRUCTURE_TO_LOAD.name,
                            {structureType: STRUCTURE_TOWER}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_TRANSFER_RESOURCE_TO_STORED_TARGET_STRUCTURE.name,
                            {resourceType: RESOURCE_ENERGY, amount: null}
                        ),
                    ]
                },
                5
            )
            //// Leech Upgrader
            this.addCreepRoleQuantityInRoomRule(
                "LEECH_UPGRADER",
                "BASIC_WORKER_3",
                4,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_LEECH_FROM_ROOM_STORAGE.name,
                            {roomName: this.room.name, resourceType: RESOURCE_ENERGY, amount: null}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_UPGRADE_ROOM_CONTROLLER.name, {roomName: this.room.name}
                        )
                    ]
                },
                5
            )
            if (Object.keys(Game.constructionSites).length > 3) {
                //// Leech Builder
                this.addCreepRoleQuantityInRoomRule(
                    "LEECH_BUILDER",
                    "BASIC_WORKER_3",
                    2,
                    {
                        taskTicketQueue: [
                            new TaskTicket(
                                tasks.CYCLIC_LEECH_FROM_ROOM_STORAGE.name,
                                {roomName: this.room.name, resourceType: RESOURCE_ENERGY, amount: null}
                            ),
                            new TaskTicket(
                                tasks.CYCLIC_BUILD_ALL.name, {}
                            )
                        ]
                    },
                    10
                )
            }
            else if (Object.keys(Game.constructionSites).length > 0) {
                //// Leech Builder
                this.addCreepRoleQuantityInRoomRule(
                    "LEECH_BUILDER",
                    "BASIC_WORKER_3",
                    1,
                    {
                        taskTicketQueue: [
                            new TaskTicket(
                                tasks.CYCLIC_LEECH_FROM_ROOM_STORAGE.name,
                                {roomName: this.room.name, resourceType: RESOURCE_ENERGY, amount: null}
                            ),
                            new TaskTicket(
                                tasks.CYCLIC_BUILD_ALL.name, {}
                            )
                        ]
                    },
                    10
                )
            }
            //// Commuter Harvester
            this.addCreepRoleQuantityInRoomRule(
                "COMMUTER_HARVESTER",
                "COMMUTER_WORKER_4",
                10,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {
                                roomName: getRandomArrayElement(this.roomFarms)
                            }
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_TRANSFER_RESOURCE_TO_ROOM_STORAGE.name,
                            {roomName: this.room.name, resourceType: RESOURCE_ENERGY, amount: null}
                        )
                    ]
                },
                4
            )
            //// Commuter Upgrader
            this.addCreepRoleQuantityInRoomRule(
                "COMMUTER_UPGRADER",
                "COMMUTER_WORKER_2",
                0,
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
                10
            )
            //// Leech Repairman
            this.addCreepRoleQuantityInRoomRule(
                "LEECH_REPAIRMAN",
                "BASIC_WORKER_3",
                0,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_LEECH_FROM_CLOSEST_CONTAINER_IN_ROOM.name,
                            {roomName: this.room.name, resourceType: RESOURCE_ENERGY, amount: null}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_REPAIR_ROOM_STRUCTURES.name, {roomName: this.room.name}
                        )
                    ]
                },
                5
            )
            //// Basic Upgrader
            this.addCreepRoleQuantityInRoomRule(
                "BASIC_UPGRADER",
                "BASIC_WORKER_2",
                0,
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
                2)

            //// Basic Builder
            this.addCreepRoleQuantityInRoomRule(
                "BASIC_BUILDER",
                "BASIC_WORKER_2",
                0,
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
            this.addCreepRoleQuantityInRoomRule(
                "BASIC_REPAIRMAN",
                "BASIC_WORKER_2",
                0,
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
        }
    }
}