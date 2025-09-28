import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript"
import { UsersData } from "src/user-data/users-data.model"



interface imagesCreateAttrs {
    fileName: string
}

@Table({ tableName: "images" })
export class Images extends Model<Images, imagesCreateAttrs>{
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    fileName: string

    @ForeignKey(() => UsersData)
    @Column({ type: DataType.INTEGER })
    userId: number

    @BelongsTo(() => UsersData)
    usersData: UsersData
}