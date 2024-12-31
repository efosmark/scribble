import WebSocket from "ws";
import { Action, ACTION_CELL_CHANGED, ACTION_CLEAR_ALL, CellsChangedAction } from './action';
import { SharedNoteManager } from "./server";

function obfuscatedId(input: number) {
    const prime = 9949;
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
        const action = JSON.parse(message);
        console.log('<--', action);
        switch (action.type) {
            case ACTION_CELL_CHANGED: {
                // TODO: this is fragile
                const changes = (action as CellsChangedAction);
                if (changes.cells.length > 0)
                    this.manager.setCells(changes.cells, this.ident);
                break;
            }
            case ACTION_CLEAR_ALL:
                this.manager.clearAll();
                break;

            default:
                console.error('ERROR', action);
                throw "Invalid packet format";
        }
    }
}
