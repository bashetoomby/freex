import { Body, Controller, Post, Put, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { VotesService } from './votes.service';
import { GetVoteByIdDto, VotesDto } from './dto/votes.dto';
import { UserDataGuard } from 'src/auth/user-data.guard';

@Controller('votes')
export class VotesController {
    constructor(private votesService: VotesService) { }

    @Put('/write-vote')
    @UseGuards(UserDataGuard)
    @UsePipes(ValidationPipe)
    vote(@Body() votesDto: VotesDto, @Req() req: any) {
        return this.votesService.vote(votesDto, req)
    }

}
