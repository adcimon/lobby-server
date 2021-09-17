import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import { config } from 'dotenv';

async function bootstrap()
{
    console.log("Environment variables:");
    Object.keys(process.env).forEach(function( key )
    {
        console.log(key + '=' + process.env[key]);
    });

    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.enableCors();
    app.useWebSocketAdapter(new WsAdapter(app));

    await app.listen(process.env.PORT || 9000);

    console.log(`Application running on: ${await app.getUrl()}`);
}

config();
bootstrap();