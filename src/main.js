export function loop() {

    if (Game.cpu.bucket < 500) {
        throw "CPU Bucket too low. Halting."
    }
    global.Kernel = new OSKernel()
    Kernel.init()

    // add event manager process if non-existent
    Kernel.run()
}
