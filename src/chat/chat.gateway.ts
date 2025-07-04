import { HttpService } from '@nestjs/axios';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import {
  // ConnectedSocket,
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
    const { from, to, chat_id, job_id } = client.handshake.query;
    console.log(`Client connected: ${client.id}`);
    console.log(client.handshake.query.from);
    console.log(from, to, chat_id, job_id);
    this.socketMap.set(client.id, {
      user_id: from ? +from : 0,
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
    @MessageBody('from') from: string,
    @MessageBody('to') to: string,
    @MessageBody('company') company: string,
    @MessageBody('chat_id') chat_id: string,
    @MessageBody('job_id') job_id: string,
    @MessageBody('mensaje') data: string,
    // @ConnectedSocket() client: Socket,
  ): Promise<string | void> {
    try {
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
          user_id: +(from ?? 0),
        });
      } catch {
        const chat = await this.chatService.create({
          student_id: +(from ?? 0),
          recruiter_id: +(to ?? 0),
          job_id: +(job_id ?? 0),
        });
        console.log(chat);
        newChatId = String(chat.id);
      }

      if (newChatId) {
        const fromSockets = Array.from(this.socketMap.entries())
          .filter(([, value]) => value.user_id === +(from ?? 0))
          .map(([key]) => key);
        console.log('Emitiendo a', fromSockets);
        this.server.to(fromSockets).emit('student-message', newChatId);
      } else {
        const sockets = Array.from(this.socketMap.entries())
          .filter(([, value]) => value.user_id === +(to ?? 0))
          .map(([key]) => key);
        this.server.to(sockets).emit('recruiter-message', data);
      }

      return 'Hello world!';
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Error) {
        console.error(error.message);
        throw new InternalServerErrorException(
          `Error interno al enviar el mensaje: ${error.message}`,
        );
      }
      console.error('Error desconocido:', error);
      throw new InternalServerErrorException(
        `Error interno al enviar el mensaje`,
      );
    }
  }

  @SubscribeMessage('recruiter-message')
  async handleRecruiterMessage(
    @MessageBody('from') from: string,
    @MessageBody('to') to: string,
    @MessageBody('company') company: string,
    @MessageBody('chat_id') chat_id: string,
    @MessageBody('job_id') job_id: string,
    @MessageBody('mensaje') data: string,
    // @ConnectedSocket() client: Socket,
  ): Promise<string> {
    try {
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
          user_id: +(from ?? 0),
        });
      } catch {
        const chat = await this.chatService.create({
          recruiter_id: +(from ?? 0),
          student_id: +(to ?? 0),
          job_id: +(job_id ?? 0),
        });
        newChatId = String(chat.id);
      }

      if (newChatId) {
        const fromSockets = Array.from(this.socketMap.entries())
          .filter(([, value]) => value.user_id === +(from ?? 0))
          .map(([key]) => key);
        this.server.to(fromSockets).emit('recruiter-message', newChatId);
      } else {
        const toSockets = Array.from(this.socketMap.entries())
          .filter(([, value]) => value.user_id === +(to ?? 0))
          .map(([key]) => key);
        this.server.to(toSockets).emit('student-message', data);
      }

      return 'Hello world!';
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Error) {
        console.error(error.message);
        throw new InternalServerErrorException(
          `Error interno al enviar el mensaje: ${error.message}`,
        );
      }
      console.error('Error desconocido:', error);
      throw new InternalServerErrorException(
        `Error interno al enviar el mensaje`,
      );
    }
  }

  @SubscribeMessage('message')
  async handleChatBot(
    @MessageBody('from') from: string,
    @MessageBody('company') company: string,
    @MessageBody('chat_id') chat_id: string,
    @MessageBody('job_id') job_id: string,
    @MessageBody('mensaje') data: string,
    // @ConnectedSocket() client: Socket,
  ): Promise<string> {
    /* 
    console.log(`Mensaje: ${data}.`); */ /* 
    const { from, company, chat_id, job_id } = JSON.parse(data); */

    let newChatId = '';
    try {
      const chat = await this.chatService.findOne({
        id: +(chat_id ?? 0),
        student_id: +(from ?? 0),
        recruiter_id: undefined,
        job_id: +(job_id ?? 0),
      });
      await this.messageService.create({
        chat_id: chat.id,
        message: data,
        user_id: +(from ?? 0),
      });
    } catch {
      const chat = await this.chatService.create({
        student_id: +(from ?? 0),
        job_id: +(job_id ?? 0),
      });
      newChatId = String(chat.id);
    }

    const url = 'https://openrouter.ai/api/v1/chat/completions';
    const body = {
      model: 'deepseek/deepseek-chat:free',
      messages: [
        {
          role: 'user',
          content: `${data}`,
        },
        {
          role: 'system',
          content:
            `You are a helpful virtual assistant specialized in the company ${String(company)}.\n` +
            `If asked about another topic, simply respond that you can only answer questions related to ${String(company)}.\n` +
            `If you don't know the answer to a question, please respond with 'In this case, I cannot provide accurate information'.\n` +
            `Do not make up answers. If you don't know the answer, please say so. Always use polite and professional language.` +
            `Respond strictly in Spanish with precision and honesty.`,
        },
      ],
    };

    const sockets = Array.from(this.socketMap.entries())
      .filter(([, value]) => value.user_id === +(from ?? 0))
      .map(([key]) => key);

    interface ChatBotResponse {
      data: {
        choices: {
          message: {
            content: string;
          };
        }[];
      };
    }

    if (newChatId) {
      this.server.to(sockets).emit('message', newChatId);
    } else {
      const response: ChatBotResponse = await firstValueFrom(
        this.httpService
          .post(url, body, {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
          })
          .pipe(
            catchError((error: any) => {
              if (error instanceof HttpException) {
                throw error;
              }
              if (error instanceof Error) {
                console.error('Error:', error.message);
                throw new InternalServerErrorException(
                  `Error interno al enviar el mensaje: ${error.message}`,
                );
              }
              console.error('Error desconocido:', error);
              throw new InternalServerErrorException(
                `Error interno al enviar el mensaje`,
              );
            }),
          ),
      );
      console.log('Notificación:', data);

      await this.messageService.create({
        chat_id: +(chat_id ?? 0),
        message: response?.data?.choices?.[0]?.message?.content,
        user_id: undefined,
      });
      console.log(response.data.choices);

      this.server
        .to(sockets)
        .emit('message', response.data.choices?.[0]?.message?.content);
    }
    return 'Hello world!';
  }
}
