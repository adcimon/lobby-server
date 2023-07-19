import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Room } from './room.entity';
import { RoomsService } from './rooms.service';

@Module({
	imports: [ConfigModule, TypeOrmModule.forFeature([Room]), UsersModule],
	controllers: [],
	providers: [RoomsService],
	exports: [RoomsService],
})
export class RoomsModule {}
