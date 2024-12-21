import React, { useState, useMemo, MouseEventHandler, useEffect, useCallback, useRef } from 'react';
import HeadManager from './HeadManager';

import { NUM_COLS, NUM_ROWS, PORT_SOCKET_SERVER } from '../../constants';
import { ACTION_CLEAR_ALL, ACTION_SET_CELL } from '../../action';
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

    const svgRef = useRef(null);
    const downloadSVG = () => {
        // Access the SVG element as a string
        const svgElement = svgRef.current;
        if (!svgElement) {
            console.error('<svg> has no ref.');
            return;
        }

        const svgString = new XMLSerializer().serializeToString(svgElement);

        // Create a blob for the SVG content
        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });

        // Create a download link
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "downloaded-svg.svg";
        document.body.appendChild(link);

        // Trigger download
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    return (
        <div>
            <HeadManager title="Scribble" description="Write something" />
            <SvgPaper {...{ grid, setCell: setGridCell }} ref={svgRef} />
            <ul className="options">
                <li><a className="link" onClick={handleClearAll}>clear screen</a></li>
                <li><a className="link" onClick={downloadSVG}>save</a></li>
            </ul>
        </div>
    );
};

export default App;
