import {getGameObjectById} from "./generalUtils";

class ContainerAssignmentManager {
    init() {
        this.containerCatalogByRoom = {}
        Object.values(Game.rooms).forEach((room) => {
            this.containerCatalogByRoom[room.name] = {}
            const roomContainers = room.find(FIND_STRUCTURES,
                {filter: struct => struct.structureType === STRUCTURE_CONTAINER})
            roomContainers.forEach(container => {
                this.containerCatalogByRoom[room.name][container.id] = 0
            })
        })
    }

    allocateClosestFreeContainerInRoom(creep, roomName) {
        if (this.containerCatalogByRoom) {
            const roomContainersObj = this.containerCatalogByRoom[roomName]
            const availableContainers = []
            Object.keys(roomContainersObj).forEach(containerId => {
                if (roomContainersObj[containerId] === 0) {
                    availableContainers.push(getGameObjectById(containerId))
                }
            })
            const closestContainer = creep.pos.findClosestByRange(availableContainers)

            if (closestContainer) {
                roomContainersObj[closestContainer.id] = 1
            }
            return closestContainer
        }
        else {
            throw "ContainerAssignmentManager (cam) needs to be initialized."
        }
    }
}
const camInstance = new ContainerAssignmentManager()

export {camInstance as cam}