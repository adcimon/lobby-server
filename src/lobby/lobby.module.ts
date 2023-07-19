import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersModule } from '../users/users.module';
import { RoomsModule } from '../rooms/rooms.module';
import { LobbyGateway } from './lobby.gateway';
import { NotificationService } from './notification.service';

@Module({
	imports: [AuthModule, SessionsModule, UsersModule, RoomsModule],
	controllers: [],
	providers: [LobbyGateway, NotificationService],
	exports: [],
})
export class LobbyModule {}
