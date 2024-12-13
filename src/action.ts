

export const ACTION_SET_CELL = 'set';
export const ACTION_CLIENT_CONN = 'conn';
export const ACTION_CLIENT_CLOSE = 'close';
export const ACTION_CLEAR_ALL = 'clear';

interface ActionInterface {
    type:string;
}

interface SetCellInterface extends ActionInterface {
    row:number;
    col:number;
    value:string;
}

export class Action {
    type: string;
    content: any;

    constructor(packetType: string, content: any) {
        this.type = packetType;
        this.content = content;
    }

    toJSON = () => ({ t: this.type, c: this.content });
    toString = () => `Action("${this.type}", ${this.content})`;
}



export const actionSetCell = (x: number, y: number, key: string) => ({
    
});