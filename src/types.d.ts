
type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

interface Cell<E> {
    row: number;
    col: number;
    value?: E;
    author?: number;
    ts?: number;
};

type SelectionMapFn = (row: number, col: number, selection: Set<string>) => string;
type GridMapFn<E> = (cell: Cell<E>) => Cell<E>;
