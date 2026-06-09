using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class LoadAdvanced : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "Loads");

            migrationBuilder.AddColumn<DateTime>(
                name: "ArrivalTime",
                table: "TruckRoutePoints",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ArrivalTime",
                table: "RoutePoint<LoadEntity>",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ArrivalTime",
                table: "RoutePoint<LoadDraft>",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ArrivalTime",
                table: "OrderRoutePoints",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArrivalTime",
                table: "TruckRoutePoints");

            migrationBuilder.DropColumn(
                name: "ArrivalTime",
                table: "RoutePoint<LoadEntity>");

            migrationBuilder.DropColumn(
                name: "ArrivalTime",
                table: "RoutePoint<LoadDraft>");

            migrationBuilder.DropColumn(
                name: "ArrivalTime",
                table: "OrderRoutePoints");

            migrationBuilder.AddColumn<DateOnly>(
                name: "StartDate",
                table: "Loads",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));
        }
    }
}
