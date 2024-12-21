import React, { useState } from 'react';

type SetCellFn = (cell: GridLocation, value: string) => void;

export const useGrid = (numRows: number, numCols: number): [string[][], SetCellFn] => {
    const [grid, setGrid] = useState(
        Array.from({ length: numRows }, () => Array.from({ length: numCols }, () => ''))
    );

    const setCell = (cell: GridLocation, value: string) => {
        setGrid((prevGrid) => {
            const newGrid = prevGrid.map((row, rowIndex) =>
                rowIndex === cell.row
                    ? row.map((curValue, colIndex) => (colIndex === cell.col ? value : curValue))
                    : row
            );
            return newGrid;
        });
    };
    return [grid, setCell];
};
