import { Index, Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany } from 'typeorm';

@Entity('invitationRequest')
export class InvitationRequestEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @Index()
  public id_user1: number;

  @Column()
  @Index()
  public id_user2: number;

  @Column({ default: true })
  public user1_accept: boolean;

  @Column({ default: false })
  public user2_accept: boolean;

  @Column({ type: 'varchar' })
  public sender_login: string;

  @Column({ type: 'varchar' })
  public receiver_login: string;

}
