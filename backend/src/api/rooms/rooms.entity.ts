import { Index, Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany } from 'typeorm';

@Entity('rooms')
export class RoomsEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar' })
  public name: string;

  @Column({ type: 'varchar' })
  public description: string;

  @Column({ type: 'varchar' })
  public password: string;

  @Column()
  @Index()
  public identifiant: number;

  @Column()
  @Index()
  public owner_id: number;

  @Column({ default: false })
  public publicOrPrivate: boolean;

  @Column({ default: false })
  public passwordOrNot: boolean;

}
