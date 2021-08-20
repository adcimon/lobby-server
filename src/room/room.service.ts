import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { UserService } from '../user/user.service';
import { UserAlreadyInRoomException } from '../exception/user-already-in-room.exception';
import { RoomAlreadyExistsException } from '../exception/room-already-exists.exception';
import { RoomNotFoundException } from '../exception/room-not-found.exception';
import { InvalidRoomPasswordException } from '../exception/invalid-room-password.exception';

@Injectable()
export class RoomService
{
    constructor(
        @InjectRepository(Room) private roomsRepository: Repository<Room>,
        private readonly userService: UserService
    ) { }

    /**
     * Get all the rooms.
     * @returns Room[]
     */
    async getAll(): Promise<Room[]>
    {
        return await this.roomsRepository.find({ relations: ['master', 'users'] });
    }

    /**
     * Get a room by name.
     * @param name
     * @return Room
     */
    async getByName(
        name: string
    ): Promise<Room>
    {
        const room = await this.roomsRepository.findOne({ where: { name }, relations: ['master', 'users'] });
        if( !room )
        {
            throw new RoomNotFoundException(name);
        }

        return room;
    }

    /**
     * Create a room.
     * @param username
     * @param name
     * @param password
     * @return Room
     */
    async create(
        username: string,
        name: string,
        password: string = ''
    ): Promise<Room>
    {
        // Check whether the room already exists.
        let room;
        try
        {
            room = await this.getByName(name);
        }
        catch( exception )
        {
            // Room not found catched.
        }
        if( room )
        {
            throw new RoomAlreadyExistsException(name);
        }

        // Check whether the user is in a room.
        let user;
        try
        {
            user = await this.userService.getByUsername(username);
        }
        catch( exception )
        {
            // User not found catched.
        }
        if( user )
        {
            throw new UserAlreadyInRoomException(username, user.room.name);
        }

        // Create the user.
        user = await this.userService.create(username);

        // Create the room.
        room = this.roomsRepository.create({
            name: name,
            password: password,
            master: user,
            users: [user]
        });

        return this.roomsRepository.save(room);
    }

    /**
     * Join a room.
     * @param username
     * @param name
     * @param password
     * @return Room
     */
    async join(
        username: string,
        name: string,
        password: string = ''
    ): Promise<Room>
    {
        const room = await this.getByName(name);
        if( room.password != password )
        {
            throw new InvalidRoomPasswordException(name);
        }

        // Check whether the user is in a room.
        let user;
        try
        {
            user = await this.userService.getByUsername(username);
        }
        catch( exception )
        {
            // User not found catched.
        }
        if( user )
        {
            throw new UserAlreadyInRoomException(username, user.room.name);
        }

        // Create the user.
        user = await this.userService.create(username);

        // Add the user to the room.
        room.users.push(user);

        return this.roomsRepository.save(room);
    }

    /**
     * Leave a room.
     * @param username
     * @return Room
     */
    async leave(
        username: string
    ): Promise<Room>
    {
        const user = await this.userService.getByUsername(username);
        const room = await this.getByName(user.room.name);

        // Check whether the user is the master of the room.
        if( room.master.id === user.id )
        {
            // Delete the room.
            return await this.delete(room.name);
        }
        else
        {
            // Delete the user.
            await this.userService.delete(user.username);

            return await this.getByName(room.name);
        }
    }

    /**
     * Delete the room.
     * @param name
     * @return Room
     */
    async delete(
        name: string
    ): Promise<Room>
    {
        const room = await this.getByName(name);
        return this.roomsRepository.remove(room);
    }
}