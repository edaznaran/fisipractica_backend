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
import { MessageService } from 'src/message/message.service';
import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway {
  constructor(
    private readonly httpService: HttpService,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}

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

  @SubscribeMessage('student-message')
  async handleStudentMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    try {
      const { from, to, chat_id, job_id } = client.handshake.query;
      console.log(from, to);

      console.log(from, to);
      console.log(`Mensaje: ${data}.`);

      let newChatId = '';
      try {
        const chat = await this.chatService.findOne({
          id: +(chat_id ?? 0),
          student_id: +(from ?? 0),
          recruiter_id: +(to ?? 0),
          job_id: +(job_id ?? 0),
        });
        await this.messageService.create({
          chat_id: chat.id,
          message: data,
        });
      } catch {
        const chat = await this.chatService.create({
          student_id: +(from ?? 0),
          recruiter_id: +(to ?? 0),
          job_id: +(job_id ?? 0),
        });
        newChatId = String(chat.id);
        await this.messageService.create({
          chat_id: chat.id,
          message: data,
        });
      }

      if (newChatId) {
        const fromSockets = Array.from(this.socketMap.entries())
          .filter(([, value]) => value.user_id === +(from ?? 0))
          .map(([key]) => key);

        this.server.to(fromSockets).emit('student-message', newChatId);
      }
      const sockets = Array.from(this.socketMap.entries())
        .filter(([, value]) => value.user_id === +(to ?? 0))
        .map(([key]) => key);
      this.server.to(sockets).emit('recruiter-message', data);

      return 'Hello world!';
    } catch (error) {
      console.error(error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error interno al enviar el mensaje: ${error.message}`,
      );
    }
  }

  @SubscribeMessage('recruiter-message')
  async handleRecruiterMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    try {
      const { from, to, chat_id, job_id } = client.handshake.query;
      console.log(from, to);

      console.log(from, to);
      console.log(`Mensaje: ${data}.`);

      let newChatId = '';
      try {
        const chat = await this.chatService.findOne({
          id: +(chat_id ?? 0),
          student_id: +(to ?? 0),
          recruiter_id: +(from ?? 0),
          job_id: +(job_id ?? 0),
        });
        await this.messageService.create({
          chat_id: chat.id,
          message: data,
        });
      } catch {
        const chat = await this.chatService.create({
          recruiter_id: +(from ?? 0),
          student_id: +(to ?? 0),
          job_id: +(job_id ?? 0),
        });
        newChatId = String(chat.id);
        await this.messageService.create({
          chat_id: chat.id,
          message: data,
        });
      }

      if (newChatId) {
        const fromSockets = Array.from(this.socketMap.entries())
          .filter(([, value]) => value.user_id === +(from ?? 0))
          .map(([key]) => key);
        this.server.to(fromSockets).emit('recruiter-message', newChatId);
      }
      const toSockets = Array.from(this.socketMap.entries())
        .filter(([, value]) => value.user_id === +(to ?? 0))
        .map(([key]) => key);
      this.server.to(toSockets).emit('student-message', data);

      return 'Hello world!';
    } catch (error) {
      console.error(error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error interno al enviar el mensaje: ${error.message}`,
      );
    }
  }

  @SubscribeMessage('bot')
  async handleChatBot(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    const { from, to, chat_id, job_id } = client.handshake.query;

    let newChatId = '';
    try {
      const chat = await this.chatService.findOne({
        id: +(chat_id ?? 0),
        student_id: +(from ?? 0),
        job_id: +(job_id ?? 0),
      });
      await this.messageService.create({
        chat_id: chat.id,
        message: data,
      });
    } catch {
      const chat = await this.chatService.create({
        student_id: +(from ?? 0),
        job_id: +(job_id ?? 0),
      });
      newChatId = String(chat.id);
      await this.messageService.create({
        chat_id: chat.id,
        message: data,
      });
    }

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
                  `Eres un asistente virtual útil especializado en la empresa ${String(to)}.\n` +
                  `Si te preguntan sobre otro tema, simplemente responde que solo puedes responder preguntas relacionadas con ${String(to)}.\n` +
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

    await this.messageService.create({
      chat_id: +(newChatId ?? 0),
      message: response?.data?.choices?.[0]?.message?.content,
    });

    console.log(response.data.choices);
    const sockets = Array.from(this.socketMap.entries())
      .filter(([, value]) => value.user_id === +(from ?? 0))
      .map(([key]) => key);
    this.server
      .to(sockets)
      .emit('message', response.data.choices?.[0]?.message?.content);
    return 'Hello world!';
  }
}
