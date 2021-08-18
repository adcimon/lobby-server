import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RoomModule } from 'src/room/room.module';
import { LobbyGateway } from './lobby.gateway';

@Module({
    imports: [AuthModule, RoomModule],
    controllers: [],
    providers: [LobbyGateway],
    exports: []
})
export class LobbyModule
{
}