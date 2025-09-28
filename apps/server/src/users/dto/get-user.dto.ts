import { IsNumber } from "class-validator";



export class GetUserDto {
    @IsNumber({ allowNaN: false, allowInfinity: false }, { message: "Must be number" })
    readonly userId: number
}