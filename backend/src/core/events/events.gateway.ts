import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface LiveEventPayload<T = unknown> {
  type: 'NOTIFICATION' | 'ENTITY_CREATED' | 'ENTITY_UPDATED' | 'ENTITY_DELETED' | 'CHAT_MESSAGE';
  entity?: string;
  data: T;
  timestamp: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket', 'polling'],
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { status: 'joined', room };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
    return { status: 'left', room };
  }

  /**
   * Broadcast an event to all connected clients
   */
  broadcastEvent<T>(type: LiveEventPayload['type'], data: T, entity?: string) {
    const payload: LiveEventPayload<T> = {
      type,
      entity,
      data,
      timestamp: new Date().toISOString(),
    };
    this.server.emit('live_event', payload);
  }

  /**
   * Send an event to a specific room (e.g. workspace, project, or user ID)
   */
  emitToRoom<T>(room: string, type: LiveEventPayload['type'], data: T, entity?: string) {
    const payload: LiveEventPayload<T> = {
      type,
      entity,
      data,
      timestamp: new Date().toISOString(),
    };
    this.server.to(room).emit('live_event', payload);
  }
}
