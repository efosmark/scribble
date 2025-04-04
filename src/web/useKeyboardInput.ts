import { useEffect } from "react";
import { Grid2D } from "../grid";

const OFFSETS: Record<string, [number, number]> = {
    ArrowUp: [1, 0],
    ArrowDown: [-1, 0],
    ArrowLeft: [0, 1],
    ArrowRight: [0, -1],
};

interface KeyboardInputHook {
    carriage: number;
    selection: Grid2D;
    setGrid: SetState<Grid2D<string>>;
    setSelection: SetState<Grid2D>;
    constraints: SizeConstraints;
}
export function useKeyboardInput({
    carriage,
    selection,
    setGrid,
    setSelection,
    constraints
}: KeyboardInputHook) {

    /**
     * 
     * @param e 
     */
    const arrowPress = (e: KeyboardEvent) => {
        const [rowOffset, colOffset] = OFFSETS[e.key] ?? [0, 0];
        if (e.ctrlKey && !e.shiftKey) {
            setGrid(grid => grid.modify((cell) => {
                if (selection.has(cell.row + rowOffset, cell.col + colOffset))
                    return {
                        value: grid.get(cell.row + rowOffset, cell.col + colOffset).value,
                        row: cell.row,
                        col: cell.col
                    }
                else if (selection.has(cell.row, cell.col))
                    return { row: cell.row, col: cell.col };
                return cell;
            }));
        }
        setSelection(selection => {
            const result = selection.modify(cell => ({
                ...cell,
                row: cell.row - rowOffset,
                col: cell.col - colOffset
            }));
            if (e.shiftKey)
                return result.union(selection);
            return result;
        });
    }


    /**
     * 
     * @param value 
     */
    const addKey = (value: string) => {
        setGrid(g => g.modify(cell => {
            if (selection.has(cell.row, cell.col))
                return { row: cell.row, col: cell.col, value };
            return cell;
        }));
        setSelection(sel => {
            if (sel.size() > 1) return sel;
            return sel.modify(cell => {
                if (constraints.colMax && cell.col >= constraints.colMax - 1) {
                    if (constraints.rowMax && cell.row >= constraints.rowMax - 1) {
                        console.warn('Attempted to navigate past the end of the page.')
                        return cell;
                    }
                    return { row: cell.row + 1, col: carriage };
                }
                return {
                    ...cell,
                    col: cell.col + 1
                };
            });
        });
    };


    /**
     * 
     */
    const carriageReturn = () => {
        setSelection(sel => {
            if (sel.size() > 1) return sel;
            return sel.modify(cell => ({
                value: cell.value,
                row: cell.row + 1,
                col: carriage
            }));
        });
    };


    /**
     * Clear the values of the selected cells
     */
    const deleteKey = () => {
        setGrid(g => g.modify(cell => {
            if (selection.has(cell.row, cell.col))
                return { row: cell.row, col: cell.col, value: '' };
            return cell;
        }));
    };


    /** 
     * Clear the previous value and navigate back one space
     */
    const backspace = () => {
        setGrid(g => g.modify(cell => {
            if (selection.has(cell.row, cell.col + 1))
                return { row: cell.row, col: cell.col, value: '' };
            return cell;
        }));
        // TODO: move back one space
    };


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.length === 1 && !e.ctrlKey && !e.altKey)
                addKey(e.key);
            else if (e.key === 'Enter' && selection.size() === 1)
                carriageReturn();
            else if (e.key === 'Delete')
                deleteKey();
            else if (e.key === 'Backspace' && selection.size() === 1)
                backspace();
            else if (e.key.indexOf('Arrow') === 0)
                arrowPress(e);
            else
                console.warn(`Unhandled KeyboardEvent`, e);
            e.preventDefault();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [selection, carriage, constraints]);

}