import { CELL_HEIGHT, CELL_WIDTH } from "../../constants";

interface CursorProps {
    row: number;
    col: number;
}

export const Cursor = ({ row, col }: CursorProps) => (
    <rect
        x={(col * CELL_WIDTH)}
        y={(row * CELL_HEIGHT)}
        width={CELL_WIDTH}
        height={CELL_HEIGHT}
        fill="rgba(220,220,255,0.7)"
        rx={1}
        ry={1}
        stroke="rgba(0,0,255,0.2)"
        strokeWidth={1}
        strokeDasharray="1, 1 "
    ></rect>
);