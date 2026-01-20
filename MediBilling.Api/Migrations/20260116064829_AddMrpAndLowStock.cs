using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediBilling.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMrpAndLowStock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Mrp",
                table: "StockBatches",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Mrp",
                table: "PurchaseItems",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "LowStockThreshold",
                table: "Medicines",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Mrp",
                table: "StockBatches");

            migrationBuilder.DropColumn(
                name: "Mrp",
                table: "PurchaseItems");

            migrationBuilder.DropColumn(
                name: "LowStockThreshold",
                table: "Medicines");
        }
    }
}
