import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoomModule } from './room/room.module';
import { LobbyModule } from './lobby/lobby.module';
import { SessionModule } from './session/session.module';
import { ConfigService } from './config/config.service';

@Module({
    imports: [
        ConfigModule,
        ServeStaticModule.forRootAsync(
        {
            inject: [ConfigService],
            useFactory: ( configService: ConfigService ) =>
            {
                return [{ rootPath: configService.getStaticPath() }];
            }
        }),
        TypeOrmModule.forRootAsync(
        {
            inject: [ConfigService],
            useFactory: ( configService: ConfigService ) =>
            {
                return {
                    type: configService.get('DATABASE_TYPE'),
                    host: configService.get('DATABASE_HOST'),
                    port: configService.get('DATABASE_PORT'),
                    username: configService.get('DATABASE_USERNAME'),
                    password: configService.get('DATABASE_PASSWORD'),
                    database: configService.get('DATABASE_NAME'),
                    entities: [configService.get('DATABASE_ENTITIES')],
                    synchronize: !configService.isProduction()
                };
            },
        }),
        AuthModule,
        UserModule,
        RoomModule,
        LobbyModule,
        SessionModule
    ],
    controllers: [],
    providers: [],
    exports: []
})
export class AppModule
{
}