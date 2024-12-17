

interface GridLocation {
    row: number;
    col: number;
}

interface SelectionRange {
    start: GridLocation | null;
    end: GridLocation | null;
}

interface Cursor extends GridLocation {
    carriage: number;
}

type GridType = string[][];