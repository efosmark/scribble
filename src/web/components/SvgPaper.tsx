import React, { useState, useEffect, useCallback, useMemo, MouseEvent, PointerEvent, useRef } from 'react';
import { CELL_WIDTH, CELL_HEIGHT, NUM_ROWS, NUM_COLS, DEFAULT_CARRIAGE } from '../../constants';
import { Grid2D, selectionFromRange } from '../../grid';
import { GridCell } from './GridCell';

const PinkVLine = () => (
    <line
        x1={DEFAULT_CARRIAGE * CELL_WIDTH}
        y1={0}
        x2={DEFAULT_CARRIAGE * CELL_WIDTH}
        y2={NUM_ROWS * CELL_HEIGHT}
        stroke='rgba(255,0,255,0.2)'
        strokeWidth={2}
    />
);

const BlueHLine = () => {
    return <line
        x1={0}
        x2={CELL_WIDTH * NUM_COLS}
        y1={CELL_HEIGHT}
        y2={CELL_HEIGHT}
        stroke='rgba(0,0,255,0.2)'
        strokeWidth={1}
    />;
};

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

interface SvgPaperProps {
    carriage: number;
    grid: Grid2D<string>;
    selection: Grid2D;
    setCarriage: React.Dispatch<React.SetStateAction<number>>;
    setGrid: React.Dispatch<React.SetStateAction<Grid2D<string>>>;
    setSelection: React.Dispatch<React.SetStateAction<Grid2D>>;

    hoveredCell?: Cell<string>;
    setHoveredCell: React.Dispatch<React.SetStateAction<Cell<string> | undefined>>
}
export default ({ grid, selection, setSelection, carriage, setCarriage, hoveredCell, setHoveredCell }: SvgPaperProps) => {

    const [selectionStart, setSelectionStart] = useState<[number, number] | null>(null);
    const selectionStartRef = useRef<[number, number] | null>(null);
    useEffect(() => {
        selectionStartRef.current = selectionStart;
    }, [selectionStart]);


    // TODO:
    // Pointer events should not be handled directly within the component.
    // Move into a hook. Can it be handled at the App level? Then, SvgPaper can focus just on display

    const onCellPointerUp = (event: PointerEvent) => {
        if (!selectionStart || !hoveredCell) return;
        const newSel = selectionFromRange(selectionStart, [hoveredCell.row, hoveredCell.col]);
        if (newSel === null) return;
        // if (event.ctrlKey)
        //     setSelection(sel => sel.union(newSel))
        // else
        setSelection(newSel);
        setSelectionStart(null);
        if (newSel.size() === 1)
            setCarriage(hoveredCell.col);
    };

    const onCellPointerDown = (event: PointerEvent) => {
        if (!hoveredCell) return;
        if (event.ctrlKey) {
            //setSelection([]);
            //return;
        }
        setSelectionStart([hoveredCell.row, hoveredCell.col]);
    };

    const onCellHovered = useCallback((event: PointerEvent, cell: Cell<string>) => {
        event.stopPropagation();
        if (selectionStartRef.current !== null) {
            const newSel = selectionFromRange(selectionStartRef.current, [cell.row, cell.col]);
            if (newSel === null) return;
            //if (event.ctrlKey)
            //setSelection(sel => {
            //     return sel.symmetricDifference(newSel);
            // })
            //else
            setSelection(newSel);
        }
        //console.log(cell);
        setHoveredCell(cell);
    }, []);

    const isSelected = useCallback((row: number, col: number) => selection.has(row, col), [selection]);

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
        <svg
            width={NUM_COLS * CELL_WIDTH}
            height={NUM_ROWS * CELL_HEIGHT}
            onPointerUp={onCellPointerUp}
            onPointerDown={onCellPointerDown}
        >
            <style>
                text {'{'}
                font-family: 'Courier New', Courier, monospace;
                color: black;
                fill:black;
                {'}'}
            </style>
            <rect width="100%" height="100%" fill="white" />
            {grid.rows.map((row, rowNum) => (
                <g key={`row-${rowNum}`} transform={`translate(0, ${rowNum * CELL_HEIGHT})`}>
                    {rowNum > 4 && <BlueHLine />}
                    {row.map((cell, colNum) => (
                        <GridCell
                            key={`${rowNum}-${colNum}`}
                            rowNum={rowNum}
                            colNum={colNum}
                            author={cell.author}
                            value={cell.value}
                            onCellHovered={onCellHovered}
                            isCellSelected={isSelected(rowNum, colNum)}
                        />
                    ))}
                </g>
            ))}
            {carriage > 0 && carriage !== DEFAULT_CARRIAGE && <CarriageIndicator carriage={carriage} />}
            <PinkVLine />
        </svg>
    );
};