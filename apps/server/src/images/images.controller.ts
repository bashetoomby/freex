import { Body, Controller, Delete, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ImagesService } from './images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserDataGuard } from 'src/auth/user-data.guard';
import { DeleteImageDto } from './dto/delete-message.dto';




@Controller('images')
export class ImagesController {

    constructor(private imagesService: ImagesService) { }

    @Post('/set-image')
    @UseGuards(UserDataGuard)
    @UseInterceptors(FileInterceptor('profileImage'))
    createImage(@UploadedFile() image, @Req() req: any) {
        return this.imagesService.createImage(image, req)
    }

    @Delete('/delete-image')
    @UseGuards(UserDataGuard)
    @UseInterceptors(FileInterceptor('profileImage'))
     deleteImage(@Body() body: DeleteImageDto, @Req() req: any) {
        return this.imagesService.deleteImage(body.fileName, req);
    }


}
