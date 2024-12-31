import React, { useCallback, MouseEvent, PointerEvent, useState, useMemo } from 'react';
import { CELL_WIDTH, CELL_HEIGHT } from '../../constants';

interface GridCellProps {
    rowNum: number;
    colNum: number;
    value?: string;
    author?: number;
    isCellSelected: boolean;
    onCellHovered(e: PointerEvent, cell: Cell<string>): void;
}

export const GridCell = React.memo(({ rowNum, colNum, onCellHovered, isCellSelected, value, author }: GridCellProps) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);

    console.log('GridCell')

    const cellColor = useMemo<string>(() => {
        if (isCellSelected) return 'rgba(220,220,255,0.7)';
        else if (isHovered) return 'rgba(255,220,220,0.7)';
        else return 'rgba(0,0,0,0)';
    }, [isCellSelected, isHovered]);

    return <g
        onPointerOut={(e: PointerEvent) => setIsHovered(false)}
        onPointerOver={(e: PointerEvent) => {
            setIsHovered(true);
            onCellHovered(e, { row: rowNum, col: colNum, value, author });
        }}
    >
        <rect
            x={colNum * CELL_WIDTH}
            y={0}
            width={CELL_WIDTH}
            height={CELL_HEIGHT}
            fill={cellColor}
        />
        <text
            x={(colNum * CELL_WIDTH) + 1}
            y={CELL_HEIGHT - 4}
            fontSize={12}
        >{value}</text>
    </g>
});