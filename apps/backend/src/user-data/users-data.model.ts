
import { Column, DataType, Table, Model, BelongsTo, ForeignKey, HasMany, BelongsToMany } from "sequelize-typescript";
import { Chats } from "src/chats/chats.model";
import { Images } from "src/images/images.model";
import { User } from "src/users/users.model";


interface usersDataCreateAttrs {
    userId: number
    age: number
    city: string
    description: string
    name: string
    gender: string
    location: string
}

@Table({ tableName: "users-data" })
export class UsersData extends Model<UsersData, usersDataCreateAttrs> {

    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    age: number

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    city: string

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    location: string

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    description: string

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    name: string

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    gender: string

    @Column({
        type: DataType.BOOLEAN,
        allowNull: true
    })
    fullfield: boolean

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER })
    userId: number

    @BelongsTo(() => User)
    user: User
    

    
    @HasMany(() => Chats, { foreignKey: 'userId1' })
    chatsAsUser1: Chats[];
    
    @HasMany(() => Chats, { foreignKey: 'userId2' })
    chatsAsUser2: Chats[];

    @HasMany(() => Images)
    images: Images[]

    distance: number
}