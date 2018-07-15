import {Kernel} from "os.kernel"
import "process.hello_world"
export function loop() {
    if (Game.cpu.bucket < 500){
        throw "CPU Bucket too low. Halting."
    }
    const kernel = new Kernel()
    kernel.run()


}
