import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { ConfigService } from '../config/config.service';
import { UserService } from '../user/user.service';
import { UserNotInRoomException } from '../exception/user-not-in-room.exception';
import { UserAlreadyInRoomException } from '../exception/user-already-in-room.exception';
import { RoomNotFoundException } from '../exception/room-not-found.exception';
import { RoomAlreadyExistsException } from '../exception/room-already-exists.exception';
import { RoomFullException } from '../exception/room-full.exception';
import { InvalidRoomPasswordException } from '../exception/invalid-room-password.exception';

@Injectable()
export class RoomService
{
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Room) private roomsRepository: Repository<Room>,
        private readonly userService: UserService
    ) { }

    /**
     * Get all the rooms.
     */
    async getAll( excludeHidden: boolean = false ): Promise<Room[]>
    {
        if( excludeHidden )
        {
            return await this.roomsRepository.find({ where: { hidden: false }, relations: ['master', 'users'] });
        }
        else
        {
            return await this.roomsRepository.find({ relations: ['master', 'users'] });
        }
    }

    /**
     * Get a room by name.
     */
    async getByName( name: string ): Promise<Room>
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
     */
    async create(
        username: string,
        name: string,
        password: string,
        hidden: boolean,
        size: number,
        icon: string
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
            secured: !(password === "" || password === null || password == undefined),
            hidden: hidden,
            size: (size === null || size === undefined || size <= 0 || size > Number(this.configService.get('ROOM_MAX_SIZE'))) ? Number(this.configService.get('ROOM_MAX_SIZE')) : size,
            icon: icon,
            master: user,
            users: [user]
        });

        return this.roomsRepository.save(room);
    }

    /**
     * Join a room.
     */
    async join(
        username: string,
        name: string,
        password: string
    ): Promise<Room>
    {
        const room = await this.getByName(name);

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

        // Check if the room is full.
        if( room.users.length === room.size )
        {
            throw new RoomFullException(name);
        }

        // Check if the password is correct.
        if( room.password != password )
        {
            throw new InvalidRoomPasswordException(name);
        }

        // Create the user.
        user = await this.userService.create(username);

        // Add the user to the room.
        room.users.push(user);

        return this.roomsRepository.save(room);
    }

    /**
     * Leave a room.
     */
    async leave(
        username: string
    ): Promise<Room>
    {
        let user;
        try
        {
            user = await this.userService.getByUsername(username);
        }
        catch( exception )
        {
            // User not found catched.
            throw new UserNotInRoomException(username);
        }

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
     */
    async delete(
        name: string
    ): Promise<Room>
    {
        const room = await this.getByName(name);
        return this.roomsRepository.remove(room);
    }
}