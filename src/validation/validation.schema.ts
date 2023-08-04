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

export const ValidationSchema = {
	UuidSchema,
	TokenSchema,
	NameSchema,
	PasswordSchema,
	HiddenSchema,
	SizeSchema,
	IconSchema,
	TargetSchema,
};
