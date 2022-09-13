import { Index, Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany } from 'typeorm';

@Entity('matchesHistory')
export class MatchesHistoryEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @Index()
  public id_user1: number;

  @Column( {default: 0} )
  @Index()
  public score_u1: number;

  @Column()
  @Index()
  public id_user2: number;

  @Column( {default: 0} )
  @Index()
  public score_u2: number;

  @Column()
  public winner_id: number;

  @Column({ type: "timestamp"})
  public date: Date;

}
