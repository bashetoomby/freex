import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs'
import { User } from 'src/users/users.model';

@Injectable()
export class AuthService {

    constructor(private userService: UsersService,
        private jwtService: JwtService) { }

    async login(userDto: CreateUserDto) {
        const user = await this.validateUser(userDto)
        const tokens = await this.generateToken(user)
        await this.saveToken(user.id, tokens.refreshToken)
        return tokens
    }

    async logout(refreshToken: string) {
        const token = await this.removeToken(refreshToken)
        return token
    }

    async removeToken(refreshToken: string) {
        if (!refreshToken) {
            throw new HttpException('Token not exist', HttpStatus.BAD_REQUEST)
        }
        const user = await this.userService.findUserByToken(refreshToken)
        if (!user) {
            throw new HttpException('User with this token not found', HttpStatus.NOT_FOUND)
        }
        user.refreshToken = ''
        user.save()
        return user.refreshToken
    }

    async refreshToken(refreshToken: string) {
        if (!refreshToken) {
            throw new UnauthorizedException({ message: "RefreshToken not found" })
        }
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET
            });

            const user = await this.userService.getUserByUserId(payload.id);

            if (!user) {
                throw new UnauthorizedException({ message: "User not found" });
            }

            if (user.refreshToken !== refreshToken) {
                throw new UnauthorizedException({ message: "Invalid refresh token" });
            }

            const tokens = await this.generateToken(user);
            await this.saveToken(user.id, tokens.refreshToken);
            return tokens;
        } catch (error) {
            throw new UnauthorizedException({ message: "Invalid refresh token" });
        }
    }

    async registration(userDto: CreateUserDto) {
        const candidate = await this.userService.getUserByNickname(userDto.nickname)
        if (candidate) {
            throw new HttpException('User already exist', HttpStatus.CONFLICT)
        }
        const hashPassword = await bcrypt.hash(userDto.password, 5)
        const user = await this.userService.createUser({ ...userDto, password: hashPassword })
        const tokens = await this.generateToken(user)
        await this.saveToken(user.id, tokens.refreshToken)
        return tokens
    }

    private async generateToken(user: User) {
        const payload = { nickname: user.nickname, id: user.id, fullfield: user.userData.fullfield }
        return {
            accessToken: this.jwtService.sign(payload, { expiresIn: '30s', secret: process.env.JWT_ACCESS_SECRET }),
            refreshToken: this.jwtService.sign(payload, { expiresIn: '24d', secret: process.env.JWT_REFRESH_SECRET })
        }
    }

    private async saveToken(userId: number, refreshToken: string) {
        const user = await this.userService.getUserByUserId(userId)
        if (user) {
            user.refreshToken = refreshToken
            user.save()
        }
    }

    private async validateUser(userDto: CreateUserDto) {
        const user = await this.userService.getUserByNickname(userDto.nickname)
        const passwordEquals = await bcrypt.compare(userDto.password, user?.password || '')
        if (user && passwordEquals) {
            return user
        }
        throw new UnauthorizedException({ message: 'Wrong nickname or password', })
    }
}
