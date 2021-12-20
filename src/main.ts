import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap()
{
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.useWebSocketAdapter(new WsAdapter(app));
    if( ConfigService.get('ENABLE_CORS') )
    {
        app.enableCors();
    }

    await app.listen(ConfigService.get('PORT') || 9000);

    console.log(`🚀 Server running on: ${await app.getUrl()}`);
}

ConfigService.config();
bootstrap();