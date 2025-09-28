import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersData } from './users-data.model';
import { UsersDataController } from './users-data.controller';
import { UsersDataService } from './users-data.service';
import { AuthModule } from 'src/auth/auth.module';
import { SearchParamsModule } from 'src/search-params/search-params.module';
import { Images } from 'src/images/images.model';
import { VotesModule } from 'src/votes/votes.module';

import { Chats } from 'src/chats/chats.model';
import { ChatsUserData } from 'src/chats/chats-user-data.model';
import { ChatsModule } from 'src/chats/chats.module';

@Module({
    providers: [UsersDataService],
    controllers: [UsersDataController],
    imports: [
        SequelizeModule.forFeature([UsersData, Images, Chats, ChatsUserData]),
        forwardRef(() => AuthModule),
        forwardRef(() => SearchParamsModule),
        VotesModule,
        forwardRef(() => ChatsModule),
    ],
    exports: [UsersDataService],
})
export class UsersDataModule { }
