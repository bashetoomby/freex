import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator"


export class SetUserDataDto {

    @IsOptional()
    @ApiProperty({ example: 22, description: "User`s age" })
    @IsNumber({ allowNaN: false, allowInfinity: false }, { message: "Must be number" })
    @Min(18)
    @Max(99)
    readonly age?: number

    @IsOptional()
    @ApiProperty({ example: "Kiev", description: "User`s city" })
    @MaxLength(15, { message: "Must be less then 30 symbols" })
    @IsString({ message: "Must be string" })
    readonly gender?: string

    @IsOptional()
    @MaxLength(15, { message: "Must be less then 30 symbols" })
    @IsString({ message: "Must be string" })
    readonly city?: string

    @IsOptional()
    @MaxLength(120, { message: "Must be less then 120 symbols" })
    @IsString({ message: "Must be string" })
    readonly location?: string

    @IsOptional()
    @ApiProperty({ example: "User description", description: "User`s description" })
    @MaxLength(320, { message: "Must be less then 320 symbols" })
    @IsString({ message: "Must be string" })
    readonly description?: string

    @IsOptional()
    @ApiProperty({ example: "David", description: "User`s name" })
    @MaxLength(15, { message: "Must be less then 20 symbols" })
    @IsString({ message: "Must be string" })
    readonly name?: string

    readonly fullfield: boolean

}

export class GetUserByIdDto {
    userId: number
}