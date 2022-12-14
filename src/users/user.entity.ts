import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer'; // Used with ClassSerializerInterceptor to exclude from responses.
import { Room } from '../rooms/room.entity';

@Entity()
export class User
{
	@PrimaryGeneratedColumn()
	@Exclude() // Exclude from responses.
	id: number;

	@Column({ unique: true, nullable: false })
	username: string;

	@ManyToOne(() => Room, room => room.users, { onDelete: 'CASCADE' })
	room: Room;
}