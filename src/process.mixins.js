import generalUtils from "util.general"

module.exports = {
    LevelTransitioningProcess: Base => class extends Base {
        get lastLevel() {
            if (!this.data.lastLevel) {
                this.data.lastLevel = 0
            }
            return this.data.lastLevel
        }

        set lastLevel(level) {
            this.data.lastLevel = level
        }

    },
    ActivityDirector: Base => class extends this.LevelTransitioningProcess(Base) {
        set ownerRoomName(name) {
            this.data.ownerRoomName = name
        }

        get ownerRoomName() {
            return this.data.ownerRoomName
        }

        get ownerRoom() {
            return Game.rooms[this.ownerRoomName]
        }

        getRoleProcessesLabels(role) {
            if (!this.data.roleProcessesLabels) {
                this.data.roleProcessesLabels = {}
            }

            if (!this.data.roleProcessesLabels[role]) {
                this.data.roleProcessesLabels[role] = []
            }

            return this.data.roleProcessesLabels[role]
        }

        getRoleCount(role) {
            if (!this.data.roleCounters) {
                this.data.roleCounters = {}
            }

            if (!this.data.roleCounters[role]) {
                this.data.roleCounters[role] = 0
            }

            return this.data.roleCounters[role]
        }

        incrementRoleCount(role) {
            if (!this.data.roleCounters) {
                this.data.roleCounters = {}
            }

            if (!this.data.roleCounters[role]) {
                this.data.roleCounters[role] = 0
            }

            this.data.roleCounters[role] += 1
        }

        resolveLevelForRole(role, currentLevel) {
            if (this.lastLevel < currentLevel) {
                console.log(`Next ${role} order placed by ${this.label} will be at new level ${currentLevel}.`)
                // no creep shall be made, a new age has arrived
                this.getRoleProcessesLabels(role).forEach(
                    procLabel => Kernel.getProcessByLabel(procLabel).dieAfterCreep()
                )
            }
        }

        resolveRoleProcessesQuantity(role,
                                     reqNumber,
                                     bodyType,
                                     priority,
                                     initialTaskTicket,
                                     targetId,
                                     currentLevel) {

            while (this.getRoleProcessesLabels(role).length < reqNumber) {
                const label = `${role}_creep_manager_${this.getRoleCount(role)}_of_${targetId}`
                    + `_from_${this.ownerRoomName}`
                try {
                    const process = Kernel.scheduler.launchProcess(
                        Kernel.availableProcessClasses.CreepManager,
                        label,
                        this.pid
                    )
                    process.creepName = `${generalUtils.capitalize(role)}${this.getRoleCount(role)}Of${targetId}`
                        + `From${this.ownerRoomName}`
                    process.creepType = bodyType
                    process.ownerRoomName = this.ownerRoomName
                    process.spawningPriority = priority
                    process.initialTaskTicketQueue = initialTaskTicketQueue
                    this.incrementRoleCount(role)
                    this.getRoleProcessesLabels(role).push(process.label)
                    this.lastLevel = currentLevel
                }
                catch (e) {
                    console.log(`Failed to lunch harvester process due to: ${e.stack}`)
                }
            }
        }
    }
}