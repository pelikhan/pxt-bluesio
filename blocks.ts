/**
 * blues.io notecard blocks
 */
//% icon="\uf0c8"
//% color="#1b3a52"
namespace notecard {
    let lastResponse: Response = undefined;

    /**
     * Logs a message to the hub
     */
    //% blockId=bluesio_hub_log
    //% block="hub log $msg"
    export function hubLog(msg: string) {
        console.log(msg)
        lastResponse = notecard.request(<LogRequest>{
            req: "hub.log",
            text: msg
        });
    }

    export class Field {
        constructor(
            public name: string,
            public value: any
        ) { }
    }

    /**
     * A field in a note message
     * @param name the field name to set
     * @param value the value to set.
     * @returns A new value that can be stored in flash storage using log data
     */
    //% block="$name = $value"
    //% value.shadow=math_number
    //% blockId=bluesio_note_field
    //% weight=10
    export function field(name: string, value: any): Field {
        return new Field(name, value);
    }

    /**
     * Adds a new note
     * @param data1 First column and value to be logged
     * @param data2 [optional] second column and value to be logged
     * @param data3 [optional] third column and value to be logged
     * @param data4 [optional] fourth column and value to be logged
     * @param data5 [optional] fifth column and value to be logged
     * @param data6 [optional] sixth column and value to be logged
     * @param data7 [optional] seventh column and value to be logged
     * @param data8 [optional] eighth column and value to be logged
     * @param data9 [optional] ninth column and value to be logged
     * @param data10 [optional] tenth column and value to be logged
     */
    //% block="note add $data1||$data2 $data3 $data4 $data5 $data6 $data7 $data8 $data9 $data10"
    //% blockId=bluesio_node_add
    //% data1.shadow=bluesio_note_field
    //% data2.shadow=bluesio_note_field
    //% data3.shadow=bluesio_note_field
    //% data4.shadow=bluesio_note_field
    //% data5.shadow=bluesio_note_field
    //% data6.shadow=bluesio_note_field
    //% data7.shadow=bluesio_note_field
    //% data8.shadow=bluesio_note_field
    //% data9.shadow=bluesio_note_field
    //% data10.shadow=bluesio_note_field
    //% inlineInputMode="variable"
    //% weight=100
    export function nodeAdd(
        data1: Field,
        data2?: Field,
        data3?: Field,
        data4?: Field,
        data5?: Field,
        data6?: Field,
        data7?: Field,
        data8?: Field,
        data9?: Field,
        data10?: Field
    ): void {
        const req: NoteAddRequest = {
            req: "note.add",
            body: {
            }
        }
        const a = [data1, data2, data3, data4, data5, data6, data7, data8, data9, data10]
        a.forEach((data: Field) => {
                if (data && data.name)
                    req.body[data.name] = data.value
            })
        lastResponse = notecard.request(req)
    }

}