const generalUtils = require("util.general")


module.exports = {
    ActivityDirectorProcess: Base => class extends Base {
        /* Required */

        // responsibility for spawning is always the owner room's
        set ownerRoomName(name) {
            this.data.ownerRoomName = name
        }

        set targetRoomName(name) {
            this.data.targetRoomName = name
        }

        /* End Required */

        get ownerRoomName() {
            return this.data.ownerRoomName
        }

        get ownerRoom() {
            return Game.rooms[this.ownerRoomName]
        }

        get targetRoomName() {
            return this.data.targetRoomName
        }

        get targetRoom() {
            return Game.rooms[this.targetRoomName]
        }

        _getRoleLastLevel(role) {
            if (!this.data.lastLevel) {
                this.data.lastLevel = {}
            }

            if (!this.data.lastLevel[role]) {
                this.data.lastLevel[role] = 0
            }

            return this.data.lastLevel[role]
        }

        _setRoleLastLevel(level, role) {
            if (!this.data.lastLevel) {
                this.data.lastLevel = {}
            }

            this.data.lastLevel[role] = level
        }

        _getTickRoleLastOrderPlaced(role) {
            if (!this.data.tickLastOrderPlaced) {
                this.data.tickLastOrderPlaced = {}
            }

            if (!this.data.tickLastOrderPlaced[role]) {
                this.data.tickLastOrderPlaced[role] = 0
            }
            return this.data.tickLastOrderPlaced
        }

        _setTickRoleLastOrderPlaced(tick, role) {
            if (!this.data.tickLastOrderPlaced) {
                this.data.tickLastOrderPlaced = {}
            }
            return this.data.tickLastOrderPlaced[role] = tick
        }

        _getRoleProcessesLabels(role) {
            if (!this.data.roleProcessesLabels) {
                this.data.roleProcessesLabels = {}
            }

            if (!this.data.roleProcessesLabels[role]) {
                this.data.roleProcessesLabels[role] = []
            }

            return this.data.roleProcessesLabels[role]
        }

        _setRoleProcessesLabels(role, labels) {
            if (!this.data.roleProcessesLabels) {
                this.data.roleProcessesLabels = {}
            }
            this.data.roleProcessesLabels[role] = labels
        }


        _getRoleCount(role) {
            if (!this.data.roleCounters) {
                this.data.roleCounters = {}
            }

            if (!this.data.roleCounters[role]) {
                this.data.roleCounters[role] = 0
            }

            return this.data.roleCounters[role]
        }

        _incrementRoleCount(role) {
            if (!this.data.roleCounters) {
                this.data.roleCounters = {}
            }

            if (!this.data.roleCounters[role]) {
                this.data.roleCounters[role] = 0
            }

            this.data.roleCounters[role] += 1
        }

        cleanRoleDeadProcesses(role) {
            // filter out dead processes
            const roleProcesses = this._getRoleProcessesLabels(role)
            this._setRoleProcessesLabels(role, roleProcesses.filter(label => Kernel.getProcessByLabel(label)))
        }

        die() {
            // TODO: make childs die
            super.die()
        }

        setAllRoleProcessesToDieAfterCreep(role) {
            this._getRoleProcessesLabels(role).forEach(
                procLabel => Kernel.getProcessByLabel(procLabel).dieAfterCreep = true
            )
        }

        resolveLevelForRole(role, currentLevel) {
            if (this._getRoleLastLevel(role) < currentLevel) {
                console.log(`Next ${role} order placed by ${this.label} will be at new level ${currentLevel}.`)
                // a new age has arrived, old processes produced their last creeps
                this.setAllRoleProcessesToDieAfterCreep(role)
            }
        }

        resolveRoleProcessesQuantity(role,
                                     reqNumber,
                                     bodyType,
                                     priority,
                                     initialTaskTicketQueue,
                                     targetdesc,
                                     currentLevel,
                                     spacing = null) {
            if (this._getRoleProcessesLabels(role).length < reqNumber) {
                if (spacing) {
                    const lastTickOrderPlaced = this._getTickRoleLastOrderPlaced(role)
                    const nextOrderAllowedTick = lastTickOrderPlaced + spacing + 1

                    if (Game.time < nextOrderAllowedTick) {
                        console.log(`Process ${this.label} needs to wait ${nextOrderAllowedTick - Game.time} ticks till`
                            + ` it can place another order for ${role}. Spacing is set to ${spacing}.`)
                        return
                    }
                }

                const label = `${role}_creep_manager_${this._getRoleCount(role)}_of_${targetdesc}`
                    + `_from_${this.ownerRoomName}`
                try {
                    const process = Kernel.scheduler.launchProcess(
                        Kernel.availableProcessClasses.CreepManager,
                        label,
                        this.pid
                    )
                    process.creepName = `${generalUtils.capitalize(role)}${this._getRoleCount(role)}Of${targetdesc}`
                        + `From${this.ownerRoomName}`
                    process.creepType = bodyType
                    process.ownerRoomName = this.ownerRoomName
                    process.spawningPriority = priority
                    process.initialTaskTicketQueue = initialTaskTicketQueue
                    this._incrementRoleCount(role)
                    this._getRoleProcessesLabels(role).push(process.label)
                    this._setRoleLastLevel(currentLevel, role)
                    this._setTickRoleLastOrderPlaced(Game.time, role)
                }
                catch (e) {
                    console.log(`Failed to lunch ${role} process due to: ${e.stack}.`)
                }
            }
            else if (this._getRoleProcessesLabels(role).length > reqNumber) {
               this.setAllRoleProcessesToDieAfterCreep(role)
            }
        }
    }
}