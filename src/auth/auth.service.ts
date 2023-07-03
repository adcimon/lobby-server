import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { JwtService } from '@nestjs/jwt';
import { InvalidTokenException } from '../exceptions/invalid-token.exception';

@Injectable()
export class AuthService
{
	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService
	) { }

	decode( token: string ): any
	{
		try
		{
			const payload: any = this.jwtService.decode(token);
			return payload;
		}
		catch( error: any )
		{
			throw new InvalidTokenException();
		}
	}

	async verify( token: string ): Promise<any>
	{
		try
		{
			const secret: string = await this.configService.get('TOKEN_SECRET');
			const payload: any = this.jwtService.verify(token, { secret: secret });
			return payload;
		}
		catch( error: any )
		{
			throw new InvalidTokenException();
		}
	}

	validatePayload( payload: any ): boolean
	{
		if( !payload )
		{
			return false;
		}

		if( !('sub' in payload) )
		{
			return false;
		}

		return true;
	}
}