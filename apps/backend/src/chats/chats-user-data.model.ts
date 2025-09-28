import { AutoIncrement, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Chats } from "./chats.model";
import { UsersData } from "src/user-data/users-data.model";



@Table({ tableName: 'chatsUserData' })
export class ChatsUserData extends Model<ChatsUserData> {

    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    })
    id: number

    @ForeignKey(() => Chats)
    @Column({
        type: DataType.STRING,
    })
    chatId: string

    @ForeignKey(() => UsersData)
    @Column({
        type: DataType.INTEGER,
    })
    userDataId: number
}