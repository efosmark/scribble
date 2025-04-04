import React, { PointerEvent, useState, useMemo } from 'react';
import { CELL_WIDTH, CELL_HEIGHT } from '../../constants';

interface GridCellProps {
    row: number;
    col: number;
    value?: string;
    author?: number;
    ts?: number;
    isCellSelected: boolean;
    onCellHovered(e: PointerEvent, cell: Cell<string>): void;
}

export const GridCell = React.memo(({ row, col, onCellHovered, isCellSelected, value, author }: GridCellProps) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const cellColor = useMemo<string>(() => {
        if (isCellSelected) return 'rgba(220,220,255,0.7)';
        else if (isHovered) return 'rgba(255,220,220,0.7)';
        else return 'rgba(0,0,0,0)';
    }, [isCellSelected, isHovered]);

    return <g
        onPointerOut={() => setIsHovered(false)}
        onPointerOver={(e: PointerEvent) => {
            setIsHovered(true);
            onCellHovered(e, { row: row, col: col, value, author });
        }}
    >
        <rect
            x={col * CELL_WIDTH}
            y={row * CELL_HEIGHT}
            width={CELL_WIDTH}
            height={CELL_HEIGHT}
            fill={cellColor}
        />
        <text
            x={(col * CELL_WIDTH) + 1}
            y={(row * CELL_HEIGHT) + CELL_HEIGHT - 4}
            fontSize={12}
            className={author !== undefined ? '' : 'pending'}
        >{value}</text>
    </g>
});