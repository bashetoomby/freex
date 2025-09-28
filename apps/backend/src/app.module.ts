import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from './users/users.module';
import { User } from "./users/users.model";
import { AuthModule } from './auth/auth.module';
import { UsersDataModule } from './user-data/users-data.module';
import { UsersData } from "./user-data/users-data.model";
import { SearchParamsModule } from './search-params/search-params.module';
import { SearchParams } from "./search-params/search-params.model";
import { ImagesModule } from './images/images.module';
import { Images } from "./images/images.model";
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from "@nestjs/serve-static";
import { VotesModule } from './votes/votes.module';
import * as path from 'path'
import { Votes } from "./votes/votes.model";
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
import { Chats } from "./chats/chats.model";
import { Messages } from "./messages/messages.model";
import { ChatsUserData } from "./chats/chats-user-data.model";



@Module({
    controllers: [],
    providers: [],
    imports: [

        ConfigModule.forRoot({
            envFilePath: `.${process.env.NODE_ENV}.env`
        }),
        ServeStaticModule.forRoot({
            rootPath: path.resolve(__dirname, '../', 'static'),
        }),
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: process.env.DATABASE_HOST,
            database: process.env.DATABASE_NAME,
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            autoLoadModels: true,
            models: [User, UsersData, SearchParams, Images, Votes, Chats, Messages, ChatsUserData],
        }),
        ChatsModule,
        UsersModule,
        AuthModule,
        UsersDataModule,
        SearchParamsModule,
        ImagesModule,
        FilesModule,
        VotesModule,
        MessagesModule,

    ]
})
export class AppModule { }