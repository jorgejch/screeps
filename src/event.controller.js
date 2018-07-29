const processUtils = require("./util.process");
module.exports = {
    upgradeControllerUnderFlagFromOwnRoom: function (flag) {
        const controller = flag.pos.lookFor(LOOK_STRUCTURES)
            .filter(struct => struct.structureType === STRUCTURE_CONTROLLER)[0]
        const visual = new RoomVisual(flag.room.name)

        const CONTROLLER_UPGRADE_MANAGER_PROC_LABEL = `upgrade_manager_of_${controller.room.name}`
        if (Kernel.getProcessByLabel(CONTROLLER_UPGRADE_MANAGER_PROC_LABEL)) {
            visual.text(`Process to upgrade controller ${controller.id} already exists.`, flag.pos)
            return
        }
        console.log(`DEBUG Creating process ${CONTROLLER_UPGRADE_MANAGER_PROC_LABEL}`)
        try {

            const process = Kernel.scheduler.launchProcess(
                Kernel.availableProcessClasses.ControllerUpgradeManager,
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
    reserveControllerUnderFlag: function (flag) {
        const controllerPos = flag.pos
        const ownerRoomName = flag.name
        const visual = new RoomVisual(flag.room.name)

        const CONTROLLER_RESERVE_MANAGER_PROC_LABEL = `controller_reservation_manager_of_${controllerPos.roomName}`
        if (Kernel.getProcessByLabel(CONTROLLER_RESERVE_MANAGER_PROC_LABEL)) {
            visual.text(
                `Process to reserve controller at position ${JSON.stringify(controllerPos)} already exists.`,
                flag.pos
            )
            return
        }
        console.log(`DEBUG Creating process ${CONTROLLER_RESERVE_MANAGER_PROC_LABEL}`)
        try {

            const process = Kernel.scheduler.launchProcess(
                Kernel.availableProcessClasses.RoomReservationManager,
                CONTROLLER_RESERVE_MANAGER_PROC_LABEL
            )
            visual.text(`Launched process ${process.label}.`, flag.pos)
            process.controllerPositionProperties = controllerPos
            process.ownerRoomName = ownerRoomName
        }
        catch (ex) {
            console.log(`Failed to launch process ${CONTROLLER_RESERVE_MANAGER_PROC_LABEL} `
                + `due to: ${ex.stack}`)
        }
    }
}