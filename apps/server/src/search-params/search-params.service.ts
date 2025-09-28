import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SearchParams } from './search-params.model';
import { SetSearchParamsDto } from './dto/search-params.dto';
import { UsersDataService } from 'src/user-data/users-data.service';

@Injectable()
export class SearchParamsService {
    constructor(@InjectModel(SearchParams) private userRepository: typeof SearchParams,
        @Inject(forwardRef(() => UsersDataService))
        private usersDataService: UsersDataService,
    ) { }

    async createSearchParams(dto: SetSearchParamsDto) {
        const searchParams = await this.userRepository.create(dto)
        return searchParams
    }

    async setSearchParams(dto: SetSearchParamsDto, req: any) {
        const { location } = await this.usersDataService.getUserData(req)

        if (dto.maxAge <= dto.minAge) throw new HttpException('Max age must be more than min age', HttpStatus.BAD_REQUEST)
        if (dto.gender
            && dto.gender?.length !== 0
            && dto.gender !== 'woman'
            && dto.gender !== 'man') throw new HttpException('Gender ust be woman or man', HttpStatus.BAD_REQUEST)


        const [, [searchParams]] = await this.userRepository.update({ ...dto, distance: !location ? 80 : dto.distance },
            { where: { userId: req.user.id }, returning: true })

        if (!searchParams) throw new HttpException('DataBase Error, SearchParams not found', HttpStatus.INTERNAL_SERVER_ERROR)

        const isFullfield = Boolean(
            searchParams.gender &&
            searchParams.minAge &&
            searchParams.maxAge &&
            searchParams.distance
        )

        if (isFullfield) {
            await this.userRepository.update(
                { fullfield: true },
                { where: { userId: req.user.id }, }
            )
            searchParams.fullfield = true
        }

        return searchParams
    }

    async getSearchParams(req: any) {
        const searchParams = await this.userRepository.findOne({ where: { userId: req.user.id } })
        return searchParams
    }
}
