import * as yup from 'yup';

export namespace ValidationSchema {
	const ROOM_NAME_REGEXP = /^[a-zA-Z]+(.){4,20}$/;
	const ROOM_NAME_MESSAGE = 'Room name must start with an alpha character and contain from 5 to 20 characters';

	const PASSWORD_REGEXP = /^[a-zA-Z]+(.){7,20}$/;
	const PASSWORD_MESSAGE = 'Password must start with an alpha character and contain from 8 to 20 characters';

	const emptyStringToNull = (value, originalValue) => {
		return originalValue === '' ? null : value;
	};

	export const UuidSchema = yup.string();
	export const TokenSchema = yup.string();
	export const NameSchema = yup.string().matches(ROOM_NAME_REGEXP, ROOM_NAME_MESSAGE);
	export const PasswordSchema = yup
		.string()
		.matches(PASSWORD_REGEXP, { message: PASSWORD_MESSAGE, excludeEmptyString: true });
	export const HiddenSchema = yup.boolean();
	export const SizeSchema = yup.number().integer().positive().min(1).nullable(true).transform(emptyStringToNull);
	export const IconSchema = yup.string().url().max(500);
	export const TargetSchema = yup.string();
}
