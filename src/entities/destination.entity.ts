import {
  Entity,
  Unique,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { IsNumber, IsNotEmpty, IsString, IsBoolean } from "class-validator";
import { BookingEntity } from "./booking.entity";

@Entity("destination")
@Unique(["name"])
export class DestinationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  name: string;

  @Column("text", { default: true })
  @IsString()
  description?: string = "description";

  @Column()
  @IsNotEmpty()
  @IsString()
  state: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  city: string;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  cost: number;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  maxGuests: number;

  @Column("boolean", { default: true })
  @IsBoolean()
  available?: boolean = true;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => BookingEntity, (booking) => booking.destination, {})
  bookings: BookingEntity[];
}
