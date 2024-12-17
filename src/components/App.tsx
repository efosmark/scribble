import React, { useState, useMemo, MouseEventHandler, useEffect, useCallback, useRef } from 'react';
import HeadManager from './HeadManager';

import { NUM_COLS, NUM_ROWS, PORT_SOCKET_SERVER } from '../constants';
import { ACTION_CLEAR_ALL, ACTION_SET_CELL } from '../action';
import { useGrid } from '../useGrid';
import SvgPaper from './SvgPaper';

const SOCKET_SERVER = `ws://${window.location.hostname}:${PORT_SOCKET_SERVER}`;


const App: React.FC = () => {
    const [grid, setCell] = useGrid(NUM_ROWS, NUM_COLS);

    const handleMessage = useCallback((message: string) => {
        const { t: actionType, c: content } = JSON.parse(message);
        if (actionType === ACTION_SET_CELL) {
            const { x, y, key } = content;
            setTimeout(() => setCell({ col: Number(x), row: Number(y) }, key), 0);
        }
    }, []);

    const connection = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(SOCKET_SERVER);
        socket.addEventListener("open", () => {
            console.log("WebSocket connected.");
        });
        socket.addEventListener("message", (event) => handleMessage(event.data));
        connection.current = socket;
        return () => {
            socket.close();
            console.log("WebSocket disconnected.");
        };
    }, []);

    const setGridCell = useCallback((cell: GridLocation, value: string) => {
        setCell(cell, value);
        sendMessage(JSON.stringify({ t: ACTION_SET_CELL, c: { x: cell.col, y: cell.row, key: value } }))
    }, [grid]);

    const sendMessage = (m: string) => connection.current?.send(m);

    const handleClearAll = () => {
        sendMessage(JSON.stringify({ t: ACTION_CLEAR_ALL }));
    }
    return (
        <div>
            <HeadManager title="Scribble" description="Write something" />
            <SvgPaper {...{ grid, setCell: setGridCell }} />
            <div className="options">
                <a className="link" onClick={handleClearAll}>clear screen</a>
            </div>
        </div>
    );
};

export default App;
