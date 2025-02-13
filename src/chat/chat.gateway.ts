import { HttpService } from '@nestjs/axios';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { catchError, firstValueFrom } from 'rxjs';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  constructor(private readonly httpService: HttpService) {}

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

  @SubscribeMessage('bot')
  async handleChatBot(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    const response = await firstValueFrom(
      this.httpService
        .post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'deepseek/deepseek-chat:free',
            messages: [
              {
                role: 'user',
                content: `${data}`,
              },
              {
                role: 'assistant',
                content:
                  `Eres un asistente virtual útil especializado en la empresa ${String(client.handshake.query.to)}.\n` +
                  `Si te preguntan sobre otro tema, simplemente responde que solo puedes responder preguntas relacionadas con ${String(client.handshake.query.to)}.\n` +
                  `Si no sabes la respuesta a una pregunta, por favor responde con 'En este caso, no puedo ofrecerte información precisa'.\n` +
                  `No inventes respuestas. Si no sabes la respuesta, por favor dilo. Siempre usa un lenguaje educado y profesional.` +
                  `Responde estrictamente en español con precisión y honestidad.`,
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
          },
        )
        .pipe(
          catchError((error) => {
            console.error('Error:', error.message);
            if (error instanceof HttpException) {
              throw error;
            }
            throw new InternalServerErrorException(
              `Error interno al enviar el mensaje: ${error.message}`,
            );
          }),
        ),
    );
    console.log('Notificación:', data);

    console.log(response.data.choices);
    const sockets = Array.from(this.socketMap.entries())
      .filter(
        ([, value]) => value.user_id === +(client.handshake.query.from ?? 0),
      )
      .map(([key]) => key);
    this.server
      .to(sockets)
      .emit('message', response.data.choices?.[0]?.message?.content);
    return 'Hello world!';
  }
}
