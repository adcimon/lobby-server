import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne } from 'typeorm';
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

    // @OneToOne(() => Room, room => room.owner)
    // owned: Room;

    @ManyToOne(() => Room, room => room.users)
    room: Room;
}