import {CreepRoleInInventory} from "verifications"
import {AddOrderForNecessaryAmountOfCreeps} from "rectifications"

class Rule{
    constructor(verification, rectification){
        this.verification = verification
        this.rectification = rectification
    }
    process(roomConfig){
        if (!this.verification.verify(roomConfig)) {
            this.rectification.rectify(roomConfig)
        }

    }
}
export class CreepRoleQuantityInRoom extends Rule{
    constructor(role, type, reqNum, priority, newCreepParams){
        super(
            new CreepRoleInInventory(type, reqNum),
            new AddOrderForNecessaryAmountOfCreeps(reqNum, role, type, newCreepParams, priority)
        )
    }
}