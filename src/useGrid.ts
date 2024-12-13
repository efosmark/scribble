import React, { useState } from 'react';

type SetCellFn = (x: number, y: number, value: string) => void;

export const useGrid = (numRows: number, numCols: number): [string[][], SetCellFn] => {
    const [grid, setGrid] = useState(
        Array.from({ length: numRows }, () => Array.from({ length: numCols }, () => ''))
    );

    const setCell = (x: number, y: number, value: string) => {
        setGrid((prevGrid) => {
            const newGrid = prevGrid.map((row, rowIndex) =>
                rowIndex === y
                    ? row.map((cell, colIndex) => (colIndex === x ? value : cell))
                    : row
            );
            return newGrid;
        });
    };

    return [grid, setCell];
};
