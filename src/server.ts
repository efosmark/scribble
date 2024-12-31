import WebSocket, { WebSocketServer } from "ws";
import { PORT_SOCKET_SERVER } from './constants';
import { Action, CellsChangedAction, ConnectedAction, DisconnectedAction, ClearAllAction } from './action';
import { Client } from "./client";
import { Grid2D } from "./grid";


export class SharedNoteManager {
    server: WebSocketServer;
    clients: Map<WebSocket, Client>
    cells: Grid2D<string>

    constructor() {
        this.clients = new Map();
        this.cells = new Grid2D<string>();
        this.server = new WebSocketServer({ port: PORT_SOCKET_SERVER });
        this.server.on('connection', (s: WebSocket) => this.onConnect(s));
    }

    onConnect(socket: WebSocket) {
        const client = new Client(this, socket);
        this.clients.set(socket, client);
        const allCells = this.cells.allCells().map(cell => cell.value);
        if (allCells.length > 0) {
            console.log('allCells', allCells);
            client.send(new CellsChangedAction(this.cells.allCells().map(c => ({ row: c.row, col: c.col, value: c?.value, author: c.author }))));
        }
        this.broadcast(new ConnectedAction(client.ident), client.ident);
    }

    onClientClose(clientSocket: WebSocket) {
        const ident = this.clients.get(clientSocket)?.ident ?? -1;
        this.clients.delete(clientSocket);
        this.broadcast(new DisconnectedAction(ident), ident);
    }

    setCells(cells: Cell<string>[], fromIdent: number) {
        console.log('setCells', cells);
        for (let cell of cells)
            this.cells.set({ ...cell, author: fromIdent });
        this.broadcast(new CellsChangedAction(cells.map(cell => ({ ...cell, author: fromIdent }))), undefined)
    }

    clearAll() {
        this.broadcast(new ClearAllAction(), undefined)
        this.cells = new Grid2D();
    }

    broadcast(packet: Action, fromIdent: number | undefined) {
        console.log('-->', packet);
        for (let [socket, client] of this.clients.entries()) {
            if (client.ident !== fromIdent)
                client.send(packet);
        }
    }
}

const wb = new SharedNoteManager()