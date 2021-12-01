import * as yup from 'yup';

const ROOMNAME_REGEXP = /^[a-zA-Z]+(.){4,20}$/;
const ROOMNAME_MESSAGE = "Room name must start with an alpha character and contain from 5 to 20 characters";

const PASSWORD_REGEXP = /^[a-zA-Z]+(.){7,20}$/;
const PASSWORD_MESSAGE = "Password must start with an alpha character and contain from 8 to 20 characters";

export const PingSchema = yup.object().shape(
{
    token:      yup.string().required('Token is required'),
    uuid:       yup.string().required('UUID is required')
});

export const GetRoomSchema = yup.object().shape(
{
    token:      yup.string().required('Token is required'),
    uuid:       yup.string().required('UUID is required')
});

export const GetRoomsSchema = yup.object().shape(
{
    token:      yup.string().required('Token is required'),
    uuid:       yup.string().required('UUID is required')
});

export const CreateRoomSchema = yup.object().shape(
{
    token:      yup.string().required('Token is required'),
    uuid:       yup.string().required('UUID is required'),
    name:       yup.string().required('Name is required').matches(ROOMNAME_REGEXP, ROOMNAME_MESSAGE),
    password:   yup.string().matches(PASSWORD_REGEXP, { message: PASSWORD_MESSAGE, excludeEmptyString: true }),
    hidden:     yup.boolean(),
    icon:       yup.string().url().max(200)
});

export const JoinRoomSchema = yup.object().shape(
{
    token:      yup.string().required('Token is required'),
    uuid:       yup.string().required('UUID is required'),
    name:       yup.string().required('Name is required').matches(ROOMNAME_REGEXP, ROOMNAME_MESSAGE),
    password:   yup.string().matches(PASSWORD_REGEXP, { message: PASSWORD_MESSAGE, excludeEmptyString: true })
});

export const LeaveRoomSchema = yup.object().shape(
{
    token:      yup.string().required('Token is required'),
    uuid:       yup.string().required('UUID is required')
});

export const SendTextSchema = yup.object().shape(
{
    token:      yup.string().required('Token is required'),
    uuid:       yup.string().required('UUID is required'),
    text:       yup.string().required('Text is required')
});