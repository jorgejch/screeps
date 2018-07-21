const OSKernel = require("os.kernel")
const generalUtils = require("util.general")

module.exports.loop = function()  {
    console.log('Tick begin:',Game.time)
    generalUtils.clearDeadScreepsFromMemory()

    if (Game.cpu.bucket < 500) {
        throw "CPU Bucket too low. Halting."
    }
    global.Kernel = new OSKernel()
    Kernel.init()

    // add event manager process if non-existent
    Kernel.run()
    console.log('Tick end:',Game.time)
}
