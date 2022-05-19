namespace bluesio {
    // https://dev.blues.io/guides-and-tutorials/notecard-guides/serial-over-i2c-protocol/
    export let ADDRESS = 0x17
    const CHUNK = 254
    function log(msg: string) {
        console.log(`notes> ` + msg)
    }
    function debug(msg: string) {
        // console.debug(`notes> ` + msg)
    }

    export interface Request {
        req: string
    }

    export interface Hub extends Request {
        req: "hub.status" | "hub.sync" | "hub.sync.status" | "hub.get"
    }

    export interface Log extends Request {
        req: "hub.log"
        text: string
    }

    export interface Note extends Request {
        req: "note.add"
        body: any
    }

    /**
     * Sends a request to the notecard over i2c
     */
    export function request(req: Request): Request {
        if (!req || !req.req) {
            log(`invalid request`)
            return undefined
        }

        // notes will reconstruct the JSON message until \n is found
        const str = JSON.stringify(req) + "\n"
        const buf = control.createBufferFromUTF8(str)

        log(`${str}`)

        // handshake
        const handshake = query()
        if (!handshake) return undefined
        
        // data write
        const error = transmit(buf)
        if (error) return undefined

        // data poll
        const res = receive()
        const rstr = res.toString()
        log(`< ${rstr}`)
        const r = JSON.parse(rstr) as Request
        pause(250)
        return r
    }

    function query() {
        // debug(`query`)
        const error = pins.i2cWriteBuffer(ADDRESS, control.createBuffer(2))
        if (error || error === undefined) {
            // debug(`query > ${error}`)
            return undefined
        }
        const sz = pins.i2cReadBuffer(ADDRESS, 2)
        // debug(`query > ${sz.toHex()}`)
        return sz
    }

    function receive(): Buffer {
        let sz = control.createBuffer(2)
        while (sz[0] == 0 && sz[1] == 0) {
            basic.pause(25)
            sz = query()
        }
        let res = control.createBuffer(0)
        while(sz[0] > 0) {
            // debug(`reading ${sz[0]} bytes`)
            const readReq = control.createBuffer(2)
            readReq[0] = 0
            readReq[1] = sz[0]
            pins.i2cWriteBuffer(ADDRESS, readReq)
            const buf = pins.i2cReadBuffer(ADDRESS, sz[0])
            res = res.concat(buf.slice(2))
            sz = buf.slice(0, 2)
        }
        return res
    }

    function transmit(buf: Buffer) {
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
        // debug(`write > ${error}`)
        return error
    }

    function send(buf: Buffer) {
        const sbuf = control.createBuffer(buf.length + 1)
        sbuf[0] = buf.length
        sbuf.write(1, buf)
        // debug(`send chunk ${sbuf.toHex()}`)
        const error = pins.i2cWriteBuffer(ADDRESS, sbuf)
        if (error === undefined) {
            log(`i2c not supported in simulator`);
            return -1;
        } else
            switch (error) {
                case 0:
                    break;
                case 1:
                    log("data too long to fit in transmit buffer");
                    break;
                case 2:
                    log("received NACK on transmit of address");
                    break;
                case 3:
                    log("received NACK on transmit of data");
                    break;
                case 4:
                    log("unknown error on TwoWire::endTransmission()");
                    break;
                case 5:
                    log("timeout");
                    break;
                default:
                    log(`unknown error encounter during I2C transmission ${error}`);
            }
        return error
    }
}