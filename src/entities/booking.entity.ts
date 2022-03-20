import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { IsNumber, IsNotEmpty, IsDateString } from "class-validator";
import { UserEntity } from "./user.entity";
import { DestinationEntity } from "./destination.entity";

@Entity("booking")
export class BookingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsDateString()
  startDate: Date;

  @Column()
  @IsDateString()
  endDate: Date;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  cost: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.bookings)
  user: UserEntity;

  @ManyToOne(() => DestinationEntity, (destination) => destination.bookings)
  destination: DestinationEntity;
}
