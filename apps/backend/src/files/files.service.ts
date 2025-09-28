import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs'
import * as path from 'path'
import * as uuid from 'uuid'

@Injectable()
export class FilesService {

    async createFile(file): Promise<string> {
        try {
            const fileName = uuid.v4() + '.jpg'
            const filePath = path.resolve(__dirname, '../../static', 'images')
            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, { recursive: true })
            }
            fs.writeFileSync(path.join(filePath, fileName), file?.buffer)
            return fileName
        } catch (error) {
            console.log(error);
            throw new HttpException('Cannot uploud file', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async deleteFile(fileName: string): Promise<boolean> {
        try {

            const filePath = path.resolve(__dirname, '../../static', 'images', fileName);

            // Проверяем существование файла
            if (!fs.existsSync(filePath)) {
                return false;
            }

            const stats = fs.statSync(filePath);
            if (!stats.isFile()) {
                throw new HttpException(
                    'Path is not a file',
                    HttpStatus.BAD_REQUEST
                );
            }

            fs.unlinkSync(filePath);
            return true;

        } catch (error) {
            console.log(error);
            throw new HttpException('Cannot delete file', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

}
