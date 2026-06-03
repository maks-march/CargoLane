using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Truck : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payloads_Orders_OrderId",
                table: "Payloads");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Orders_OrderId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_Transports_Orders_OrderId",
                table: "Transports");

            migrationBuilder.DropTable(
                name: "RoutePoints");

            migrationBuilder.RenameColumn(
                name: "OrderId",
                table: "Transports",
                newName: "EntityId");

            migrationBuilder.RenameIndex(
                name: "IX_Transports_OrderId",
                table: "Transports",
                newName: "IX_Transports_EntityId");

            migrationBuilder.RenameColumn(
                name: "OrderId",
                table: "Payments",
                newName: "EntityId");

            migrationBuilder.RenameIndex(
                name: "IX_Payments_OrderId",
                table: "Payments",
                newName: "IX_Payments_EntityId");

            migrationBuilder.RenameColumn(
                name: "OrderId",
                table: "Payloads",
                newName: "EntityId");

            migrationBuilder.RenameIndex(
                name: "IX_Payloads_OrderId",
                table: "Payloads",
                newName: "IX_Payloads_EntityId");

            migrationBuilder.AddColumn<int>(
                name: "Adr",
                table: "Trucks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "BodyType",
                table: "Trucks",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "ByCash",
                table: "Trucks",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Trucks",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsCmr",
                table: "Trucks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsCrewFull",
                table: "Trucks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsHitch",
                table: "Trucks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsMedicalBook",
                table: "Trucks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPaymentRequested",
                table: "Trucks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPneumaticVehicle",
                table: "Trucks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsStakes",
                table: "Trucks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsT1",
                table: "Trucks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsTir",
                table: "Trucks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string[]>(
                name: "LoadType",
                table: "Trucks",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);

            migrationBuilder.AddColumn<double>(
                name: "NotTaxedByCard",
                table: "Trucks",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "TaxedByCard",
                table: "Trucks",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "TemperatureFrom",
                table: "Trucks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TemperatureTo",
                table: "Trucks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string[]>(
                name: "UnloadType",
                table: "Trucks",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);

            migrationBuilder.AddColumn<int>(
                name: "Vehicles",
                table: "Trucks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "OrderRoutePoints",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    City = table.Column<string>(type: "text", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    LoadTimeStart = table.Column<TimeSpan>(type: "interval", nullable: false),
                    LoadTimeEnd = table.Column<TimeSpan>(type: "interval", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    IsLoad = table.Column<bool>(type: "boolean", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderRoutePoints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderRoutePoints_Orders_EntityId",
                        column: x => x.EntityId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TruckPhoto",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    FilePath = table.Column<string>(type: "text", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TruckPhoto", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TruckPhoto_Trucks_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Trucks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TruckRoutePoints",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    City = table.Column<string>(type: "text", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    LoadTimeStart = table.Column<TimeSpan>(type: "interval", nullable: false),
                    LoadTimeEnd = table.Column<TimeSpan>(type: "interval", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    IsLoad = table.Column<bool>(type: "boolean", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TruckRoutePoints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TruckRoutePoints_Trucks_EntityId",
                        column: x => x.EntityId,
                        principalTable: "Trucks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrderRoutePoints_EntityId",
                table: "OrderRoutePoints",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_TruckPhoto_OwnerId",
                table: "TruckPhoto",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_TruckRoutePoints_EntityId",
                table: "TruckRoutePoints",
                column: "EntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_Payloads_Orders_EntityId",
                table: "Payloads",
                column: "EntityId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Orders_EntityId",
                table: "Payments",
                column: "EntityId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Transports_Orders_EntityId",
                table: "Transports",
                column: "EntityId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payloads_Orders_EntityId",
                table: "Payloads");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Orders_EntityId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_Transports_Orders_EntityId",
                table: "Transports");

            migrationBuilder.DropTable(
                name: "OrderRoutePoints");

            migrationBuilder.DropTable(
                name: "TruckPhoto");

            migrationBuilder.DropTable(
                name: "TruckRoutePoints");

            migrationBuilder.DropColumn(
                name: "Adr",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "BodyType",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "ByCash",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "IsCmr",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "IsCrewFull",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "IsHitch",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "IsMedicalBook",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "IsPaymentRequested",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "IsPneumaticVehicle",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "IsStakes",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "IsT1",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "IsTir",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "LoadType",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "NotTaxedByCard",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "TaxedByCard",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "TemperatureFrom",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "TemperatureTo",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "UnloadType",
                table: "Trucks");

            migrationBuilder.DropColumn(
                name: "Vehicles",
                table: "Trucks");

            migrationBuilder.RenameColumn(
                name: "EntityId",
                table: "Transports",
                newName: "OrderId");

            migrationBuilder.RenameIndex(
                name: "IX_Transports_EntityId",
                table: "Transports",
                newName: "IX_Transports_OrderId");

            migrationBuilder.RenameColumn(
                name: "EntityId",
                table: "Payments",
                newName: "OrderId");

            migrationBuilder.RenameIndex(
                name: "IX_Payments_EntityId",
                table: "Payments",
                newName: "IX_Payments_OrderId");

            migrationBuilder.RenameColumn(
                name: "EntityId",
                table: "Payloads",
                newName: "OrderId");

            migrationBuilder.RenameIndex(
                name: "IX_Payloads_EntityId",
                table: "Payloads",
                newName: "IX_Payloads_OrderId");

            migrationBuilder.CreateTable(
                name: "RoutePoints",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    City = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    IsLoad = table.Column<bool>(type: "boolean", nullable: false),
                    LoadTimeEnd = table.Column<TimeSpan>(type: "interval", nullable: false),
                    LoadTimeStart = table.Column<TimeSpan>(type: "interval", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoutePoints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoutePoints_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RoutePoints_OrderId",
                table: "RoutePoints",
                column: "OrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Payloads_Orders_OrderId",
                table: "Payloads",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Orders_OrderId",
                table: "Payments",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Transports_Orders_OrderId",
                table: "Transports",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
