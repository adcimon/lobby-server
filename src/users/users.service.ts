import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

@Injectable()
export class UsersService {
	constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

	/**
	 * Get all the users.
	 */
	public async getAll(): Promise<User[]> {
		return await this.usersRepository.find({ relations: ['room'] });
	}

	/**
	 * Get a user by username.
	 */
	public async getByUsername(username: string): Promise<User> {
		const user: User = await this.usersRepository.findOne({ where: { username }, relations: ['room'] });
		if (!user) {
			throw new UserNotFoundException(username);
		}

		return user;
	}

	/**
	 * Create a user.
	 */
	public async create(username: string): Promise<User> {
		let user: User = await this.usersRepository.findOne({ where: { username } });
		if (user) {
			throw new UserAlreadyExistsException(username);
		}

		user = this.usersRepository.create({
			username: username,
		});

		return this.usersRepository.save(user);
	}

	/**
	 * Delete the user.
	 */
	public async delete(username: string): Promise<User> {
		const user: User = await this.getByUsername(username);
		return this.usersRepository.remove(user);
	}
}
