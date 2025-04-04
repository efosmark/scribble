import { useState, useEffect, useCallback, PointerEvent, useRef } from 'react';
import { CELL_WIDTH, CELL_HEIGHT, NUM_ROWS, NUM_COLS, DEFAULT_CARRIAGE } from '../../constants';
import { Grid2D, gridKey, selectionFromRange } from '../../grid';
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

const BlueHLine = ({ row }: { row: number }) => {
    return <line
        x1={0}
        x2={CELL_WIDTH * NUM_COLS}
        y1={CELL_HEIGHT * row}
        y2={CELL_HEIGHT * row}
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
    hoveredCell?: Cell<string>;
    selection: Grid2D;
    setCarriage(value: number): void;
    setDownloader(value: () => void): void;
    setGrid(value: Grid2D<string>): void;
    setHoveredCell(value: Cell<string> | undefined): void;
    setSelection: SetState<Grid2D>;
}

export default ({
    carriage,
    grid,
    hoveredCell,
    selection,
    setCarriage,
    setDownloader,
    setHoveredCell,
    setSelection,
}: SvgPaperProps) => {
    const [selectionStart, setSelectionStart] = useState<[number, number] | null>(null);
    const selectionStartRef = useRef<[number, number] | null>(null);
    useEffect(() => {
        selectionStartRef.current = selectionStart;
    }, [selectionStart]);

    const svgRef = useRef(null);
    useEffect(() => {
        setDownloader(() => () => {
            console.log("running downloader...");
            if (!svgRef.current) {
                console.error('<svg> has no ref.');
                return;
            }

            const svgString = new XMLSerializer().serializeToString(svgRef.current);
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
        });
    }, []);

    // TODO:
    // Pointer events should not be handled directly within the component.
    // Move into a hook. Can it be handled at the App level? Then, SvgPaper can focus just on display

    const onCellPointerUp = () => {
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

    const onCellPointerDown = () => {
        if (!hoveredCell) return;
        setSelectionStart([hoveredCell.row, hoveredCell.col]);
    };

    const onCellHovered = useCallback((event: PointerEvent, cell: Cell<string>) => {
        event.stopPropagation();
        if (selectionStartRef.current !== null) {
            const newSel = selectionFromRange(selectionStartRef.current, [cell.row, cell.col]);
            if (newSel === null) return;
            if (event.ctrlKey)
                setSelection(sel => sel.union(newSel));
            else
                setSelection(newSel);
        }
        setHoveredCell(cell);
    }, []);

    return (
        <svg
            ref={svgRef}
            width={NUM_COLS * CELL_WIDTH}
            height={NUM_ROWS * CELL_HEIGHT}
            onPointerUp={onCellPointerUp}
            onPointerDown={onCellPointerDown}
        >
            <style>{`
                text {
                    font-family: 'Courier New', Courier, monospace;
                    fill: black;
                }
                text.pending {
                    fill: #999999;
                    font-style: italic;
                }
           `}</style>
            <rect width="100%" height="100%" fill="white" />

            {Array.from({ length: NUM_ROWS }, (_, i) => i > 5 ? (<BlueHLine key={i} row={i} />) : null)}
            {carriage > 0 && carriage !== DEFAULT_CARRIAGE && <CarriageIndicator carriage={carriage} />}
            <PinkVLine />

            {grid.cells.values().toArray().map((cell) => (
                <GridCell
                    key={`${gridKey(cell.row, cell.col)}`}
                    {...cell}
                    onCellHovered={onCellHovered}
                    isCellSelected={selection.has(cell.row, cell.col)}
                />
            ))}
        </svg>
    );
};