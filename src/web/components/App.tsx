import React, { useState, useEffect, useRef } from 'react';
import HeadManager from './HeadManager';
import { DEFAULT_CARRIAGE, NUM_COLS, NUM_ROWS, PORT_SOCKET_SERVER } from '../../constants';
import { CellsChangedAction, ClearAllAction } from '../../action';
import SvgPaper from './SvgView';
import { Grid2D, initializeGrid } from '../../grid';
import { useKeyboardInput } from '../useKeyboardInput';
import { useSocketConnection } from '../useSocketConn';

const SOCKET_SERVER = `ws://${window.location.hostname}:${PORT_SOCKET_SERVER}`;

const App: React.FC = () => {
    const [grid, setGrid] = useState<Grid2D<string>>(initializeGrid<string>(NUM_ROWS, NUM_COLS));
    const [selection, setSelection] = useState<Grid2D>(new Grid2D());
    const [carriage, setCarriage] = useState<number>(DEFAULT_CARRIAGE);
    const [hoveredCell, setHoveredCell] = useState<Cell<string>>();

    const { isConnected, sendAction } = useSocketConnection(SOCKET_SERVER, {
        onCellsChanged: (action) => {
            const changeset = new Grid2D<string>(action.cells);
            setGrid(g => g.union(changeset));
        },
        onClearGrid: () => {
            setGrid(initializeGrid<string>(NUM_ROWS, NUM_COLS))
        }
    });

    const prevGridRef = useRef<Grid2D<string>>();
    useEffect(() => {
        if (!isConnected) return;
        const diff = (prevGridRef.current !== undefined) ? prevGridRef.current.difference(grid) : grid;
        const cells = diff.allCells().filter(cell => cell.author === undefined && cell.value !== undefined);
        const changes = new CellsChangedAction(cells);
        if (changes.cells.length > 0)
            sendAction(changes);
        prevGridRef.current = grid;
    }, [grid, sendAction, isConnected]);

    const onClearAllClicked = () => {
        sendAction(new ClearAllAction());
    }

    const constraints: SizeConstraints = {
        rowMax: NUM_ROWS,
        colMax: NUM_COLS
    };
    useKeyboardInput({ carriage, selection, setGrid, setSelection, constraints });

    const [downloader, setDownloader] = useState<(() => void) | null>(null);
    const downloadSVG = () => {
        if (downloader) downloader();
    };

    return (
        <div>
            <HeadManager title="Scribble" description="Write something" />
            <SvgPaper {...{
                grid, setGrid,
                selection, setSelection,
                carriage, setCarriage,
                hoveredCell, setHoveredCell,
                setDownloader
            }} />
            <ul className="options">
                <li className="title">Options</li>
                <li><a className="link" onClick={onClearAllClicked}>clear all</a></li>
                <li><a className="link" onClick={downloadSVG}>save file</a></li>
            </ul>
            <p>{hoveredCell?.author ?? '--'}</p>
        </div>
    );
};

export default App;
