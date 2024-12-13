import React, { useCallback } from 'react';
import { CELL_HEIGHT, CELL_WIDTH } from '../constants';

interface CellProps {
    x: number;
    y: number;
    value: string;
    cellWidth: number;
    cellHeight: number;
    onCellClick(x: number, y: number): void;
}

const Cell: React.FC<CellProps> = React.memo(({ x, y, value, onCellClick }) => {
    const onCellClickCB = useCallback(() => {
        return onCellClick(x, y);
    }, [x, y]);
    return <>
        <rect
            x={x * CELL_WIDTH}
            y={0}
            width={CELL_WIDTH}
            height={CELL_HEIGHT}
            fill="rgba(0,0,0,0)"
            onClick={onCellClickCB}
        />
        <text
            x={(x * CELL_WIDTH) + 1}
            y={CELL_HEIGHT - 4}
            fontSize={15}
            onClick={onCellClickCB}
        >{value}</text>
    </>;
});

export default Cell;
