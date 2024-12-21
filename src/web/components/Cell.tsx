import React, { MouseEvent, useCallback } from 'react';

interface CellProps {
    row: number;
    col: number;
    value: string;
    cellWidth: number;
    cellHeight: number;
    isSelected: boolean;
    onCellClick(cell: Cursor): void;
    onCellHover(cell: GridLocation): void;
}

const DEFAULT_FONT_SIZE = 15;

const Cell: React.FC<CellProps> = React.memo(({ row, col, value, isSelected, onCellClick, onCellHover, cellWidth, cellHeight }) => {
    const onCellClickCB = useCallback((event: MouseEvent) => {
        event.stopPropagation();
        return onCellClick({ row, col, carriage: col });
    }, [row, col]);

    return <g
        onClick={onCellClickCB}
        onPointerOver={useCallback(() => onCellHover({ row, col }), [row, col])}
    >
        <rect
            x={col * cellWidth}
            y={0}
            width={cellWidth}
            height={cellHeight}
            fill={isSelected ? "rgba(220,220,255,0.7)" : "rgba(0,0,0,0)"}

        />
        <text
            x={(col * cellWidth) + 1}
            y={cellHeight - 4}
            fontSize={DEFAULT_FONT_SIZE}
        >{value}</text>
    </g>;
});

export default Cell;
