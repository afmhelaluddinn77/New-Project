import { DataSource } from "typeorm";
import { User } from "../auth/user.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  url:
    process.env.DATABASE_URL || "postgresql://localhost:5432/healthcare_auth",
  schema: "auth",
  entities: [User],
  migrations: ["src/migrations/*.ts"],
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
});
