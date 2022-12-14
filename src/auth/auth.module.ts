import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { AuthService } from './auth.service';
import { AuthInterceptor } from './auth.interceptor';

@Module({
	imports:
	[
		ConfigModule,
		JwtModule.registerAsync(
		{
			inject: [ConfigService],
			useFactory: ( configService: ConfigService ) =>
			{
				return {
					secret: configService.get('TOKEN_SECRET_KEY')
				};
			}
		})
	],
	controllers: [],
	providers: [AuthService, AuthInterceptor],
	exports: [JwtModule, AuthService, AuthInterceptor]
})
export class AuthModule
{
}