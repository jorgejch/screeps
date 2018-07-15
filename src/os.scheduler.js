export class Scheduler {
    constructor(processTable){
        this.processTable =  processTable
        this.orderedPids = null
    }
    init(){
        this.orderedPids = Object.keys(this.processTable).sort((a,b) =>  a.priority - b.priority )
    }
    nextProcessToRun(){
        return this.orderedPids.shift()
    }
}