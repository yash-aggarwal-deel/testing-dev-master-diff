import {Column, DataType, Model, Table} from 'sequelize-typescript';

@Table({
  tableName: 'dummy',
  modelName: 'Dummy',
  comment: 'Dummy table',
  timestamps: true,
  deletedAt: false,
  paranoid: false
})
export class Dummy extends Model<Dummy> {
  @Column({type: DataType.INTEGER, comment: 'Dummy id', autoIncrement: true, primaryKey: true})
  declare id: number;
}
