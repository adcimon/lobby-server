import * as yup from 'yup';

const ROOM_NAME_REGEXP = /^[a-zA-Z]+(.){4,20}$/;
const ROOM_NAME_MESSAGE = 'Room name must start with an alpha character and contain from 5 to 20 characters';

const PASSWORD_REGEXP = /^[a-zA-Z]+(.){7,20}$/;
const PASSWORD_MESSAGE = 'Password must start with an alpha character and contain from 8 to 20 characters';

function emptyStringToNull(value, originalValue) {
	return originalValue === '' ? null : value;
}

const UuidSchema = yup.string();
const TokenSchema = yup.string();
const NameSchema = yup.string().matches(ROOM_NAME_REGEXP, ROOM_NAME_MESSAGE);
const PasswordSchema = yup.string().matches(PASSWORD_REGEXP, { message: PASSWORD_MESSAGE, excludeEmptyString: true });
const HiddenSchema = yup.boolean();
const SizeSchema = yup.number().integer().positive().min(1).nullable(true).transform(emptyStringToNull);
const IconSchema = yup.string().url().max(500);
const TargetSchema = yup.string();

const PingSchema = yup.object().shape({
	uuid: UuidSchema.required('UUID is required'),
	token: TokenSchema.required('Token is required'),
});

const GetRoomSchema = yup.object().shape({
	uuid: UuidSchema.required('UUID is required'),
	token: TokenSchema.required('Token is required'),
});

const GetRoomsSchema = yup.object().shape({
	uuid: UuidSchema.required('UUID is required'),
	token: TokenSchema.required('Token is required'),
});

const CreateRoomSchema = yup.object().shape({
	uuid: UuidSchema.required('UUID is required'),
	token: TokenSchema.required('Token is required'),
	name: NameSchema.required('Name is required'),
	password: PasswordSchema,
	hidden: HiddenSchema,
	size: SizeSchema,
	icon: IconSchema,
});

const JoinRoomSchema = yup.object().shape({
	uuid: UuidSchema.required('UUID is required'),
	token: TokenSchema.required('Token is required'),
	name: NameSchema.required('Name is required'),
	password: PasswordSchema,
});

const LeaveRoomSchema = yup.object().shape({
	uuid: UuidSchema.required('UUID is required'),
	token: TokenSchema.required('Token is required'),
});

const KickUserSchema = yup.object().shape({
	uuid: UuidSchema.required('UUID is required'),
	token: TokenSchema.required('Token is required'),
	target: TargetSchema.required('Target is required'),
});

export const ValidationSchema = {
	PingSchema,
	GetRoomSchema,
	GetRoomsSchema,
	CreateRoomSchema,
	JoinRoomSchema,
	LeaveRoomSchema,
	KickUserSchema,
};
