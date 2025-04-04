
type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
type GridMapFn<E> = (cell: Cell<E>) => Cell<E>;

interface Cell<E> {
    row: number;
    col: number;
    value?: E;
    author?: number;
    ts?: number;
};

interface SizeConstraints {
    rowMin?: number;
    rowMax?: number;
    colMin?: number;
    colMax?: number;
}