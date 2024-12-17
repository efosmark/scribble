import React, { useCallback, useEffect, useRef } from 'react';

const NUM_ROWS = 40;
const NUM_COLS = 80;

interface SvgKeyHandler {
    setCell(loc: GridLocation, key: string): void;
    setCursor(cursor: Cursor): void;
    cursor: Cursor;
}

const useKeyInputHandler = ({ setCell, cursor, setCursor }: SvgKeyHandler) => {

    const onBackspace = useCallback(() => {
        const { col, row, carriage } = cursor;
        if (col > 0) {
            setCursor({ col: col - 1, row, carriage }); // todo onMove('ArrowLeft') instead?
            setCell({ col: col - 1, row }, ' ');
        }
    }, [cursor]);

    const onEnter = useCallback(() => {
        const { row, carriage } = cursor;
        if (row < NUM_ROWS) {
            setCursor({ col: carriage, row: row + 1, carriage });
        }
    }, [cursor]);

    const onMove = useCallback((key: string) => {
        const { col, row } = cursor;
        if (key === 'ArrowRight') {
            const newX = (col + 1) % NUM_COLS;
            const newY = newX === 0 ? (row + 1) % NUM_ROWS : row;
            setCursor({ col: newX, row: newY, carriage: newX });
        } else if (key === 'ArrowLeft') {
            if (col > 0) setCursor({ col: col - 1, row, carriage: col - 1 });
            else if (row > 0) setCursor({ col: 0, row: row - 1, carriage: col });
        } else if (key === 'ArrowDown') {
            if (row < NUM_ROWS) setCursor({ col, row: row + 1, carriage: col });
        } else if (key === 'ArrowUp') {
            if (row > 0) setCursor({ col, row: row - 1, carriage: col });
        }
    }, [cursor]);

    const onKeyDown = useCallback((key: string) => {
        const { row, col, carriage } = cursor;
        const newCol = (col + 1) % NUM_COLS;
        const newRow = newCol === 0 ? (row + 1) % NUM_ROWS : row;
        setCursor({ col: newCol, row: newRow, carriage });
        setCell({ row, col }, key);
    }, [cursor]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.length === 1) {
                onKeyDown(e.key);
            } else if (e.key === 'Backspace') {
                onBackspace();
            } else if (e.key === 'Enter') {
                onEnter();
            } else if (e.key === 'Delete') {
                onKeyDown('');
            } else if (e.key.indexOf('Arrow') === 0) {
                onMove(e.key);
            }
            e.preventDefault();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [cursor]);
};

export default useKeyInputHandler;