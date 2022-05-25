namespace bluesio {
    /**
     * Logs a message to the hub
     */
    //% blockId=bluesio_hub_log
    //% block="hub log $msg"
    export function log(msg: string) {
        console.log(msg)
        bluesio.request(<LogRequest>{
            req: "hub.log",
            text: msg
        })
    }
}