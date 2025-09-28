import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UsersData } from './users-data.model';
import { SetUserDataDto } from './dto/set-user-data.dto';
import { SearchParamsService } from 'src/search-params/search-params.service';
import { VotesService } from 'src/votes/votes.service';
import calcDistance from 'src/uitls/calcDistance';


const { Op } = require("sequelize");

@Injectable()
export class UsersDataService {

    constructor(@InjectModel(UsersData) private userRepository: typeof UsersData,

        @Inject(forwardRef(() => SearchParamsService))
        private searchParamsService: SearchParamsService,
        private votesService: VotesService,

    ) { }

    async createUserData(dto: SetUserDataDto) {
        const userData = await this.userRepository.create(dto)
        return userData
    }

    async setUserData(dto: SetUserDataDto, req: any) {
        if (dto.gender
            && dto.gender?.length !== 0
            && dto.gender !== 'woman'
            && dto.gender !== 'man') throw new HttpException('Gender must be woman or man', HttpStatus.BAD_REQUEST)
        const [, [userData]] = await this.userRepository.update(dto, { where: { userId: req.user.id }, returning: true })
        const coordRegExp = /^-?\d+(?:\.\d+)?\s-?\d+(?:\.\d+)?$/
        if (dto.location && !coordRegExp.test(dto.location)) {
            throw new HttpException('Invalid coord', HttpStatus.BAD_REQUEST)
        }
        const isFullfield = Boolean(
            userData.age &&
            userData.gender &&
            userData.city?.length > 0
        );
        if (isFullfield) {
            await this.userRepository.update(
                { fullfield: isFullfield },
                { where: { userId: req.user.id } }
            );
            userData.fullfield = isFullfield;

        }
        return userData
    }

    async getUserData(req: any) {
        const id = req.user.id
        const userData = await this.userRepository.findOne({ where: { id }, include: ['images'] })
        return userData
    }

    async getUserDataById(id: number) {
        const userData = await this.userRepository.findOne({ where: { id }, include: ['images'] })
        return userData
    }

    async getUsersData(req: any): Promise<any> {
        const searchParams = await this.searchParamsService.getSearchParams(req)
        const userData = await this.getUserData(req)

        if (!searchParams.gender
            || !searchParams.minAge
            || !searchParams.maxAge
            || !searchParams.distance
            || !searchParams) {
            throw new HttpException("User without searchParams", HttpStatus.FORBIDDEN)
        }
        else if (!userData || !userData.location) {
            throw new HttpException("User without userData", HttpStatus.FORBIDDEN)
        }
        const usersData = await this.userRepository.findAll({
            where: {
                gender: searchParams.gender,
                age: { [Op.between]: [searchParams.minAge, searchParams.maxAge] },
                userId: {
                    [Op.ne]: req.user.id
                }
            },
            include: ['images'],
            attributes: {
                exclude: ['location']
            }
        })

        const votes = await this.votesService.getVotesById(req.user.id)
        const votesId: number[] = votes.map((item) => item.votedUserId)
        return {
            usersData: userData.location ?
                usersData.sort((a, b) => {
                    if (votesId.includes(a.userId) && !votesId.includes(b.userId)) return -1
                    else return 1
                })
                : userData
            ,

            usersIdVotes: votes
        }



    }
}
