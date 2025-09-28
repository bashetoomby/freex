import { forwardRef, Inject, Injectable, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { MessagesService } from 'src/messages/messages.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@Injectable()
export class ChatsGateway {
    @WebSocketServer()
    server: Server;

    constructor(@Inject(forwardRef(() => MessagesService)) private messagesService: MessagesService) { }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
        @MessageBody('room') room: string,
        @ConnectedSocket() client: Socket,
    ) {
        client.join(room);
        console.log(`Client ${client.id} joined room: ${room}`);
        const userId = Number(room.replace('room/', ''))
        if (userId) {
            const unreadCount = await this.messagesService.getUnreadMessagesCount(userId);
            client.emit('unreadCountUpdate', { count: unreadCount });
        }

    }

    updateMessage(event: string, room: string, data: any) {
        this.server.to(room).emit(event, data);
    }

    sentMessage(event: string, room: string, data: any) {
        this.server.to(room).emit(event, data);
    }

    updateUnreadMessageCount(event: string, room: string, data: any) {
        this.server.to(room).emit(event, data);
    }
}