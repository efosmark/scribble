import React, { useState, useEffect, useCallback } from 'react';

import { CELL_WIDTH, CELL_HEIGHT, NUM_ROWS, NUM_COLS } from '../constants';
import Cell from './Cell';
import useKeyInputHandler from '../useKeyInputHandler';
import { Cursor } from './Cursor';



const DEFAULT_CARRIAGE = 12;
const DEFAULT_ROW = 6;
const DEFAULT_COL = 12;

const DEFAULT_CURSOR = { col: DEFAULT_COL, row: DEFAULT_ROW, carriage: DEFAULT_CARRIAGE };

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
    setCell(cell: GridLocation, value: string): void;
}

export default ({ grid, setCell }: SvgPaperProps) => {
    const [cursor, setCursor] = useState<Cursor>(DEFAULT_CURSOR);
    const [selection, setSelection] = useState<SelectionRange>();
    const [inSelectionMode, setInSelectionMode] = useState<boolean>(false);
    const [hoveredCell, setHoveredCell] = useState<GridLocation>();

    useKeyInputHandler({ setCell, cursor, setCursor });

    const handleCellClick = useCallback((row: number, col: number) => {
        setCursor({ row, col, carriage: col });
    }, []);

    const handleCellHover = useCallback((row: number, col: number) => {
        setHoveredCell({ row, col });
    }, []);

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
            }
            return selection;
        });
    }, [hoveredCell, inSelectionMode]);

    useEffect(() => {
        if (!inSelectionMode && selection?.start && selection?.end)
            if (selection.start.row === selection.end.row && selection.start.col === selection.end.col) {
                setSelection({ start: null, end: null });
            }
    }, [selection, inSelectionMode]);


    const isCellSelected = useCallback((cell: GridLocation): boolean => {
        if (selection?.start && selection?.end) {
            const [start, end] = selection.start.row < selection.end.row
                ? [selection.start, selection.end]
                : [selection.end, selection.start];

            return (start.row <= cell.row && cell.row <= end.row)
                && (start.col <= cell.col && cell.col <= end.col);
        }
        return false;
    }, [selection]);

    return (
        <svg
            width={NUM_COLS * CELL_WIDTH}
            height={NUM_ROWS * CELL_HEIGHT}
            onPointerUp={handleCellPointerUp}
            onPointerDown={handleCellPointerDown}
        >
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
                            onCellClick={handleCellClick}
                            onCellHover={handleCellHover}
                        />
                    ))}
                </g>
            ))}
            {cursor.carriage > 0 && cursor.carriage !== DEFAULT_CARRIAGE && <CarriageIndicator carriage={cursor.carriage} />}
            <PinkVLine />
            <Cursor row={cursor.row} col={cursor.col} />
        </svg>
    );
};
