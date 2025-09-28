import { Body, Controller, Get, Put, Req, UseGuards, UsePipes } from '@nestjs/common';
import { SearchParamsService } from './search-params.service';
import { UserDataGuard } from 'src/auth/user-data.guard';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { SetSearchParamsDto } from './dto/search-params.dto';
import { UsersDataService } from 'src/user-data/users-data.service';

@Controller('search-params')
export class SearchParamsController {
    constructor(private searchParamsService: SearchParamsService, private usersDataService: UsersDataService,) { }

    @Put('/set-params')
    @UseGuards(UserDataGuard)
    @UsePipes(ValidationPipe)
    async setSearchParams(@Body() setUserDataDto: SetSearchParamsDto, @Req() req: any) {
        return this.searchParamsService.setSearchParams(setUserDataDto, req)
    }

    @Get('/get-params')
    @UseGuards(UserDataGuard)
    @UsePipes(ValidationPipe)
    async getSearchParams(@Req() req: any) {
        const searchParams = await this.searchParamsService.getSearchParams(req)
        const { location } = await this.usersDataService.getUserData(req)
        return {
            searchParams: searchParams,
            location: location ? true : false
        }
    }
}
