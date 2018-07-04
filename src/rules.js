import {CreepTypeInInventory} from "verifications"
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
export class CreepTypeQuantityInRoom extends Rule{
    constructor(type, reqNum, priority, newCreepParams){
        super(
            new CreepTypeInInventory(type, reqNum),
            new AddOrderForNecessaryAmountOfCreeps(reqNum, type, newCreepParams, priority)
        )
    }
}