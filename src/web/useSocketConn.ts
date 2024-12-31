import { useCallback, useEffect, useRef } from "react";
import { Action, ACTION_CELL_CHANGED, ACTION_CLEAR_ALL, CellsChangedAction, ClearAllAction } from "../action";


interface SocketConnectionHook {
    onCellsChanged(action: CellsChangedAction): void;
    onClearGrid(action: ClearAllAction): void;
}

export const useSocketConnection = (address: string, { onCellsChanged, onClearGrid }: SocketConnectionHook) => {
    const handleMessage = (message: string) => {
        const action = JSON.parse(message);
        console.log('RECV', action);
        switch (action.type) {
            case ACTION_CELL_CHANGED:
                onCellsChanged(action as CellsChangedAction);
                break;

            case ACTION_CLEAR_ALL:
                onClearGrid(action as ClearAllAction);
                break;

            default:
                console.error('ERROR', action);
        }
    };

    const connection = useRef<WebSocket | null>(null);
    useEffect(() => {
        const socket = new WebSocket(address);
        socket.addEventListener("open", () => {
            console.debug(`CONNECTED TO ${address}`);
        });
        socket.addEventListener("message", (event) => handleMessage(event.data));
        connection.current = socket;
        return () => {
            socket.close();
            console.debug(`DISCONNECTED FROM ${address}`);
        };
    }, []);

    return {
        sendAction: useCallback((action: Action) => {
            connection.current?.send(JSON.stringify(action));
        }, [])
    }
}