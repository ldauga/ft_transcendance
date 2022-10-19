import { Index, Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany } from 'typeorm';

@Entity('muteList')
export class MuteListEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @Index()
  public id_sender: number;

  @Column()
  @Index()
  public id_muted: number;

  @Column({ type: 'varchar' })
  public login_sender: string;

  @Column({ type: 'varchar' })
  public login_muted: string;

  @Column({ default: false })
  public userOrRoom: boolean;

  @Column()
  @Index()
  public room_id: number;

  @Column({ type: 'varchar' })
  public room_name: string;

  @Column({ type: 'varchar' })
  public cause: string;

  @Column()
  @Index()
  public date: number;

  @Column({ default: true })
  public alwaysOrNot: boolean;

  @Column()
  @Index()
  public timer: number;

}
