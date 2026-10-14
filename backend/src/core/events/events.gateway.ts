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

export interface AuthenticatedUserPayload {
  sub: string;
  email?: string;
  preferred_username?: string;
  realm_access?: {
    roles: string[];
  };
  exp?: number;
}

@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      // Dynamic origin checking matching backend CORS policy
      callback(null, true);
    },
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  /**
   * Authenticate connecting clients via Keycloak Bearer token
   */
  handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        (client.handshake.headers?.authorization?.startsWith('Bearer ')
          ? client.handshake.headers.authorization.slice(7)
          : null);

      if (!token) {
        this.logger.warn(`Unauthorized WebSocket connection rejected: ${client.id} (No token provided)`);
        client.disconnect(true);
        return;
      }

      const user = this.decodeToken(token);
      if (!user || !user.sub) {
        this.logger.warn(`Unauthorized WebSocket connection rejected: ${client.id} (Invalid payload)`);
        client.disconnect(true);
        return;
      }

      // Check token expiration
      if (user.exp && user.exp < Date.now() / 1000) {
        this.logger.warn(`Unauthorized WebSocket connection rejected: ${client.id} (Token expired)`);
        client.disconnect(true);
        return;
      }

      // Attach user to client data
      client.data.user = user;

      // Automatically join the user's dedicated personal room
      client.join(`user_${user.sub}`);
      this.logger.log(`Authenticated client connected: ${client.id} (User: ${user.preferred_username || user.sub})`);
    } catch (err) {
      this.logger.error(`WebSocket handshake authentication error: ${(err as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    if (!client.data.user) {
      return { status: 'error', message: 'Unauthenticated' };
    }
    client.join(room);
    this.logger.log(`User ${client.data.user.sub} joined room: ${room}`);
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

  /**
   * Send an event directly to a specific user by Keycloak sub ID
   */
  emitToUser<T>(userId: string, type: LiveEventPayload['type'], data: T, entity?: string) {
    this.emitToRoom(`user_${userId}`, type, data, entity);
  }

  private decodeToken(token: string): AuthenticatedUserPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
      return JSON.parse(payloadJson) as AuthenticatedUserPayload;
    } catch {
      return null;
    }
  }
}
