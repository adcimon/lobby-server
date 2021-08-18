import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService
{
    constructor()
    {
    }

    /**
     * Get a configuration value.
     * @param key
     * @param defaultValue
     * @returns any
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
     * Is a production environment?
     * @returns boolean
     */
    isProduction(): boolean
    {
        return process.env.NODE_ENV === 'production';
    }
}