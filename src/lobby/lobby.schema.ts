import * as yup from 'yup';
import { ValidationSchema } from '../validation/validation.schema';

const PingSchema = yup.object().shape({
	uuid: ValidationSchema.UuidSchema.required('UUID is required'),
	token: ValidationSchema.TokenSchema.required('Token is required'),
});

const GetRoomSchema = yup.object().shape({
	uuid: ValidationSchema.UuidSchema.required('UUID is required'),
	token: ValidationSchema.TokenSchema.required('Token is required'),
});

const GetRoomsSchema = yup.object().shape({
	uuid: ValidationSchema.UuidSchema.required('UUID is required'),
	token: ValidationSchema.TokenSchema.required('Token is required'),
});

const CreateRoomSchema = yup.object().shape({
	uuid: ValidationSchema.UuidSchema.required('UUID is required'),
	token: ValidationSchema.TokenSchema.required('Token is required'),
	name: ValidationSchema.NameSchema.required('Name is required'),
	password: ValidationSchema.PasswordSchema,
	hidden: ValidationSchema.HiddenSchema,
	size: ValidationSchema.SizeSchema,
	icon: ValidationSchema.IconSchema,
});

const JoinRoomSchema = yup.object().shape({
	uuid: ValidationSchema.UuidSchema.required('UUID is required'),
	token: ValidationSchema.TokenSchema.required('Token is required'),
	name: ValidationSchema.NameSchema.required('Name is required'),
	password: ValidationSchema.PasswordSchema,
});

const LeaveRoomSchema = yup.object().shape({
	uuid: ValidationSchema.UuidSchema.required('UUID is required'),
	token: ValidationSchema.TokenSchema.required('Token is required'),
});

const KickUserSchema = yup.object().shape({
	uuid: ValidationSchema.UuidSchema.required('UUID is required'),
	token: ValidationSchema.TokenSchema.required('Token is required'),
	target: ValidationSchema.TargetSchema.required('Target is required'),
});

export const LobbySchema = {
	PingSchema,
	GetRoomSchema,
	GetRoomsSchema,
	CreateRoomSchema,
	JoinRoomSchema,
	LeaveRoomSchema,
	KickUserSchema,
};
