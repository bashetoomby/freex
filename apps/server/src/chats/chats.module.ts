import { forwardRef, Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Messages } from 'src/messages/messages.model';
import { Chats } from './chats.model';

import { AuthModule } from 'src/auth/auth.module';
import { UsersData } from 'src/user-data/users-data.model';
import { ChatsUserData } from './chats-user-data.model';
import { UsersDataModule } from 'src/user-data/users-data.module';
import { VotesModule } from 'src/votes/votes.module';
import { ChatsGateway } from './chats.gateway';
import { MessagesService } from 'src/messages/messages.service';
import { MessagesModule } from 'src/messages/messages.module';



@Module({
    providers: [ChatsService, ChatsGateway],
    controllers: [ChatsController],
    imports: [
        SequelizeModule.forFeature([Messages, Chats, UsersData, ChatsUserData]),
        AuthModule,
        forwardRef(() => UsersDataModule),
        forwardRef(() => MessagesModule),

    ],
    exports: [ChatsService, ChatsGateway]
})
export class ChatsModule { }
