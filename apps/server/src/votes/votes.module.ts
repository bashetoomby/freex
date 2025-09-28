import { Module, forwardRef } from '@nestjs/common';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { Votes } from './votes.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ChatsModule } from 'src/chats/chats.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  controllers: [VotesController],
  providers: [VotesService],
  imports: [
    SequelizeModule.forFeature([Votes]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    ChatsModule,
    MessagesModule
  ],
  exports: [VotesService]
})
export class VotesModule { }
