import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Votes } from './votes.model';
import { VotesDto } from './dto/votes.dto';
import { UsersService } from 'src/users/users.service';
import { ChatsService } from 'src/chats/chats.service';
import { MessagesService } from 'src/messages/messages.service';
import { ChatsGateway } from 'src/chats/chats.gateway';
const { Op } = require("sequelize");
@Injectable()
export class VotesService {
    constructor(@InjectModel(Votes) private voteRepository: typeof Votes,
        private chatsService: ChatsService,
        @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
        private messagesService: MessagesService,
    ) { }

    async vote(dto: VotesDto, req: any) {
        const user = await this.usersService.getUserByUserIdWithVotes(req.user.id)
        const candidat = await this.voteRepository.findOne({ where: { userId: req.user.id, votedUserId: dto.votedUserId } })
        const opponent = await this.voteRepository.findOne({ where: { userId: dto.votedUserId, votedUserId: req.user.id } })

        if (candidat) {
            await this.voteRepository.update(dto, { where: { userId: req.user.id, votedUserId: dto.votedUserId } })
        }
        else {
            const vote = await this.voteRepository.create(dto)
            await user.$set('votes', [...user.votes, vote])
            user.save()
        }

        const chat = await this.chatsService.findChat({ userId1: req.user.id, userId2: dto.votedUserId })
        if (dto.vote && !candidat?.vote) {

            if (chat) {
                const updatedChat = await this.chatsService.updateChat({ chatId: chat.chatId, chatType: `${opponent?.vote ? 'match' : 'spam'}` })
                const message = await this.messagesService.createSystemMessage(`&${req.user.id}& liked &${dto.votedUserId}&`, 'liked', req.user.id, updatedChat[0])
                chat.$set('messages', [...chat.messages, message])
                chat.save()
            }
            else {
                const chat = await this.chatsService.createChat({ userId1: req.user.id, userId2: dto.votedUserId, chatType: `spam` })
                const message = await this.messagesService.createSystemMessage(`&${req.user.id}& liked &${dto.votedUserId}&`, 'liked', req.user.id, chat)
                chat.$set('messages', [message])
                chat.save()
            }
        }

        else if (!dto.vote && candidat?.vote) {
            if (chat) {
                const updatedChat = await this.chatsService.updateChat({ chatId: chat.chatId, chatType: 'spam' })
                const message = await this.messagesService.createSystemMessage(`&${req.user.id}& disliked &${dto.votedUserId}&`, 'disliked', req.user.id, updatedChat[0])
                chat.$set('messages', [...chat.messages, message])
                chat.save()
            }

        }

        return HttpStatus.OK
    }

    async getVotesById(id: number) {
        const votes = this.voteRepository.findAll({ where: { userId: id } })
        return votes
    }


}
