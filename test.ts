let counter = 0

input.onButtonPressed(Button.A, () => {
    led.toggle(0, 0)
    bluesio.request(<bluesio.LogRequest>{
        req: "hub.log",
        text: "makecode"
    })
    bluesio.request(<bluesio.HubRequest>{
        req: "hub.get"
    })
    bluesio.request(<bluesio.HubRequest>{
        req: "hub.sync"
    })
})

input.onButtonPressed(Button.B, () => {
    led.toggle(1, 0)
    bluesio.request(<bluesio.NoteRequest>{
        req: "note.add",
        body: {
            t: input.temperature(),
            c: counter++
        }
    })
})
