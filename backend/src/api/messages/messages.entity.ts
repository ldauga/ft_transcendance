import { Index, Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany } from 'typeorm';

@Entity('messages')
export class MessagesEntity {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @Column()
  @Index()
  public id_sender: number;

  @Column()
  @Index()
  public id_receiver: number;

  @Column()
  @Index()
  public login_sender: string;

  @Column()
  @Index()
  public login_receiver: string;

  @Column({ default: false })
  public userOrRoom: boolean;

  @Column({ default: false })
  public serverMsg: boolean;

  @Column()
  @Index()
  public room_id: number;

  @Column()
  @Index()
  public room_name: string;

  @Column()
  public text: string;

  @Column()
  public year: string;

  @Column()
  public month: string;

  @Column()
  public day: string;

  @Column()
  public hour: string;

  @Column()
  public minute: string;

}
