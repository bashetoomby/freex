import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Messages } from './messages.model';
import { ChatsService } from 'src/chats/chats.service';
import { ChatsGateway } from 'src/chats/chats.gateway';
import { Chats } from 'src/chats/chats.model';

@Injectable()
export class MessagesService {
    constructor(@InjectModel(Messages) private messagesRepository: typeof Messages,
        private chatsService: ChatsService, private chatsGateway: ChatsGateway) { }

    async createUserMessage(userId1, userId2, content, repliedToId) {

        const chat = await this.chatsService.findChat({ userId1, userId2 })
        if (chat) {

            const message = await this.messagesRepository.create({ messageType: 'user', message: content, userId: userId1, status: 'new', repliedToId: repliedToId, recipientId: userId2 })
            const messageWithReply = await this.messagesRepository.findByPk(message.id, {
                include: [
                    {
                        model: this.messagesRepository,
                        as: 'repliedTo',
                        attributes: ['id', 'message', 'userId', 'createdAt']
                    }
                ]
            });
            chat.$set('messages', [...chat.messages, message])
            chat.save()
            this.chatsGateway.sentMessage('sendMessage', 'room/' + userId1, { chat: chat, message: messageWithReply })
            this.chatsGateway.sentMessage('receiveMessage', 'room/' + userId2, { chat: chat, message: messageWithReply })
            this.updateUnreadMessageCount(userId2)
            return message
        }
        else {
            const chat = await this.chatsService.createChat({ userId1: userId1, userId2: userId2, chatType: 'spam' })
            const message = await this.messagesRepository.create({ messageType: 'user', message: content, userId: userId1, status: 'new', recipientId: userId2 })
            chat.$set('messages', [message])
            chat.save()
            this.chatsGateway.sentMessage('receiveMessage', 'room/' + userId1, { chat: chat, message: message.get() })
            this.chatsGateway.sentMessage('receiveMessage', 'room/' + userId2, { chat: chat, message: message.get() })
            this.updateUnreadMessageCount(userId2)
            return message
        }
    }
    async createSystemMessage(context: string, systemType: string, userId: number | null, chat: Chats) {
        const recepientId = chat.userId1 === userId ? chat.userId2 : chat.userId1
        const message = await this.messagesRepository.create({ messageType: 'system', message: context, systemType, status: 'new', recipientId: recepientId })
        this.chatsGateway.sentMessage('receiveMessage', 'room/' + chat.userId1, { chat: chat, message: message.get() })
        this.chatsGateway.sentMessage('receiveMessage', 'room/' + chat.userId2, { chat: chat, message: message.get() })
        this.updateUnreadMessageCount(chat.userId1)
        return message
    }

    async updateMessageStatus(arrayMessageId: number[], status: string) {
        const affectedCount = await this.messagesRepository.update(
            { status: status },
            {
                where: { id: arrayMessageId }
            }
        );
        const messagesList = await this.messagesRepository.findAll({
            where: { id: arrayMessageId },
            include: [
                {
                    model: Messages,
                    as: 'repliedTo',
                    attributes: ['id', 'message', 'createdAt', 'userId']
                }
            ]
        });
        this.chatsGateway.updateMessage('updateMessagesStatus', 'room/' + messagesList[0].userId, messagesList)
        this.updateUnreadMessageCount(messagesList[0].recipientId)
        return messagesList
    }

    async getUnreadMessagesCount(userId: number) {
        return await this.messagesRepository.count({
            where: {
                recipientId: userId,
                status: 'new'
            }
        })
    }

    async updateUnreadMessageCount(userId: number) {
        const unreadCount = await this.getUnreadMessagesCount(userId);
        this.chatsGateway.updateUnreadMessageCount('unreadCountUpdate', 'room/' + userId, { count: unreadCount });
    }
}
