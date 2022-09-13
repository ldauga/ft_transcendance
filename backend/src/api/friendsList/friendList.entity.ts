import { Index, Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany } from 'typeorm';

@Entity('friendList')
export class FriendListEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @Index()
  public id_user1: number;

  @Column()
  @Index()
  public id_user2: number;

}
