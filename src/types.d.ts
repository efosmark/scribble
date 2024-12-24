

interface GridLocation {
    row: number;
    col: number;
}

interface SelectionRange {
    start: GridLocation | null;
    end: GridLocation | null;
}

type GridType = string[][];


interface Cell extends GridLocation {
    value: any;
}