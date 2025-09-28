import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Images } from './images.model';
import { FilesService } from 'src/files/files.service';
import { UsersDataService } from 'src/user-data/users-data.service';


@Injectable()
export class ImagesService {
    constructor(@InjectModel(Images) private userRepository: typeof Images,
        private filesService: FilesService, private usersDataService: UsersDataService) { }

    async createImage(file: any, req: any) {

        const userData = await this.usersDataService.getUserData(req)
        if (userData.images.length < 10) {
            const fileName = await this.filesService.createFile(file)
            const image = await this.userRepository.create({ fileName: fileName })

            await userData.$set('images', [image, ...userData.images])
            return {
                status: HttpStatus.CREATED,
                fileName: fileName,
            };
        }

        throw new HttpException('Too many images', HttpStatus.NOT_ACCEPTABLE)
    }

    async deleteImage(fileName: string, req: any) {
        try {
            const userData = await this.usersDataService.getUserData(req);
            const image = await this.userRepository.findOne({ where: { fileName: fileName } })
            if (!image) {
                throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
            }
            const userHasImage = userData.images.some(userImage => userImage.fileName === fileName);
            if (!userHasImage) {
                throw new HttpException(
                    'Access denied: You can only delete your own images',
                    HttpStatus.FORBIDDEN
                );
            }

            const fileDeleted = await this.filesService.deleteFile(image.fileName);

            if (!fileDeleted) {
                console.warn(`File ${image.fileName} was not found during deletion`);
            }

            await this.userRepository.destroy({
                where: { fileName: fileName }
            });

            return  {
                status: HttpStatus.OK,
                fileName: fileName,
            };
        } catch (error) {
            throw new HttpException(
                'Failed to delete image',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

}
