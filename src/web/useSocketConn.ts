import { useCallback, useEffect, useRef, useState } from "react";
import { Action, ACTION_CELL_CHANGED, ACTION_CLEAR_ALL, CellsChangedAction, ClearAllAction } from "../action";

interface SocketConnectionHook {
    onCellsChanged(action: CellsChangedAction): void;
    onClearGrid(action: ClearAllAction): void;
}

export const useSocketConnection = (address: string, { onCellsChanged, onClearGrid }: SocketConnectionHook) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);

    const handleAction = (action: Action) => {
        console.debug('RECV', action);
        switch (action.t) {
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
            setIsConnected(true);
        });
        socket.addEventListener("message", (event) => handleAction(JSON.parse(event.data)));
        connection.current = socket;
        return () => {
            socket.close();
            console.debug(`DISCONNECTED FROM ${address}`);
            setIsConnected(false);
        };
    }, []);

    return {
        isConnected,
        sendAction: useCallback((action: Action) => {
            setTimeout(() => {
                console.debug('SEND', action);
                connection.current?.send(JSON.stringify(action));
            }, 50);
        }, [])
    }
}