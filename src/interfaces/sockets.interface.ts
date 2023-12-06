import { Socket } from 'socket.io';

export interface SocketInterface {
  handleConnection(socket: Socket): void;
  middlewareImplementation?(socket: Socket, next: any): void;
}

export interface ChatRoom {
  id: string;
  state: 'idle' | 'occupied';
  participants: Set<string>;
}