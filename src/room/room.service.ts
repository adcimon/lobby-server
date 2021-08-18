import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { UserService } from '../user/user.service';
import { RoomAlreadyExistsException } from '../exception/room-already-exists.exception';
import { RoomNotFoundException } from '../exception/room-not-found.exception';

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
        return await this.roomsRepository.find();
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
        const room = this.roomsRepository.findOne({ where: { name } });
        if( !room )
        {
            throw new RoomNotFoundException(name);
        }

        return room;
    }

    /**
     * Create a room.
     * @param name
     * @param password
     * @return Room
     */
    async create(
        name: string,
        password: string
    ): Promise<Room>
    {
        let room = await this.roomsRepository.findOne({ where: { name } });
        if( room )
        {
            throw new RoomAlreadyExistsException(name);
        }

        room = this.roomsRepository.create({
            name: name,
            password: password
        });

        return this.roomsRepository.save(room);
    }
}