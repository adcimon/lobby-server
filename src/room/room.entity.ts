import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';

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
}