
class E47S16 extends BaseRoomConfig {
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
            this.room
                .find(FIND_STRUCTURES, {filter: struct => struct.structureType === STRUCTURE_CONTAINER})
                .forEach(container => {
                    this.addCreepRoleQuantityInRoomRule(
                        `STATIONARY_HARVESTER_FOR_${container.id}`,
                        "STATIONARY_WORKER_3",
                        1,
                        {
                            taskTicketQueue: [
                                new TaskTicket(
                                    tasks.ALLOCATE_SPECIFIC_TARGET_CONTAINER_IN_ROOM.name,
                                    {containerId: container.id}
                                ),
                                new TaskTicket(tasks.GO_TO_HARVESTING_POSITION.name, {}),
                                new TaskTicket(tasks.HARVEST_CLOSEST_SOURCE_IN_PLACE.name, {}),
                            ]
                        },
                        1
                    )
                })

            //// Storage Loader
            this.addCreepRoleQuantityInRoomRule(
                "STORAGE_LOADER",
                "FREIGHTER_4",
                1,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_PICKUP_DROPPED_RESOURCE.name, {}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_LEECH_ENERGY_FROM_FULLEST_CONTAINER_IN_ROOM.name,
                            {roomName: this.room.name, amount: null}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_TRANSFER_ALL_RESOURCES_TO_ROOM_STORAGE.name,
                            {roomName: this.room.name}
                        )
                    ]
                },
                3
            )
            //// Leech Loader
            this.addCreepRoleQuantityInRoomRule(
                "SPAWN_AND_EXTENSION_LOADER",
                "FREIGHTER_3",
                2,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_PICKUP_DROPPED_RESOURCE.name, {}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_LEECH_FROM_ROOM_STORAGE.name,
                            {roomName: this.room.name, resourceType: RESOURCE_ENERGY, amount: null}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_TRANSFER_ENERGY_TO_ROOM_SPAWN_STRUCTS.name, {roomName: this.room.name}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_LEECH_FROM_ROOM_STORAGE.name,
                            {roomName: this.room.name, resourceType: RESOURCE_ENERGY, amount: null}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_STORE_TOWER_TO_LOAD.name,
                            {roomName: this.room.name}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_FEED_EMPTIER_TOWER.name,
                            {resourceType: RESOURCE_ENERGY, amount: null}
                        ),
                    ]
                },
                2
            )
            //// Leech Upgrader
            this.addCreepRoleQuantityInRoomRule(
                "LEECH_UPGRADER",
                "BASIC_WORKER_3",
                5,
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
            Object.values(this.roomFarms).forEach(roomName => {
                //// Commuter Harvester
                this.addCreepRoleQuantityInRoomRule(
                    `COMMUTER_HARVESTER_OF_${roomName}`,
                    "COMMUTER_WORKER_4",
                    4,
                    {
                        taskTicketQueue: [
                            new TaskTicket(
                                tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {
                                    roomName: getRandomArrayElement(this.roomFarms)
                                }
                            ),
                            new TaskTicket(
                                tasks.CYCLIC_TRANSFER_ALL_RESOURCES_TO_ROOM_STORAGE.name,
                                {roomName: this.room.name}
                            ),
                            new TaskTicket(
                                tasks.CYCLIC_PICKUP_DROPPED_RESOURCE.name, {}
                            ),
                        ]
                    },
                    5
                )
                //// Reserver
                this.addCreepRoleQuantityInRoomRule(
                    `RESERVER_OF_${roomName}`,
                    "CLAIMER_2",
                    1,
                    {
                        taskTicketQueue: [
                            new TaskTicket(
                                tasks.RESERVE_STORED_ROOM_CONTROLLER.name, {roomName: roomName}
                            )
                        ]
                    },
                    6
                )
            })
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
            //// Basic Harvester
            this.addCreepRoleQuantityInRoomRule(
                "BASIC_HARVESTER",
                "BASIC_WORKER_2",
                0,
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