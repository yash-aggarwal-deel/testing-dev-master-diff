import {Column, DataType} from 'sequelize-typescript';

export const UUIDPK = () => Column({type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true});
