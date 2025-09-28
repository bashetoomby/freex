import { Module, forwardRef } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Images } from './images.model';
import { AuthModule } from 'src/auth/auth.module';
import { FilesModule } from 'src/files/files.module';
import { UsersData } from 'src/user-data/users-data.model';
import { UsersDataModule } from 'src/user-data/users-data.module';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService],
  imports: [
    SequelizeModule.forFeature([Images, UsersData]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersDataModule),
    FilesModule,
  ],
  exports: [ImagesService]
})
export class ImagesModule { }
