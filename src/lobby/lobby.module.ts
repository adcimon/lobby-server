import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { RoomModule } from '../room/room.module';
import { LobbyGateway } from './lobby.gateway';

@Module({
    imports: [AuthModule, UserModule, RoomModule],
    controllers: [],
    providers: [LobbyGateway],
    exports: []
})
export class LobbyModule
{
}