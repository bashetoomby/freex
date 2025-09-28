import { Controller, Get, Put, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserDataGuard } from 'src/auth/user-data.guard';
import { ChatsService } from './chats.service';

@Controller('chats')
export class ChatsController {
    constructor(private chatsService: ChatsService) { }
    @Get('/get')
    @UseGuards(UserDataGuard)
    @UsePipes(ValidationPipe)
    getChats(@Req() req: any) {
        return this.chatsService.getChats(req.user.id)
    }
}
