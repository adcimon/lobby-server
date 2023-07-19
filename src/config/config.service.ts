import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { join } from 'path';

@Injectable()
export class ConfigService {
	constructor() {}

	static config(): any {
		config();

		console.log('Environment variables:');
		Object.keys(process.env).forEach(function (key) {
			console.log(key + '=' + process.env[key]);
		});
	}

	/**
	 * Get a configuration value.
	 */
	static get(key: string, defaultValue: any = null): any {
		if (key in process.env) {
			const value: string = process.env[key];
			switch (value) {
				case 'true':
					return true;
				case 'false':
					return false;
				default:
					return value;
			}
		} else {
			if (defaultValue) {
				return defaultValue;
			} else {
				return null;
			}
		}
	}

	/**
	 * Get a configuration value.
	 */
	get(key: string, defaultValue: any = null): any {
		return ConfigService.get(key, defaultValue);
	}

	/**
	 * Get the static path.
	 */
	getStaticPath(): string {
		return join(__dirname, process.env.STATIC_PATH);
	}

	/**
	 * Is a production environment?
	 */
	isProduction(): boolean {
		return process.env.NODE_ENV === 'production';
	}
}
