import WebSocket from "ws";
import { ACTION_SET_CELL, Action, ACTION_CLEAR_ALL } from './action';
import { SharedNoteManager } from "./server";

function obfuscatedId(input: number) {
    const prime = 9949; // A prime number
    const mod = 900; // Modulo range
    return 100 + ((input * prime) % mod);
}

export class Client {
    static _clientCount: number = 0;

    manager: SharedNoteManager;
    socket: WebSocket;
    ident: number;

    constructor(manager: SharedNoteManager, socket: WebSocket) {
        this.manager = manager;
        this.socket = socket;
        socket.on('message', (message: string) => this.handleMessage(message));
        socket.on('close', () => manager.onClientClose(socket));

        Client._clientCount++;
        this.ident = obfuscatedId(Client._clientCount);
    }

    send(data: Action) {
        this.socket.send(JSON.stringify(data), (err: Error | undefined) => {
            if (err) {
                console.error("Client cannot send message");
                console.error(err);
            }
            // TODO: remove the client from the mgr
        });
    }

    disconnect() {
        this.socket.close();
    }

    handleMessage(message: string) {
        const { t: packetType, c: content } = JSON.parse(message);
        console.log(packetType, content);
        switch (packetType) {
            case ACTION_SET_CELL: {
                const { x, y, key } = content;
                this.manager.setCell(x, y, key)
                break;
            }
            case ACTION_CLEAR_ALL:
                this.manager.clearAll();
                break;

            default:
                console.error('ERROR', packetType, content);
                throw "Invalid packet format";
        }
    }
}
