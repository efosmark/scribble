
export const gridOffset = (direction: string): [number, number] => {
    switch (direction) {
        case 'ArrowUp':
            return [1, 0];
        case 'ArrowDown':
            return [-1, 0];
        case 'ArrowLeft':
            return [0, 1];
        case 'ArrowRight':
            return [0, -1];
        default:
            return [0, 0];
    }
}


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

export function gridChanges<E>(prevGrid: Grid2D<E>, grid: Grid2D<E>) {
    if (prevGrid === grid) return new Grid2D<E>();

    const result = new Grid2D<E>();
    for (let row = 0; row < Math.max(grid.rows.length, prevGrid.rows.length); row++) {
        for (let col = 0; col < Math.max(grid.rows[row].length, prevGrid.rows[row].length); col++) {
            const curr = grid.get(row, col);
            const prev = prevGrid.get(row, col);
            if (curr.value !== prev.value) {
                result.set(curr);
            }
        }
    }
    return result;
}

export function getGridChanges<E>(prevGrid: Grid2D<E>, grid: Grid2D<E>) {
    const gridChanges = grid.rows.reduce<Cell<E>[]>((gridChanges, row, rowNum) => {
        const changes = grid.rows[rowNum].reduce<Cell<E>[]>((result, curr, colNum) => {
            const prevCell = prevGrid.get(rowNum, colNum);
            if (curr.value !== prevCell.value || (curr.author === undefined && prevCell.author !== undefined)) {
                return [...result, curr];
            }
            return result;
        }, []);
        if (changes.length > 0)
            return [...gridChanges, ...changes];
        return gridChanges;
    }, []);
    console.log('gridChanges', gridChanges);
    return gridChanges;
};

export function organizeChanges<E>(changes: Cell<E>[]): Grid2D<E> {
    return changes.reduce(
        (res, change) => res.set(change),
        new Grid2D<E>()
    );
}

export function applyGridChanges<E>(grid: Grid2D<E>, changes: Cell<E>[]) {
    const changesByKey = organizeChanges(changes);
    console.log('changes', changes);
    console.log('changesByKey', changesByKey);
    return grid.map(cell => {
        if (changesByKey.has(cell.row, cell.col)) {
            return changesByKey.get(cell.row, cell.col);
        }
        return cell;
    });
}

export function initializeGrid<E>(rows: number, cols: number): Grid2D<E> {
    const grid = new Grid2D<E>();
    for (let row = 0; row < rows; row++) {
        grid.rows[row] = [];
        for (let col = 0; col < cols; col++) {
            grid.rows[row][col] = { row, col };
        }
    }
    return grid;
}

export class Grid2D<E = undefined> {
    rows: Cell<E>[][];

    constructor() {
        this.rows = [];
    }

    has(row: number, col: number): boolean {
        return this.rows[row] !== undefined && this.rows[row][col] !== undefined;
    }

    size(): number {
        return this.rows.reduce((count, row) => count + row.length, 0);
    }

    get(row: number, col: number): Cell<E> {
        if (this.rows[row])
            return this.rows[row][col];
        return { row, col };
    }

    getValue(row: number, col: number): E | undefined {
        return this.get(row, col).value;
    }

    set(cell: Cell<E>): Grid2D<E> {
        if (!this.rows[cell.row])
            this.rows[cell.row] = [];
        this.rows[cell.row][cell.col] = cell;
        return this;
    }

    union(other: Grid2D<E>): Grid2D<E> {
        const grid = new Grid2D<E>();
        for (let row = 0; row < Math.max(grid.rows.length, other.rows.length); row++) {
            for (let col = 0; col < Math.max(grid.rows[row].length, other.rows[row].length); col++) {
                const cell = this.get(row, col) ?? other.get(row, col);
                if (cell)
                    other.set(cell);
            }
        }
        return grid;
    }

    map(callbackFn: GridMapFn<E>): Grid2D<E> {
        const grid = new Grid2D<E>();
        for (let row = 0; row < this.rows.length; row++) {
            for (let col = 0; col < this.rows[row]?.length; col++) {
                const cell = this.get(row, col);
                if (!cell) continue;
                const v = callbackFn(cell);
                if (v !== undefined && v !== null) {
                    grid.set(v);
                }
            }
        }
        return grid;
    }

    allCells(): Cell<E>[] {
        return this.rows.reduce<Cell<E>[]>((result, fullRow, row) => {
            const cells = fullRow.filter(e => e);
            if (cells.length > 0)
                return [
                    ...result,
                    ...cells
                ];
            return result;
        }, []);
    }
}
