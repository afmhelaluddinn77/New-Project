import { io, Socket } from 'socket.io-client';
import { getAuthToken, getWorkflowSocketUrl } from './httpClient';

let workflowSocket: Socket | null = null;

export function getWorkflowSocket(): Socket {
  if (workflowSocket && workflowSocket.connected) {
    return workflowSocket;
  }

  const token = getAuthToken();
  workflowSocket = io(getWorkflowSocketUrl(), {
    auth: token ? { token } : undefined,
    transports: ['websocket'],
  });

  return workflowSocket;
}

export function closeWorkflowSocket() {
  if (workflowSocket) {
    workflowSocket.disconnect();
    workflowSocket = null;
  }
}

