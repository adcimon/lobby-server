import * as yup from 'yup';

export const PingSchema = yup.object().shape(
{
    token: yup.string().required().typeError('Invalid token'),
    uuid: yup.string().required().typeError('Invalid uuid')
});

export const GetRoomSchema = yup.object().shape(
{
    token: yup.string().required().typeError('Invalid token'),
    uuid: yup.string().required().typeError('Invalid uuid')
});

export const GetRoomsSchema = yup.object().shape(
{
    token: yup.string().required().typeError('Invalid token'),
    uuid: yup.string().required().typeError('Invalid uuid')
});

export const CreateRoomSchema = yup.object().shape(
{
    token: yup.string().required().typeError('Invalid token'),
    uuid: yup.string().required().typeError('Invalid uuid'),
    name: yup.string().required().typeError('Invalid name'),
    password: yup.string().typeError('Invalid password'),
    icon: yup.string().typeError('Invalid icon')
});

export const JoinRoomSchema = yup.object().shape(
{
    token: yup.string().required().typeError('Invalid token'),
    uuid: yup.string().required().typeError('Invalid uuid'),
    name: yup.string().required().typeError('Invalid name'),
    password: yup.string().typeError('Invalid password')
});

export const LeaveRoomSchema = yup.object().shape(
{
    token: yup.string().required().typeError('Invalid token'),
    uuid: yup.string().required().typeError('Invalid uuid')
});