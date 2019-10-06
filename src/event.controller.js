'use strict'

module.exports = {
    upgradeControllerUnderFlagFromOwnRoom: function (flag) {
        const controller = flag.pos.lookFor(LOOK_STRUCTURES)
            .filter(struct => struct.structureType === STRUCTURE_CONTROLLER)[0]
        const visual = new RoomVisual(flag.room.name)

        const CONTROLLER_UPGRADE_MANAGER_PROC_LABEL = `controller_upgrade_director_of_${controller.room.name}`
        if (Kernel.getProcessByLabel(CONTROLLER_UPGRADE_MANAGER_PROC_LABEL)) {
            visual.text(`Process to upgrade controller ${controller.id} from own room already exists.`, flag.pos)
            return
        }
        console.log(`DEBUG Creating process ${CONTROLLER_UPGRADE_MANAGER_PROC_LABEL}`)
        try {

            const process = Kernel.scheduler.launchProcess(
                Kernel.availableProcessClasses.ControllerUpgradeDirector,
                CONTROLLER_UPGRADE_MANAGER_PROC_LABEL
            )
            visual.text(`Launched process ${process.label}.`, flag.pos)
            process.controllerId = controller.id
        }
        catch (ex) {
            console.log(`Failed to launch process ${CONTROLLER_UPGRADE_MANAGER_PROC_LABEL} `
                + `due to: ${ex.stack}`)
        }
    },
    upgradeFlagRoomControllerOnRemoteRoom: function(flag){

    },
    reserveControllerUnderFlag: function (flag) {
        const controllerPos = flag.pos
        const ownerRoomName = flag.name
        const visual = new RoomVisual(flag.room.name)

        const RESERVE_ROOM_DIRECTOR_PROC_LABEL = `reserve_room_director_of_${controllerPos.roomName}`
        if (Kernel.getProcessByLabel(RESERVE_ROOM_DIRECTOR_PROC_LABEL)) {
            visual.text(
                `Process to reserve controller at position ${JSON.stringify(controllerPos)} already exists.`,
                flag.pos
            )
            return
        }
        console.log(`DEBUG Creating process ${RESERVE_ROOM_DIRECTOR_PROC_LABEL}`)
        try {

            const process = Kernel.scheduler.launchProcess(
                Kernel.availableProcessClasses.ReserveRoomDirector,
                RESERVE_ROOM_DIRECTOR_PROC_LABEL
            )
            visual.text(`Launched process ${process.label}.`, flag.pos)
            process.controllerPositionProps = controllerPos
            process.ownerRoomName = ownerRoomName
        }
        catch (ex) {
            console.log(`Failed to launch process ${RESERVE_ROOM_DIRECTOR_PROC_LABEL} `
                + `due to: ${ex.stack}`)
        }
    }
}