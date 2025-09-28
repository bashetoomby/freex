import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";


@Injectable()
export class UserDataGuard implements CanActivate {

    constructor(private jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        try {
            const req = context.switchToHttp().getRequest()
            const authHeader = req.headers.authorization
            const bearer = authHeader.split(' ')[0]
            const token = authHeader.split(' ')[1]

            if (bearer !== 'Bearer' || !token) {
                throw new UnauthorizedException({ message: "User unauthorized" })
            }
            const user = this.jwtService.verify(token, { secret: process.env.JWT_ACCESS_SECRET })
            req.user = user
            return true
        } catch (error) {
            throw new HttpException("No access", HttpStatus.FORBIDDEN)
        }
    }
}