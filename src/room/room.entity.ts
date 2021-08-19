import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, OneToMany } from 'typeorm';
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

    // @OneToOne(() => User, user => user.owned)
    // @JoinColumn()
    // owner: User;

    @OneToMany(() => User, user => user.room, { cascade: ['insert', 'update'] })
    users: User[];
}