import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  socketMap = new Map<string, { user_id: number }>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    console.log(client.handshake.query.from);
    this.socketMap.set(client.id, {
      user_id: client.handshake.query.from ? +client.handshake.query.from : 0,
    });

    console.log(this.socketMap);
    this.server.to(client.id).emit('notification', 'Conexión establecida');
  }

  handleDisconnect(client: Socket) {
    this.socketMap.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): string {
    const sockets = Array.from(this.socketMap.entries())
      .filter(
        ([, value]) => value.user_id === +(client.handshake.query.to ?? 0),
      )
      .map(([key]) => key);
    console.log(client.handshake.query.from, client.handshake.query.to);
    console.log(`Mensaje: ${data}.`);
    this.server.to(sockets).emit('message', data);
    return 'Hello world!';
  }
}
