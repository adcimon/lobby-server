import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { JwtService } from '@nestjs/jwt';
import { InvalidTokenException } from '../exception/invalid-token.exception';

@Injectable()
export class AuthService
{
	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService
	) { }

	verify( token: string ): any
	{
		try
		{
			const payload: any = this.jwtService.verify(token, this.configService.get('TOKEN_SECRET_KEY'));
			return payload;
		}
		catch( exception: any )
		{
			throw new InvalidTokenException();
		}
	}
}