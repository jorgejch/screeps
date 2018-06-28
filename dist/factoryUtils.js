module.exports = {
    Order: class {
        constructor (type, num, creepParam, priority){
            this.type = type
            this.quantity = num
            this.creepParams = creepParams
            this.priority = priority
        }
    }
}