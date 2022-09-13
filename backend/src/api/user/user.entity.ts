import { Index, Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany } from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar', length: 10 })
  @Index()
  public login: string;

  @Column({ type: 'varchar', length: 30 })
  public nickname: string;

  @Column({ default: 0 })
  public wins: number;

  @Column({ default: 0 })
  public losses: number;

  @Column({ type: 'int', default: 0 })
  public rank: number;

  @Column({ type: 'varchar' })
  public profile_pic: string;

  @Column({ type: 'varchar', nullable: true })
  public totpsecret: string;

  @Column({ type: 'int', nullable: true })
  public uid: number;

  @Column({ type: 'varchar', nullable: true })
  public refreshToken: string;

  @Column({ nullable: true })
  public refreshTokenIAT: string;

  @Column({ nullable: true })
  public refreshTokenExp: string;
}
