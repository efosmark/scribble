import React, { useState, useMemo, MouseEventHandler, useEffect, useCallback, useRef } from 'react';
import HeadManager from './HeadManager';

import { PORT_SOCKET_SERVER, CELL_WIDTH, CELL_HEIGHT } from '../constants';
import { ACTION_SET_CELL } from '../action';
import Cell from './Cell';
import { useGrid } from '../useGrid';
import { Cursor } from './Cursor';

const SOCKET_SERVER = `ws://${window.location.hostname}:${PORT_SOCKET_SERVER}`;

const NUM_ROWS = 40;
const NUM_COLS = 80;
const DEFAULT_CARRIAGE = 12;
const DEFAULT_ROW = 6;
const DEFAULT_COL = 12;

const PinkVLine = ({ }) => (
    <line
        x1={DEFAULT_CARRIAGE * CELL_WIDTH}
        y1={0}
        x2={DEFAULT_CARRIAGE * CELL_WIDTH}
        y2={NUM_ROWS * CELL_HEIGHT}
        stroke='rgba(255,0,255,0.2)'
        strokeWidth={2}
    />
);

const CarriageIndicator = ({ carriage }: { carriage: number }) => (
    <line
        x1={carriage * CELL_WIDTH}
        y1={0}
        x2={carriage * CELL_WIDTH}
        y2={NUM_ROWS * CELL_HEIGHT}
        stroke='rgba(0,0,0,0.2)'
        strokeWidth={1}
        strokeDasharray="1, 2"
    />
);

const BlueHLine = () => (
    <line
        x1={0}
        x2={CELL_WIDTH * NUM_COLS}
        y1={CELL_HEIGHT}
        y2={CELL_HEIGHT}
        stroke='rgba(0,0,255,0.2)'
        strokeWidth={1}
    />
);

const App: React.FC = () => {
    const [cursor, setCursor] = useState({ x: DEFAULT_COL, y: DEFAULT_ROW, carriage: DEFAULT_CARRIAGE });
    const [grid, setCell] = useGrid(NUM_ROWS, NUM_COLS);

    const handleMessage = useCallback((message: string) => {
        const { t: actionType, c: content } = JSON.parse(message);
        if (actionType === ACTION_SET_CELL) {
            const { x, y, key } = content;
            setTimeout(() => setCell(Number(x), Number(y), key), 0);
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

    const sendMessage = (m: string) => connection.current?.send(m);

    const handleCellClick = useCallback((x: number, y: number) => {
        setCursor({ x, y, carriage: x });
    }, []);

    const selectedRef = useRef(cursor);
    useEffect(() => {
        selectedRef.current = cursor;
    }, [cursor]);

    const onBackspace = () => {
        const { x, y, carriage } = selectedRef.current;
        if (x > 0) {
            setCursor({ x: x - 1, y, carriage });
            setCell(x - 1, y, '');
        }
    }

    const onEnter = () => {
        const { x, y, carriage } = selectedRef.current;
        if (y < NUM_ROWS) {
            setCursor({ x: carriage, y: y + 1, carriage });
        }
    }

    const onDelete = () => {
        const { x, y } = selectedRef.current;
        setCell(x, y, '');
    }

    const onMove = (key: string) => {
        const { x, y } = selectedRef.current;
        if (key === 'ArrowRight') {
            const newX = (x + 1) % NUM_COLS;
            const newY = newX === 0 ? (y + 1) % NUM_ROWS : y;
            setCursor({ x: newX, y: newY, carriage: newX });
        } else if (key === 'ArrowLeft') {
            if (x > 0) setCursor({ x: x - 1, y, carriage: x - 1 });
            else if (y > 0) setCursor({ x: 0, y: y - 1, carriage: x });
        } else if (key === 'ArrowDown') {
            if (y < NUM_ROWS) setCursor({ x, y: y + 1, carriage: x });
        } else if (key === 'ArrowUp') {
            if (y > 0) setCursor({ x, y: y - 1, carriage: x });
        }
    }

    const onKeyDown = (key: string) => {
        const { x, y, carriage } = selectedRef.current;
        const newX = (x + 1) % NUM_COLS;
        const newY = newX === 0 ? (y + 1) % NUM_ROWS : y;
        setCursor({ x: newX, y: newY, carriage });

        const action = { t: ACTION_SET_CELL, c: { x, y, key } };
        sendMessage(JSON.stringify(action));
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.length === 1) {
                onKeyDown(e.key);
            } else if (e.key === 'Backspace') {
                onBackspace();
            } else if (e.key === 'Enter') {
                onEnter();
            } else if (e.key === 'Delete') {
                onDelete();
            } else if (e.key.indexOf('Arrow') === 0) {
                onMove(e.key);
            }
            e.preventDefault();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div>
            <HeadManager title="Scribble" description="Write something" />
            <svg width={NUM_COLS * CELL_WIDTH} height={NUM_ROWS * CELL_HEIGHT}>
                {grid.map((row, y) => (
                    <g transform={`translate(0, ${y * CELL_HEIGHT})`} key={y}>
                        {y > 4 && <BlueHLine />}
                        {row.map((value, x) => (
                            <Cell
                                key={`${x}-${y}`}
                                x={x}
                                y={y}
                                value={value}
                                cellWidth={CELL_WIDTH}
                                cellHeight={CELL_HEIGHT}
                                onCellClick={handleCellClick}
                            />
                        ))}
                    </g>
                ))}
                {cursor.carriage > 0 && cursor.carriage !== DEFAULT_CARRIAGE && <CarriageIndicator carriage={cursor.carriage} />}
                <PinkVLine />
                <Cursor row={cursor.y} col={cursor.x} />
            </svg>
        </div>
    );
};

export default App;
