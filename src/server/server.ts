import WebSocket, { WebSocketServer } from "ws";
import { PORT_SOCKET_SERVER } from '../constants';
import { Action, CellsChangedAction, ConnectedAction, DisconnectedAction, ClearAllAction } from '../action';
import { ACTION_CELL_CHANGED, ACTION_CLEAR_ALL } from '../action';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

function obfuscatedId(input: number) {
    const prime = 9949;
    const mod = 900; // Modulo range
    return 100 + ((input * prime) % mod);
}

export class SharedNoteManager {
    server: WebSocketServer;
    connectionCount: number;
    sockets: Map<WebSocket, number>;
    db:Database | null = null;

    constructor() {
        this.connectionCount = 0;
        this.server = new WebSocketServer({ port: PORT_SOCKET_SERVER });
        this.server.on('connection', (s: WebSocket) => this.onConnect(s));

        this.sockets = new Map<WebSocket, number>();
        this.initDatabase();
    }

    async initDatabase() {
        this.db = await open({
            filename: './sharedsvg.db',
            driver: sqlite3.Database
        });

        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS Cells (
                row INTEGER NOT NULL,
                col INTEGER NOT NULL,
                value TEXT NOT NULL,
                author INTEGER NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (row, col)
            )
        `);
    }

    onConnect(socket: WebSocket) {

        socket.on('message', (message: string) => this.handleMessage(socket, message));
        socket.on('close', () => this.onClientClose(socket));

        const ident = obfuscatedId(this.connectionCount++);
        this.sockets.set(socket, ident);

        const allCells: Cell<string>[] = [];
        if (this.db) {
            this.db.all(`SELECT row, col, value, author, timestamp FROM Cells`).then(rows => {
                rows.forEach(row => {
                    allCells.push({
                        row: row.row, 
                        col: row.col,
                        value: row.value,
                        author: row.author, 
                        ts:row.timestamp
                    });
                });

                if (allCells.length > 0) {
                    this.sendTo(socket, new CellsChangedAction(allCells));
                }
            }).catch(err => {
                console.error("Error fetching cells from database:", err);
            });
        }

        this.broadcast(new ConnectedAction(ident), ident);
    }

    handleMessage(socket:WebSocket, message: string) {
        const ident = this.sockets.get(socket) ?? -1;
        const action = JSON.parse(message);
        console.log('<--', message);
        switch (action.t) {
            case ACTION_CELL_CHANGED: {
                // TODO: this is fragile
                const changes = (action as CellsChangedAction);
                if (changes.cells.length > 0) {
                    const cellsWithAttribution = changes.cells.map(cell => ({ ...cell, author: ident }));

                    this.setCells(changes.cells, ident);
                    this.broadcast(new CellsChangedAction(cellsWithAttribution), undefined);
                }
                break;
            }
            case ACTION_CLEAR_ALL:
                this.clearAll(ident);
                break;

            default:
                console.error('ERROR', action);
                throw "Invalid packet format";
        }
    }

    onClientClose(clientSocket: WebSocket) {
        const ident = this.sockets.get(clientSocket) ?? -1;
        this.sockets.delete(clientSocket);
        this.broadcast(new DisconnectedAction(ident), ident);
    }

    async setCells(cells: Cell<string>[], fromIdent: number) {
        const cellsWithAttribution = cells.map(cell => ({ ...cell, author: fromIdent }));

        if (this.db) {
            try {
                await this.db.exec('BEGIN TRANSACTION');

                const insertOrUpdateStmt = await this.db.prepare(`
                    INSERT OR REPLACE INTO Cells (row, col, value, author, timestamp)
                    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                `);
                for (const cell of cellsWithAttribution) {
                    await insertOrUpdateStmt.run(cell.row, cell.col, cell.value, cell.author);
                }
                await insertOrUpdateStmt.finalize();
                await this.db.exec('COMMIT');
            } catch (err) {
                console.error("Error during bulk insert or update:", err);
                await this.db.exec('ROLLBACK');
            }
        }

        this.broadcast(new CellsChangedAction(cellsWithAttribution), undefined);
    }

    async clearAll(fromIdent: number) {
        this.broadcast(new ClearAllAction(), fromIdent);

        // Clear all cells from the database
        if (this.db) {
            await this.db.exec(`DELETE FROM Cells`);
        }
    }

    broadcast(packet: Action, fromIdent: number | undefined) {
        console.log('-->', packet.toJSON());
        for (const [client, ident] of this.sockets) {
            if (ident !== fromIdent)
                this.sendTo(client, packet);
        }
    }

    sendTo(socket:WebSocket, data: Action) {
        socket.send(JSON.stringify(data), (err: Error | undefined) => {
            if (err) {
                console.error("Client cannot send message");
                console.error(err);
                this.onClientClose(socket);
            }
        });
    }
}

(new SharedNoteManager());