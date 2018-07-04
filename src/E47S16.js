import {getRandomArrayElement, getRoom, getGameObjectById} from './generalUtils'
import {BaseRoomConfig} from "./BaseRoomConfig";
import {TaskTicket} from "./tasksUtils"
import tasks from "./tasks"

class ContainerAssigmentManager {
    constructor() {
        this.containerCatalogByRoom = {}
    }

    init() {

        Object.values(Game.rooms).forEach((room) => {
            containerCatalogByRoom[room.name] = {}
            const roomContainers = room.find(FIND_MY_STRUCTURES,
                {filter: struct => struct.structureType === STRUCTURE_CONTAINER})
            roomContainers.forEach(container => {
                this.containerCatalogByRoom[room.name][container.id] = 0
            })
        })
    }

    allocateClosetFreeContainerInRoomToCreep(creep, roomName) {
        const roomContainersObj = this.containerCatalogByRoom[roomName]
        const availableContainers = []
        Object.keys(roomContainersObj).forEach(containerId => {
            if (roomContainersObj[containerId] === 0 ) {
                availableContainers.push(getGameObjectById(containerId))
            }
        })
        const closestContainer = creep.pos.findClosestByRange(availableContainers)

        if (closestContainer){
            roomContainersObj[closestContainer.id] = 1
        }
        return closestContainer
    }
}

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
            const containerAssignmentManager = new ContainerAssigmentManager()
            containerAssignmentManager.init()
            this.addCreepTypeQuantityInRoomRule(
                "STATIONARY_HARVESTER_3",
                1,
                {
                    taskTicketQueue: [
                        new TaskTicket(
                            tasks.CYCLIC_DROP_RESOURCE_ON_TOP_ASSIGNED_CONTAINER.name,
                            {containerAssignmentManager: containerAssignmentManager, roomName: this.room.name}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {roomName: this.room.name}
                        ),
                    ]
                },
                1
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
                5,
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