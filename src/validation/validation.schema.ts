import * as yup from 'yup';

/**
 * Password Regular Expression
 *
 * (?=.*\d)             Should contain at least 1 digit.
 * (?=.*[a-z])          Should contain at least 1 lower case.
 * (?=.*[A-Z])          Should contain at least 1 upper case.
 * [a-zA-Z0-9]{8,20}    Should contain from 8 to 20 from the previous characters.
 * 
 */
const PASSWORD_REGEXP = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,20}$/;
const PASSWORD_MESSAGE = "Password must contain from 8 to 20 characters, 1 lowercase, 1 uppercase and 1 number";

export const PingSchema = yup.object().shape(
{
    token:      yup.string().required('Token is required').typeError('Invalid token'),
    uuid:       yup.string().required('UUID is required').typeError('Invalid UUID')
});

export const GetRoomSchema = yup.object().shape(
{
    token:      yup.string().required('Token is required').typeError('Invalid token'),
    uuid:       yup.string().required('UUID is required').typeError('Invalid UUID')
});

export const GetRoomsSchema = yup.object().shape(
{
    token:      yup.string().required('Token is required').typeError('Invalid token'),
    uuid:       yup.string().required('UUID is required').typeError('Invalid UUID')
});

export const CreateRoomSchema = yup.object().shape(
{
    token:      yup.string().required('Token is required').typeError('Invalid token'),
    uuid:       yup.string().required('UUID is required').typeError('Invalid UUID'),
    name:       yup.string().required('Name is required').typeError('Invalid name'),
    password:   yup.string().matches(PASSWORD_REGEXP, { message: PASSWORD_MESSAGE, excludeEmptyString: true }).typeError('Invalid password'),
    icon:       yup.string().typeError('Invalid icon')
});

export const JoinRoomSchema = yup.object().shape(
{
    token:      yup.string().required('Token is required').typeError('Invalid token'),
    uuid:       yup.string().required('UUID is required').typeError('Invalid UUID'),
    name:       yup.string().required('Name is required').typeError('Invalid name'),
    password:   yup.string().matches(PASSWORD_REGEXP, { message: PASSWORD_MESSAGE, excludeEmptyString: true }).typeError('Invalid password')
});

export const LeaveRoomSchema = yup.object().shape(
{
    token:      yup.string().required('Token is required').typeError('Invalid token'),
    uuid:       yup.string().required('UUID is required').typeError('Invalid UUID')
});