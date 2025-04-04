
export const gridKey = (row: number, col: number): string => `${row},${col}`;

export function selectionFromRange(start: [number, number], end: [number, number]): Grid2D {
    const [startRow, endRow] = [Math.min(start[0], end[0]), Math.max(start[0], end[0])];
    const [startCol, endCol] = [Math.min(start[1], end[1]), Math.max(start[1], end[1])];
    const result = new Grid2D();
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            result.set({ row, col });
        }
    }
    return result;
}

export function initializeGrid<E>(rows: number, cols: number): Grid2D<E> {
    const grid = new Grid2D<E>();
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            grid.set({ row, col });
        }
    }
    return grid;
}

export class Grid2D<E = undefined, GridCell extends Cell<E> = Cell<E>> {
    cells: Map<string, GridCell>;
    rows: Map<number, Map<number, GridCell>>;
    cols: Map<number, Map<number, GridCell>>;

    constructor(cells?: GridCell[]) {
        this.cells = new Map<string, GridCell>();

        this.rows = new Map<number, Map<number, GridCell>>();
        this.cols = new Map<number, Map<number, GridCell>>();

        if (cells && cells.length > 0)
            cells.forEach(cell => this.set(cell));
    }

    has(row: number, col: number): boolean {
        return this.cells.has(gridKey(row, col));
    }

    size(): number {
        return this.cells.size;
    }

    get(row: number, col: number): GridCell {
        return this.cells.get(gridKey(row, col)) ?? { row, col } as GridCell;
    }

    _row_set(cell: GridCell) {
        if (!this.rows.has(cell.row))
            this.rows.set(cell.row, new Map<number, GridCell>());
        this.rows.get(cell.row)?.set(cell.row, cell);
    }

    _col_set(cell: GridCell) {
        if (!this.cols.has(cell.col))
            this.cols.set(cell.col, new Map<number, GridCell>());
        this.cols.get(cell.col)?.set(cell.col, cell);
    }

    set(cell: GridCell): Grid2D<E> {
        this.cells.set(gridKey(cell.row, cell.col), cell);
        this._row_set(cell);
        this._col_set(cell);
        return this;
    }

    union(other: Grid2D<E>): Grid2D<E> {
        if (other === this) return new Grid2D<E>();
        const result = new Grid2D<E>();
        for (const cell of [...other.cells.values(), ...this.cells.values()]) {
            if (!result.has(cell.row, cell.col)) result.set(cell);
        }
        return result;
    }

    difference(other: Grid2D<E>): Grid2D<E> {
        if (other === this) return new Grid2D<E>();
        const result = new Grid2D<E>();

        for (const cell of this.cells.values()) {
            const otherCell = other.get(cell.row, cell.col);
            if (cell.value === otherCell.value) continue;
            result.set(otherCell);
        }
        return result;
    }

    modify(callbackFn: GridMapFn<E>): Grid2D<E> {
        const grid = new Grid2D<E>();
        for (const cell of this.cells.values()) {
            const v = callbackFn(cell);
            if (v !== undefined) grid.set(v);
        }
        return grid;
    }

    keys(): Set<string> {
        return new Set<string>(this.cells.keys());
    }

    allCells(): Cell<E>[] {
        return this.cells.values().toArray();
    }
}
