import { Entity, Column, PrimaryColumn } from 'typeorm'

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar', unique: true, nullable: true })
  email!: string | null

  @Column({ type: 'varchar', nullable: true })
  role!: string | null

  @Column({ type: 'varchar', nullable: true })
  hashedRefreshToken!: string | null
}
