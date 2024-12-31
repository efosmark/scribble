import { useEffect } from "react";
import { Grid2D, gridOffset } from "../grid";



interface KeyboardInputHook {
    carriage: number;
    selection: Grid2D;
    setGrid: SetState<Grid2D<string>>;
    setSelection: SetState<Grid2D>;
}

export function useKeyboardInput({
    carriage,
    selection,
    setGrid,
    setSelection
}: KeyboardInputHook) {

    const handleArrowPress = (e: KeyboardEvent) => {
        const [rowOffset, colOffset] = gridOffset(e.key);
        if (e.ctrlKey && !e.shiftKey) {
            setGrid(grid => grid.map(({ value, row, col }): Cell<string> => {
                const offset = { row: row + rowOffset, col: col + colOffset };
                if (selection.has(row + rowOffset, col + colOffset))
                    return grid.rows[offset.row][offset.col];
                else if (selection.has(row, col))
                    return { row, col };
                return { row, col, value };
            }));
        }
        setSelection(selection => {
            const result = selection.map(cell => ({
                ...cell,
                row: cell.row - rowOffset,
                col: cell.col - colOffset
            }));
            //if (e.shiftKey)
            //    return result.union(selection);
            return result;
        });
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
                setGrid(g => g.map(cell => {
                    if (selection.has(cell.row, cell.col))
                        return { row: cell.row, col: cell.col, value: e.key };
                    return cell;
                }));
                setSelection(sel => {
                    //if (sel.size() > 1) return sel;
                    return sel.map(cell => ({
                        ...cell,
                        col: cell.col + 1
                    }));
                });
            } else if (e.key === 'Enter' && selection.size() === 1) {
                setSelection(sel => {
                    if (sel.size() > 1) return sel;
                    return sel.map(cell => ({
                        value: cell.value,
                        row: cell.row + 1,
                        col: carriage
                    }));
                });
            } else if (e.key === 'Delete') {
                setGrid(g => g.map(cell => {
                    if (selection.has(cell.row, cell.col))
                        return { row: cell.row, col: cell.col };
                    return cell;
                }));
            } else if (e.key === 'Backspace' && selection.size() === 1) {
                setGrid(g => g.map(cell => {
                    if (selection.has(cell.row, cell.col + 1))
                        return { row: cell.row, col: cell.col, value: '' };
                    return cell;
                }));
            } else if (e.key.indexOf('Arrow') === 0) {
                handleArrowPress(e);
            }
            e.preventDefault();
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [selection, carriage]);

}