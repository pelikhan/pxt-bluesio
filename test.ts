let counter = 0

input.onButtonPressed(Button.A, () => {
    led.toggle(0, 0)
    bluesio.request(<bluesio.Log>{
        req: "hub.log",
        text: "makecode"
    })
    bluesio.request(<bluesio.Hub>{
        req: "hub.get"
    })
    bluesio.request(<bluesio.Hub>{
        req: "hub.sync"
    })
})

input.onButtonPressed(Button.B, () => {
    led.toggle(1, 0)
    bluesio.request(<bluesio.Note>{
        req: "note.add",
        body: {
            t: input.temperature(),
            c: counter++
        }
    })
})
