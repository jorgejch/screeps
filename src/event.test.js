export function sayHelloWorld(flag){
    const visual = new RoomVisual(flag.roomName)
    visual.text(`Hello world!`, flag.pos)
}