import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import * as fs from 'fs';

async function bootstrap() {
	let httpsOptions: HttpsOptions = null;
	if (ConfigService.get('ENABLE_HTTPS')) {
		httpsOptions = {};
		httpsOptions['key'] = fs.readFileSync(ConfigService.get('KEY_PATH'));
		httpsOptions['cert'] = fs.readFileSync(ConfigService.get('CERT_PATH'));
	}

	const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule, {
		httpsOptions: httpsOptions,
	});
	app.useWebSocketAdapter(new WsAdapter(app));

	if (ConfigService.get('ENABLE_CORS')) {
		app.enableCors();
	}

	const port: number = ConfigService.get('PORT') || 9000;
	await app.listen(port);

	const url: string = await app.getUrl();
	console.log(`🚀 Service running on ${url}`);
}

ConfigService.config();
bootstrap();
