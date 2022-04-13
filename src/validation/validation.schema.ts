import * as yup from 'yup';

const ROOMNAME_REGEXP = /^[a-zA-Z]+(.){4,20}$/;
const ROOMNAME_MESSAGE = "Room name must start with an alpha character and contain from 5 to 20 characters";

const PASSWORD_REGEXP = /^[a-zA-Z]+(.){7,20}$/;
const PASSWORD_MESSAGE = "Password must start with an alpha character and contain from 8 to 20 characters";

function emptyStringToNull( value, originalValue )
{
    return (originalValue === "") ? null : value;
}

const PingSchema = yup.object().shape(
{
    uuid:       yup.string().required('UUID is required'),
    token:      yup.string().required('Token is required')
});

const GetRoomSchema = yup.object().shape(
{
    uuid:       yup.string().required('UUID is required'),
    token:      yup.string().required('Token is required')
});

const GetRoomsSchema = yup.object().shape(
{
    uuid:       yup.string().required('UUID is required'),
    token:      yup.string().required('Token is required')
});

const CreateRoomSchema = yup.object().shape(
{
    uuid:       yup.string().required('UUID is required'),
    token:      yup.string().required('Token is required'),
    name:       yup.string().required('Name is required').matches(ROOMNAME_REGEXP, ROOMNAME_MESSAGE),
    password:   yup.string().matches(PASSWORD_REGEXP, { message: PASSWORD_MESSAGE, excludeEmptyString: true }),
    hidden:     yup.boolean(),
    size:       yup.number().integer().positive().min(1).nullable(true).transform(emptyStringToNull),
    icon:       yup.string().url().max(500)
});

const JoinRoomSchema = yup.object().shape(
{
    uuid:       yup.string().required('UUID is required'),
    token:      yup.string().required('Token is required'),
    name:       yup.string().required('Name is required').matches(ROOMNAME_REGEXP, ROOMNAME_MESSAGE),
    password:   yup.string().matches(PASSWORD_REGEXP, { message: PASSWORD_MESSAGE, excludeEmptyString: true })
});

const LeaveRoomSchema = yup.object().shape(
{
    uuid:       yup.string().required('UUID is required'),
    token:      yup.string().required('Token is required')
});

const KickUserSchema = yup.object().shape(
{
    uuid:       yup.string().required('UUID is required'),
    token:      yup.string().required('Token is required'),
    target:     yup.string().required('Target is required')
});

const SendTextSchema = yup.object().shape(
{
    uuid:       yup.string().required('UUID is required'),
    token:      yup.string().required('Token is required'),
    text:       yup.string().required('Text is required')
});

export const ValidationSchema =
{
    PingSchema,
    GetRoomSchema,
    GetRoomsSchema,
    CreateRoomSchema,
    JoinRoomSchema,
    LeaveRoomSchema,
    KickUserSchema,
    SendTextSchema
};