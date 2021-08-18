import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserAlreadyExistsException } from '../exception/user-already-exists.exception';
import { UserNotFoundException } from '../exception/user-not-found.exception';

@Injectable()
export class UserService
{
    constructor( @InjectRepository(User) private usersRepository: Repository<User> )
    {
    }

    /**
     * Get all the users.
     * @returns User[]
     */
    async getAll(): Promise<User[]>
    {
        return await this.usersRepository.find();
    }

    /**
     * Get a user by username.
     * @param username
     * @return User
     */
    async getByUsername(
        username: string
    ): Promise<User>
    {
        const user = this.usersRepository.findOne({ where: { username } });
        if( !user )
        {
            throw new UserNotFoundException(username);
        }

        return user;
    }

    /**
     * Create a user.
     * @param username
     * @return User
     */
    async create(
        username: string
    ): Promise<User>
    {
        let user = await this.usersRepository.findOne({ where: { username } });
        if( user )
        {
            throw new UserAlreadyExistsException(username);
        }

        user = this.usersRepository.create({
            username: username
        });

        return this.usersRepository.save(user);
    }
}