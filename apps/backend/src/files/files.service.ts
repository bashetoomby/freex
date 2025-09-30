import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';

@Injectable()
export class FilesService {
    private readonly uploadPath: string;

    constructor() {
        this.uploadPath = '/images';
        this.ensureUploadDirectoryExists();
    }

    private ensureUploadDirectoryExists(): void {
        try {
            if (!fs.existsSync(this.uploadPath)) {
                fs.mkdirSync(this.uploadPath, { recursive: true });
                console.log(`Upload directory ready: ${this.uploadPath}`);
            }
        } catch (error) {
            console.error('Error accessing upload directory:', error);
            throw new HttpException(
                'Cannot access upload directory', 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async createFile(file): Promise<string> {
        try {
            const fileName = uuid.v4() + '.jpg';
            const fullPath = path.join(this.uploadPath, fileName);
            
            fs.writeFileSync(fullPath, file?.buffer);
            
            console.log(`File saved to: ${fullPath}`);
            return fileName;
        } catch (error) {
            console.log(error);
            throw new HttpException('Cannot upload file', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteFile(fileName: string): Promise<boolean> {
        try {
            const filePath = path.join(this.uploadPath, fileName);

            if (!fs.existsSync(filePath)) {
                console.log(`File not found: ${filePath}`);
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
            console.log(`File deleted: ${filePath}`);
            return true;

        } catch (error) {
            console.log(error);
            throw new HttpException('Cannot delete file', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    
}