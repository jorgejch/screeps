'use strict'
const BaseProcess = require("process.base")
const config = require("config")

module.exports = {
    EmpireManager: class extends BaseProcess {
        run() {
            if (!this.data.ownRooms) {
                this.data.ownRooms = {}
            }

            Object.keys(Game.rooms).forEach(roomName => {
                const room = Game.rooms[roomName]
                if (
                    room.controller
                    && room.controller.owner.username === config.PLAYER_NAME
                    && !this.data.ownRooms[roomName]
                ) {
                    const label = `${roomName}_manager`
                    const process = Kernel.scheduler.launchProcess(
                        Kernel.availableProcessClasses.OwnedRoomManager,
                        label,
                        this.pid,
                        10
                    )
                    this.data.ownRooms[roomName] = process.label
                    process.roomName = roomName
                }
            })
        }
    }
}