const OSKernel = require("os.kernel")

module.exports.loop = function()  {
    console.log('Tick begin:',Game.time)
    console.log(`DEBUG at main loop begining`)

    if (Game.cpu.bucket < 500) {
        throw "CPU Bucket too low. Halting."
    }
    global.Kernel = new OSKernel()
    Kernel.init()

    console.log(`DEBUG after kernel init`)
    // add event manager process if non-existent
    Kernel.run()
    console.log(`DEBUG after kernel run`)
    console.log('Tick end:',Game.time)
}
