import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../user/user.entity';

@Entity()
export class Room
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: false })
    name: string;

    @Column({ default: '' })
    @Exclude() // Used with class serializer interceptor to exclude from responses.
    password: string;

    @OneToMany(() => User, user => user.id)
    users: User[];
}