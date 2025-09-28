
import { BelongsTo, Column, DataType, Table, Model, ForeignKey, AllowNull } from "sequelize-typescript";
import { Chats } from "src/chats/chats.model";



@Table({ tableName: 'messages' })
export class Messages extends Model<Messages> {


    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    })
    id: number

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    messageType: string
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    systemType: string
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    status: string


    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    userId: number | null

    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    recipientId: number

    @ForeignKey(() => Messages)
    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    repliedToId: number | null;


    @BelongsTo(() => Messages, { foreignKey: 'repliedToId' })
    repliedTo: Messages;

    @Column({
        type: DataType.TEXT,
        allowNull: true
    })
    message: string

    @ForeignKey(() => Chats)
    @Column({
        type: DataType.STRING,
    })
    chatId: string;

    @BelongsTo(() => Chats, { foreignKey: 'chatId', targetKey: 'chatId' })
    chat: Chats;
}