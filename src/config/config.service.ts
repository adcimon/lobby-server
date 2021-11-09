import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class ConfigService
{
    constructor()
    {
    }

    /**
     * Get a configuration value.
     */
    get( key: string, defaultValue: any = null ): any
    {
        if( key in process.env )
        {
            return process.env[key];
        }
        else
        {
            if( defaultValue )
            {
                return defaultValue;
            }
            else
            {
                return null;
            }
        }
    }

    /**
     * Get the static path.
     */
    getStaticPath(): string
    {
        return join(__dirname, process.env.STATIC_PATH);
    }

    /**
     * Is a production environment?
     */
    isProduction(): boolean
    {
        return process.env.NODE_ENV === 'production';
    }
}