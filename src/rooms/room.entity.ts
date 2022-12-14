import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer'; // Used with ClassSerializerInterceptor to exclude from responses.
import { User } from '../users/user.entity';

@Entity()
export class Room
{
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true, nullable: false })
	name: string;

	@Column({ default: '' })
	@Exclude() // Exclude from responses.
	password: string;

	@Column({ default: false })
	secured: boolean;

	@Column({ default: false })
	hidden: boolean;

	@Column({ type: "int" })
	size: number;

	@Column({ default: '' })
	icon: string;

	@OneToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'master' })
	master: User;

	@OneToMany(() => User, user => user.room, { cascade: true, onDelete: 'CASCADE' })
	users: User[];
}