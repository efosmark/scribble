import React, { useState, useEffect, useRef } from 'react';
import HeadManager from './HeadManager';
import { DEFAULT_CARRIAGE, NUM_COLS, NUM_ROWS, PORT_SOCKET_SERVER } from '../../constants';
import { CellsChangedAction } from '../../action';
import SvgPaper from './SvgPaper';
import { applyGridChanges, getGridChanges, Grid2D, initializeGrid } from '../../grid';
import { useKeyboardInput } from '../useKeyboardInput';
import { useSocketConnection } from '../useSocketConn';

const SOCKET_SERVER = `ws://${window.location.hostname}:${PORT_SOCKET_SERVER}`;

const App: React.FC = () => {
    const [grid, setGrid] = useState<Grid2D<string>>(initializeGrid<string>(NUM_ROWS, NUM_COLS));
    const [selection, setSelection] = useState<Grid2D>(new Grid2D());
    const [carriage, setCarriage] = useState<number>(DEFAULT_CARRIAGE);
    const [hoveredCell, setHoveredCell] = useState<Cell<string>>();

    const { sendAction } = useSocketConnection(SOCKET_SERVER, {
        onCellsChanged: (action) => {
            setGrid(g => applyGridChanges(g, action.cells))
        },
        onClearGrid: () => {
            setGrid(g => initializeGrid<string>(NUM_ROWS, NUM_COLS))
        }
    });

    const prevGridRef = useRef<Grid2D<string>>();
    useEffect(() => {
        const prevGrid = prevGridRef.current;
        prevGridRef.current = grid;
        if (prevGrid !== undefined) {
            const cells = getGridChanges(prevGrid, grid).filter(cell => cell.author === undefined);
            const changes = new CellsChangedAction(cells);
            if (changes.cells.length > 0) {
                sendAction(changes);
            }
        }
    }, [grid]);

    const handleClearAll = () => {
        setGrid(g => initializeGrid<string>(NUM_ROWS, NUM_COLS));
        //sendMessage(JSON.stringify({ t: ACTION_CLEAR_ALL }));
    }

    useKeyboardInput({ carriage, selection, setGrid, setSelection });

    const downloadSVG = () => {

    };

    return (
        <div>
            <HeadManager title="Scribble" description="Write something" />
            <p>{hoveredCell?.author ?? '--'}</p>
            <SvgPaper {...{ grid, setGrid, selection, setSelection, carriage, setCarriage, hoveredCell, setHoveredCell }} />
            <ul className="options">
                <li><a className="link" onClick={handleClearAll}>clear screen</a></li>
                <li><a className="link" onClick={downloadSVG}>save</a></li>
            </ul>
        </div>
    );
};

export default App;
