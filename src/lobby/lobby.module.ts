import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { RoomModule } from '../room/room.module';
import { SessionModule } from '../session/session.module';
import { LobbyGateway } from './lobby.gateway';
import { NotificationService } from './notification.service';

@Module({
    imports: [AuthModule, UserModule, RoomModule, SessionModule],
    controllers: [],
    providers: [LobbyGateway, NotificationService],
    exports: []
})
export class LobbyModule
{
}