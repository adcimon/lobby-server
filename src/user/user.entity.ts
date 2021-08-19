import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Room } from '../room/room.entity';

@Entity()
export class User
{
    @PrimaryGeneratedColumn()
    @Exclude() // Used with class serializer interceptor to exclude from responses.
    id: number;

    @Column({ unique: true, nullable: false })
    username: string;

    @ManyToOne(() => Room, room => room.users, { onDelete: 'CASCADE' })
    room: Room;
}