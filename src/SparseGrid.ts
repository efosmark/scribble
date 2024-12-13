import { useState } from "react";

export class SparseGrid<T> {
    private grid: Map<string, T>;

    constructor(existingGrid?: Map<string, T>) {
        this.grid = existingGrid ? new Map(existingGrid) : new Map();
    }

    // Helper to encode coordinates into a string key
    private key(x: number, y: number): string {
        return `${x}-${y}`;
    }

    private parseKey(key: string): [number, number] {
        const [x, y] = key.split('-', 1);
        return [Number(x), Number(y)];
    }

    set(x: number, y: number, value: T): SparseGrid<T> {
        const newGrid = new SparseGrid(this.grid);
        newGrid.grid.set(this.key(x, y), value);
        return newGrid;
    }

    get(x: number, y: number): T | undefined {
        return this.grid.get(this.key(x, y));
    }

    getAll(): Array<[string, T]> {
        return Array.from(this.grid.entries());
    }

    has(x: number, y: number): boolean {
        return this.grid.has(this.key(x, y));
    }

    map(callbackfn: (x: number, y: number, value: T | undefined) => any): IteratorObject<T> {
        return this.grid.keys().map(key => {
            const [x, y] = this.parseKey(key);
            return callbackfn(x, y, this.grid.get(key));
        });
    }

    // Retrieve a 2D slice as an array
    // slice(x1: number, y1: number, x2: number, y2: number): Array<Array<T | null>> {
    //     const result: Array<Array<T | null>> = [];

    //     for (let y = y1; y <= y2; y++) {
    //         const row: Array<T | null> = [];
    //         for (let x = x1; x <= x2; x++) {
    //             row.push(this.get(x, y) ?? null); // Null for empty cells
    //         }
    //         result.push(row);
    //     }

    //     return result;
    // }
}

type SetCellFn = (x: number, y: number, value: string) => void;

export const useSparseGrid = (): [SparseGrid<string>, SetCellFn] => {
    const [grid, setGrid] = useState(() => new SparseGrid<string>());
    const setCell = (x: number, y: number, value: string) => {
        console.log('grid-changed');
        setGrid((prevGrid) => prevGrid.set(x, y, value));
    };

    return [grid, setCell];
}