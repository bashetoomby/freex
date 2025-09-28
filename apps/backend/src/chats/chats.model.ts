
import { Column, DataType, HasMany, Table, Model, HasOne, ForeignKey, BelongsToMany, BelongsTo } from "sequelize-typescript";
import { Messages } from "src/messages/messages.model";
import { UsersData } from "src/user-data/users-data.model";
import { ChatsUserData } from "./chats-user-data.model";


@Table({ tableName: 'chats' })
export class Chats extends Model<Chats> {

    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    })
    id: number

    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false,
    })
    chatId: string

    @Column({
        type: DataType.INTEGER,
        unique: false,
        allowNull: false
    })
    userId1:number

    @Column({
        type: DataType.INTEGER,
        unique: false,
        allowNull: false
    })
    userId2:number

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    chatType: string

    @BelongsTo(() => UsersData, { foreignKey: 'userId1', as: 'user1Data' })
    user1Data: UsersData;

    @BelongsTo(() => UsersData, { foreignKey: 'userId2', as: 'user2Data' })
    user2Data: UsersData;


    @HasMany(() => Messages, { foreignKey: 'chatId', sourceKey: 'chatId' })
    messages: Messages[]

}