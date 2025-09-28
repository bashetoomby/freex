import { Body, Controller, Put, UseGuards, Req, UsePipes, Get, Post } from '@nestjs/common';
import { UsersDataService } from './users-data.service';
import { GetUserByIdDto, SetUserDataDto } from './dto/set-user-data.dto';
import { UserDataGuard } from 'src/auth/user-data.guard';
import { ValidationPipe } from 'src/pipes/validation.pipe';


@Controller('user-data')
export class UsersDataController {
    constructor(private usersDataService: UsersDataService) { }

    @Put('/set-data')
    @UseGuards(UserDataGuard)
    @UsePipes(ValidationPipe)
    setUserData(@Body() setUserDataDto: SetUserDataDto, @Req() req: any) {
        return this.usersDataService.setUserData(setUserDataDto, req)
    }

    @Get('/get-users-data')
    @UseGuards(UserDataGuard)
    @UsePipes(ValidationPipe)
    getUsersData(@Req() req: any) {
        return this.usersDataService.getUsersData(req)
    }
    @Get('/get-user-data')
    @UseGuards(UserDataGuard)
    @UsePipes(ValidationPipe)
    getUserData(@Req() req: any) {
        return this.usersDataService.getUserData(req)
    }

    @Post('/get-user-data-by-id')
    @UseGuards(UserDataGuard)
    @UsePipes(ValidationPipe)
    async getUserDataById(@Req() req: any, @Body() body: GetUserByIdDto) {
        const userData = await this.usersDataService.getUserDataById(body.userId)
        userData.location = ''
        return userData
    }
}
