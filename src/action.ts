

export const ACTION_CELL_CHANGED = 'change';
export const ACTION_CLIENT_CONN = 'conn';
export const ACTION_CLIENT_CLOSE = 'close';
export const ACTION_CLEAR_ALL = 'clear';

export abstract class Action {
    abstract t: string;
    ts: number;

    constructor() {
        this.ts = Math.floor(Date.now() / 1000);
    }

    toJSON = () => Object.getOwnPropertyNames(this).reduce((result, prop) => {
        const value = this[prop as keyof Action];
        if (typeof value !== "function") {
            return { ...result, [prop]: value }
        }
        return result;
    }, {} as Record<keyof Action, number | string | null>);

    toString = () => `Action("${this.t}")`;
}

export class CellsChangedAction extends Action {
    t = ACTION_CELL_CHANGED;
    cells: Cell<string>[];
    constructor(cells: Cell<string>[]) {
        super();
        this.cells = cells;
    }
}

export class ConnectedAction extends Action {
    t = ACTION_CLIENT_CONN;
    ident: number;
    constructor(ident: number) {
        super();
        this.ident = ident;
    }
}

export class DisconnectedAction extends Action {
    t = ACTION_CLIENT_CLOSE;
    ident: number;
    constructor(ident: number) {
        super();
        this.ident = ident;
    }
}

export class ClearAllAction extends Action {
    t = ACTION_CLEAR_ALL;
}