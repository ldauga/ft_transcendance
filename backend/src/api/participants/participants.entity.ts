import { Index, Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany } from 'typeorm';

@Entity('participants')
export class ParticipantsEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @Index()
  public user_id: number;

  @Column({ type: 'varchar' })
  public user_login: string;

  @Column()
  @Index()
  public room_id: number;

  @Column({ type: 'varchar' })
  public room_name: string;

  @Column({ default: false })
  public admin: boolean;

}
