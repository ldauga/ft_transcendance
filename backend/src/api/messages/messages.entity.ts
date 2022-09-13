import { Index, Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany } from 'typeorm';

@Entity('messages')
export class MessagesEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @Index()
  public id_sender: number;

  @Column()
  @Index()
  public login_sender: string;

  @Column()
  @Index()
  public id_receiver: number;

  @Column()
  @Index()
  public login_receiver: string;

  @Column()
  public text: string;

}
