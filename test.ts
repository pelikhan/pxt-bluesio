let counter = 0

input.onButtonPressed(Button.A, () => {
    led.toggle(0, 0)
    notecard.request(<notecard.LogRequest>{
        req: "hub.log",
        text: "makecode"
    })
    notecard.request(<notecard.HubRequest>{
        req: "hub.get"
    })
    notecard.request(<notecard.HubRequest>{
        req: "hub.sync"
    })
})

input.onButtonPressed(Button.B, () => {
    led.toggle(1, 0)
    notecard.request(<notecard.NoteRequest>{
        req: "note.add",
        body: {
            t: input.temperature(),
            c: counter++
        }
    })
})
