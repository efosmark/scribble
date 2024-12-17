import React, { MouseEvent, useCallback } from 'react';
import { CELL_HEIGHT, CELL_WIDTH } from '../constants';

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

const Cell: React.FC<CellProps> = React.memo(({ row, col, value, isSelected, onCellClick, onCellHover }) => {
    const onCellClickCB = useCallback((event: MouseEvent) => {
        console.log('click')
        event.stopPropagation();
        return onCellClick({ row, col, carriage: col });
    }, [row, col]);

    return <g
        onClick={onCellClickCB}
        onPointerOver={useCallback(() => onCellHover({ row, col }), [row, col])}
    >
        <rect
            x={col * CELL_WIDTH}
            y={0}
            width={CELL_WIDTH}
            height={CELL_HEIGHT}
            fill={isSelected ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0)"}

        />
        <text
            x={(col * CELL_WIDTH) + 1}
            y={CELL_HEIGHT - 4}
            fontSize={15}
        >{value}</text>
    </g>;
});

export default Cell;
