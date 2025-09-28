import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Chats } from './chats.model';
import { UsersDataService } from 'src/user-data/users-data.service';
import { UsersData } from 'src/user-data/users-data.model';
import { Images } from 'src/images/images.model';
import { Messages } from 'src/messages/messages.model';




const { Op } = require("sequelize");

@Injectable()
export class ChatsService {
    constructor(@InjectModel(Chats) private chatsRepository: typeof Chats) { }

    async createChat({ userId1, userId2, chatType }: { userId1: number, userId2: number, chatType: string }) {
        const chat = await this.chatsRepository.create({ chatId: `${userId1}-${userId2}`, chatType: chatType, messages: [], userId1: userId1, userId2: userId2 })
        return chat
    }


    async findChat({ userId1, userId2 }: { userId1: number, userId2: number }): Promise<Chats | null> {
        const chat = await this.chatsRepository.findOne({
            where: {
                [Op.or]: [
                    { chatId: `${userId1}-${userId2}` },
                    { chatId: `${userId2}-${userId1}` },
                ]
            }, include: ['messages']
        })

        return chat
    }

    async updateChat({ chatId, chatType }: { chatId: string, chatType: string }) {
        const [affectedCount, chat] = await this.chatsRepository.update({ chatType: chatType }, { where: { chatId: chatId }, returning: true })
        return chat
    }

    async getChats(userId: number) {
        const chats = await this.chatsRepository.findAll({
            where: {
                [Op.or]: [
                    { userId1: userId },
                    { userId2: userId }
                ]
            },
            include: [
                {
                    model: Messages,
                    as: 'messages',
                    include: [
                        {
                            model: Messages,
                            as: 'repliedTo',
                        }
                    ]
                },
                {
                    model: UsersData,
                    as: 'user1Data',
                    include: [
                        {
                            model: Images,
                            as: 'images',
                            attributes: ['fileName']
                        }
                    ],
                    attributes: { exclude: ['location', 'updatedAt', 'id'] }
                },
                {
                    model: UsersData,
                    as: 'user2Data',
                    include: [
                        {
                            model: Images,
                            as: 'images',
                            attributes: ['fileName']
                        }
                    ],
                    attributes: { exclude: ['location', 'updatedAt', 'id'] }
                }
            ],
            order: [
                ['createdAt', 'DESC'],
                ['messages', 'createdAt', 'ASC']
            ]
        });

        return chats.map((chat) => {
            const interlocutorData = chat.userId1 === userId
                ? chat.user2Data
                : chat.user1Data;

            return {
                ...chat.toJSON(),
                userData: interlocutorData
            };
        });
    }
}
