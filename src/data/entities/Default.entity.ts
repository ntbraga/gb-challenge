import {
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity as base,
  DeleteDateColumn,
  ObjectIdColumn,
  ObjectID,
} from 'typeorm';

export abstract class DefaultEntity extends base {
  @ObjectIdColumn()
  id: ObjectID;

  @CreateDateColumn({ type: 'timestamp', insert: false, update: false })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp', insert: false, update: false })
  updatedDate: Date;

  @DeleteDateColumn({ type: 'timestamp', insert: false, update: false })
  deletedDate: Date;

  //   toJSON() {
  //     return {
  //       ...this,
  //       createdDate: moment(this.createdDate).format('DD/MM/YYYY HH:mm'),
  //       updatedDate: moment(this.updatedDate).format('DD/MM/YYYY HH:mm'),
  //       deletedDate: this.deletedDate
  //         ? moment(this.deletedDate).format('DD/MM/YYYY HH:mm')
  //         : undefined,
  //     };
  //   }
}
