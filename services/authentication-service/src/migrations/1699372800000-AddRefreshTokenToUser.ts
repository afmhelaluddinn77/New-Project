import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddRefreshTokenToUser1699372800000 implements MigrationInterface {
  name = "AddRefreshTokenToUser1699372800000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column already exists (in case running on existing schema)
    const table = await queryRunner.getTable("users");
    const hasColumn = table?.columns.find(
      (col) => col.name === "hashedRefreshToken"
    );

    if (!hasColumn) {
      await queryRunner.addColumn(
        "users",
        new TableColumn({
          name: "hashedRefreshToken",
          type: "varchar",
          isNullable: true,
          default: null,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("users");
    const hasColumn = table?.columns.find(
      (col) => col.name === "hashedRefreshToken"
    );

    if (hasColumn) {
      await queryRunner.dropColumn("users", "hashedRefreshToken");
    }
  }
}
