import { ApiProperty } from "@nestjs/swagger";
import { Column, DataType, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import { SearchParams } from "src/search-params/search-params.model";
import { UsersData } from "src/user-data/users-data.model";
import { Votes } from "src/votes/votes.model";

interface UserCreationAttrs {
    nickname: string
    password: string
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttrs>{


    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    })
    id: number

    @ApiProperty({ example: 'freex_user', description: 'nickname' })
    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false
    })
    nickname: string

    @ApiProperty({ example: 'password', description: 'password' })
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    password: string

    @ApiProperty({ example: 'Is user banned?', description: 'true' })
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    banned: boolean

    @ApiProperty({ example: 'Ban reason', description: 'spam' })
    @Column({
        type: DataType.STRING,
        defaultValue: '',
        allowNull: true
    })
    banReason: boolean

    @Column({
        type: DataType.STRING,
        defaultValue: '',
        allowNull: true
    })
    refreshToken: string
    @HasMany(() => Votes)
    votes: Votes[]
    @HasOne(() => UsersData)
    userData: UsersData

    @HasOne(() => SearchParams)
    searchParams: SearchParams


}