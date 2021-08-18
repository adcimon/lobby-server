import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Room } from './room.entity';
import { RoomService } from './room.service';

@Module({
    imports: [TypeOrmModule.forFeature([Room]), UserModule],
    controllers: [],
    providers: [RoomService],
    exports: [RoomService]
})
export class RoomModule
{
}