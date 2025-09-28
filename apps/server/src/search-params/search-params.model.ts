import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript"
import { User } from "src/users/users.model"


interface searchParamsCreateAttr {
    gender: string
    distance: number
    minAge: number
    maxAge: number
}


@Table({ tableName: "searchParams" })
export class SearchParams extends Model<SearchParams, searchParamsCreateAttr>{

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    gender: string

    @Column({
        type: DataType.INTEGER  ,
        allowNull: true,
    })
    distance: number

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    minAge: number
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    maxAge: number
    
    @Column({
        type: DataType.BOOLEAN,
        allowNull: true,
    })
    fullfield: boolean

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER })
    userId: number

    @BelongsTo(() => User)
    user: User
}