import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { CELL_WIDTH, CELL_HEIGHT, NUM_ROWS, NUM_COLS } from '../../constants';
import Cell from './Cell';
import useKeyInputHandler from '../useKeyInputHandler';
import { Cursor } from './Cursor';



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

interface SvgPaperProps {
    grid: GridType;
    ref: any;
    setCell(cell: GridLocation, value: string): void;
}

export default React.forwardRef<SVGSVGElement, SvgPaperProps>(({ grid, setCell }, ref) => {
    //const [cursor, setCursor] = useState<Cursor>(DEFAULT_CURSOR);
    const [carriage, setCarriage] = useState<number>(DEFAULT_CARRIAGE);

    const [selection, setSelection] = useState<SelectionRange>({ start: null, end: null });
    const [inSelectionMode, setInSelectionMode] = useState<boolean>(false);
    const [hoveredCell, setHoveredCell] = useState<GridLocation>();

    const selectedCells = useMemo((): GridLocation[] => {
        if (!selection || !selection.start || !selection.end)
            return [];

        const { start, end } = selection;
        const [startRow, endRow] = [Math.min(start.row, end.row), Math.max(start.row, end.row)];
        const [startCol, endCol] = [Math.min(start.col, end.col), Math.max(start.col, end.col)];

        const rows = Array.from({ length: endRow - startRow + 1 }, (_, r: number) => startRow + r);
        const cols = Array.from({ length: endCol - startCol + 1 }, (_, c: number) => startCol + c);
        return rows.map(row => cols.map(col => ({ row, col }))).flat();
    }, [selection]);

    useKeyInputHandler({ selectedCells, setCell, selection, setSelection });

    const handleCellPointerUp = useCallback(() => {
        setInSelectionMode(false);
        setSelection((selection) => {
            if (selection !== undefined && selection?.start !== undefined) {
                return {
                    start: selection.start,
                    end: hoveredCell ?? null
                };
            }
            return selection;
        })
    }, [hoveredCell]);

    const handleCellPointerDown = useCallback(() => {
        if (!hoveredCell) return;
        setInSelectionMode(true);
        setSelection({ start: hoveredCell, end: null });
    }, [hoveredCell]);

    useEffect(() => {
        setSelection(selection => {
            if (inSelectionMode && selection?.start) {
                return { start: selection?.start, end: hoveredCell ?? null };
            } else if (!inSelectionMode && selection?.start && selection?.end) {
                return { start: null, end: null };
            }
            return selection;
        });
    }, [hoveredCell, inSelectionMode]);

    const isCellSelected = useCallback((cell: GridLocation): boolean => {
        // TODO: make this a Map<> instead, so this can be O(1)
        return selectedCells.find(c => c.row === cell.row && c.col === cell.col) !== undefined;
    }, [selectedCells]);


    const onCellClicked = useCallback((cell: GridLocation) => {
        setSelection({ start: { ...cell }, end: { ...cell } });
        setCarriage(cell.col);
    }, []);

    return (
        <svg
            ref={ref}
            width={NUM_COLS * CELL_WIDTH}
            height={NUM_ROWS * CELL_HEIGHT}
            onPointerUp={handleCellPointerUp}
            onPointerDown={handleCellPointerDown}
        >
            <style>
                text {'{'}
                font-family: 'Courier New', Courier, monospace;
                color: black;
                fill:black;
                {'}'}
            </style>
            <rect width="100%" height="100%" fill="white" />
            {grid.map((row, y) => (
                <g transform={`translate(0, ${y * CELL_HEIGHT})`} key={y}>
                    {y > 4 && <BlueHLine />}
                    {row.map((value: string, x: number) => (
                        <Cell
                            key={`${x}-${y}`}
                            col={x}
                            row={y}
                            value={value}
                            cellWidth={CELL_WIDTH}
                            cellHeight={CELL_HEIGHT}
                            isSelected={isCellSelected({ row: y, col: x })}
                            onCellClick={onCellClicked}
                            onCellHover={setHoveredCell}
                        />
                    ))}
                </g>
            ))}
            {carriage > 0 && carriage !== DEFAULT_CARRIAGE && <CarriageIndicator carriage={carriage} />}
            <PinkVLine />
            {/* <Cursor row={cursor.row} col={cursor.col} /> */}
        </svg>
    );
});
