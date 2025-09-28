import { ApiProperty } from "@nestjs/swagger"
import { IsString, Length, Matches } from "class-validator"

export class CreateUserDto {

    @ApiProperty({ example: "nickname", description: "User nickname" })
    @IsString({ message: 'Must be string' })
    @Length(4, 12, { message: 'No less than four and no more than twelve' })
    @Matches(/^\S*$/, {message: 'Nickname must not contain spaces.'})
    readonly nickname: string

    @ApiProperty({ example: "password", description: "User password" })
    @IsString({ message: 'Must be string' })
    @Length(4, 16, { message: 'No less than four and no more than sixteen' })
    @Matches(/^\S*$/, {message: 'Password must not contain spaces.'})
    readonly password: string

}