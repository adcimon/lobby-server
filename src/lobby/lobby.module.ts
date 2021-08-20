import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { RoomModule } from '../room/room.module';
import { LobbyGateway } from './lobby.gateway';
import { UuidInterceptor } from './uuid.interceptor';

@Module({
    imports: [AuthModule, UserModule, RoomModule],
    controllers: [],
    providers: [LobbyGateway, UuidInterceptor],
    exports: []
})
export class LobbyModule
{
}