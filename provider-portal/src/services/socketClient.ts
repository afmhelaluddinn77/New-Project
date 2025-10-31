import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './httpClient';

const DEFAULT_WORKFLOW_SOCKET_URL = 'http://localhost:3004/workflow';

const getWorkflowSocketUrl = () =>
  (import.meta.env.VITE_WORKFLOW_SOCKET_URL as string | undefined) ?? DEFAULT_WORKFLOW_SOCKET_URL;

let workflowSocket: Socket | null = null;

export function getWorkflowSocket(): Socket {
  if (workflowSocket && workflowSocket.connected) {
    return workflowSocket;
  }

  const token = getAuthToken();
  workflowSocket = io(getWorkflowSocketUrl(), {
    auth: token ? { token } : undefined,
    transports: ['websocket'],
    autoConnect: true,
  });

  return workflowSocket;
}

export function closeWorkflowSocket() {
  if (workflowSocket) {
    workflowSocket.disconnect();
    workflowSocket = null;
  }
}

