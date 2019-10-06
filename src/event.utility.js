'use strict'

module.exports = {
    deleteRoomRepairManager: (flag) => {
        const targetRoomName = flag.pos.roomName
        const ownerRoomName = flag.name
        const process = Kernel.getProcessByLabel(`repair_manager_of_room_${targetRoomName}_from_${ownerRoomName}`)
        process.die()
    }
}