import WebSocket, { WebSocketServer } from "ws";
import { PORT_SOCKET_SERVER } from './constants';
import { ACTION_SET_CELL, ACTION_CLIENT_CONN, ACTION_CLIENT_CLOSE, Action } from './action';
import { Client } from "./client";


export class SharedNoteManager {

    server: WebSocketServer;
    clients: Map<WebSocket, Client>
    cells: Map<number, Map<number, string>>

    constructor() {
        this.clients = new Map();
        this.cells = new Map();
        this.server = new WebSocketServer({ port: PORT_SOCKET_SERVER });
        this.server.on('connection', (s: WebSocket) => this.onConnect(s));
    }

    onConnect(socket: WebSocket) {
        const client = new Client(this, socket);
        this.clients.set(socket, client);
        for (let [y, row] of this.cells.entries()) {
            for (let [x, key] of row) {
                socket.send(JSON.stringify(new Action(ACTION_SET_CELL, { x, y, key })));
            }
        }
        this.broadcast(new Action(ACTION_CLIENT_CONN, client.ident), client.ident);
    }

    onClientClose(clientSocket: WebSocket) {
        const ident = this.clients.get(clientSocket)?.ident;
        this.clients.delete(clientSocket);
        this.broadcast(new Action(ACTION_CLIENT_CLOSE, ident?.toString()), ident);
    }

    setCell(x: number, y: number, key: string) {
        if (!this.cells.has(y)) {
            this.cells.set(y, new Map())
        }
        this.cells.get(y)?.set(x, key);
        this.broadcast(new Action(ACTION_SET_CELL, { x, y, key }), undefined)
    }

    broadcast(packet: Action, fromIdent: number | undefined) {
        for (let [socket, client] of this.clients.entries()) {
            client.send(packet);
        }
    }
}


const wb = new SharedNoteManager()