namespace bluesio {
    // https://dev.blues.io/guides-and-tutorials/notecard-guides/serial-over-i2c-protocol/
    let ADDRESS = 0x17
    let CHUNK = 254

    export interface Request {
        req: string
    }

    export interface Hub extends Request {
        req: "hub.status" | "hub.sync" | "hub.sync.status"
    }

    export interface Log extends Request {
        req: "hub.log"
        text: string
    }

    export interface Note extends Request {
        req: "note.add"
        body: any
    }

    export function request(req: Request): Request {
        if (!req || !req.req) {
            console.log(`notes> invalid request`)
            return undefined
        }
        // handshake
        const handshake = query()
        if (!handshake) return undefined
        
        // data write
        const error = transmit(req)
        if (error) return undefined

        // data poll
        return receive()
    }

    function query() {
        console.log(`notes> query`)
        const error = pins.i2cWriteBuffer(ADDRESS, control.createBuffer(2))
        if (error || error === undefined) {
            console.log(`notes> query > ${error}`)
            return undefined
        }
        const sz = pins.i2cReadBuffer(ADDRESS, 2)
        console.log(`notes> query > ${sz.toHex()}`)
        return sz
    }

    function receive(): Request {
        let retry = 5
        let sz = control.createBuffer(2)
        while (retry-- > 0 && sz[0] == 0 && sz[1] == 0) {
            basic.pause(25)
            sz = query()
        }
        if (retry <= 0) {
            console.log(`notes> receive timed out`)
            return undefined
        }

        let str = ""
        while(sz[0] > 0) {
            console.log(`notes> reading ${sz[0]} bytes`)
            const readReq = control.createBuffer(2)
            readReq[0] = 0
            readReq[1] = sz[0]
            pins.i2cWriteBuffer(ADDRESS, readReq)
            const buf = pins.i2cReadBuffer(ADDRESS, sz[0])
            const cstr = buf.toString()
            console.log(`notes> received '${cstr}'`)

            str += cstr
            sz = query()
        }
        const req = JSON.parse(str) as Request
        return req
    }

    function transmit(req: Request) {
        // notes will reconstruct the JSON message until \n is found
        const str = JSON.stringify(req) + "\n"
        console.log(`notes> write ${str}`)

        const buf = control.createBufferFromUTF8(str)
        let error = 0
        let index = 0
        while (index < buf.length) {
            const chunk = buf.slice(index, Math.min(CHUNK, buf.length - index))
            const error = send(chunk)
            if (error)
                break
            index += chunk.length
            pause(20)
        }
        console.log(`notes> write > ${error}`)
        return error
    }

    function send(buf: Buffer) {
        const sbuf = control.createBuffer(buf.length + 1)
        sbuf[0] = buf.length
        sbuf.write(1, buf)
        console.log(`notes> send chunk ${sbuf.toHex()}`)
        const error = pins.i2cWriteBuffer(ADDRESS, sbuf)
        if (error === undefined) {
            console.log(`notes> i2c not supported in simulator`);
            return -1;
        } else
            switch (error) {
                case 0:
                    break;
                case 1:
                    console.log("notes> data too long to fit in transmit buffer");
                    break;
                case 2:
                    console.log("notes> received NACK on transmit of address");
                    break;
                case 3:
                    console.log("notes> received NACK on transmit of data");
                    break;
                case 4:
                    console.log("notes> unknown error on TwoWire::endTransmission()");
                    break;
                case 5:
                    console.log("notes> timeout");
                    break;
                default:
                    console.log(`notes> unknown error encounter during I2C transmission ${error}`);
            }
        return error
    }
}