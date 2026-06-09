using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Load : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "Payloads");

            migrationBuilder.AddColumn<double>(
                name: "Height",
                table: "Payloads",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Length",
                table: "Payloads",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Width",
                table: "Payloads",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.CreateTable(
                name: "LoadDrafts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Payment = table.Column<double>(type: "double precision", nullable: true),
                    Insurance = table.Column<double>(type: "double precision", nullable: true),
                    HScode = table.Column<string>(type: "text", nullable: true),
                    Adr = table.Column<int>(type: "integer", nullable: true),
                    SuitableCargos = table.Column<string[]>(type: "text[]", nullable: true),
                    About = table.Column<string>(type: "text", nullable: true),
                    Created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoadDrafts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoadDrafts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Loads",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Payment = table.Column<double>(type: "double precision", nullable: false),
                    Insurance = table.Column<double>(type: "double precision", nullable: false),
                    HScode = table.Column<string>(type: "text", nullable: false),
                    Adr = table.Column<int>(type: "integer", nullable: false),
                    SuitableCargos = table.Column<string[]>(type: "text[]", nullable: false),
                    About = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsReviewed = table.Column<bool>(type: "boolean", nullable: false),
                    Created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Loads", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Loads_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PayloadDraft",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Length = table.Column<double>(type: "double precision", nullable: false),
                    Width = table.Column<double>(type: "double precision", nullable: false),
                    Height = table.Column<double>(type: "double precision", nullable: false),
                    Weight = table.Column<double>(type: "double precision", nullable: false),
                    Volume = table.Column<double>(type: "double precision", nullable: false),
                    Amount = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayloadDraft", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PayloadDraft_LoadDrafts_EntityId",
                        column: x => x.EntityId,
                        principalTable: "LoadDrafts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoutePoint<LoadDraft>",
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
                    table.PrimaryKey("PK_RoutePoint<LoadDraft>", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoutePoint<LoadDraft>_LoadDrafts_EntityId",
                        column: x => x.EntityId,
                        principalTable: "LoadDrafts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FileEntity<LoadEntity>",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FilePath = table.Column<string>(type: "text", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Discriminator = table.Column<string>(type: "character varying(34)", maxLength: 34, nullable: false),
                    Created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FileEntity<LoadEntity>", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FileEntity<LoadEntity>_Loads_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Loads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payload",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Length = table.Column<double>(type: "double precision", nullable: false),
                    Width = table.Column<double>(type: "double precision", nullable: false),
                    Height = table.Column<double>(type: "double precision", nullable: false),
                    Weight = table.Column<double>(type: "double precision", nullable: false),
                    Volume = table.Column<double>(type: "double precision", nullable: false),
                    Amount = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payload", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payload_Loads_EntityId",
                        column: x => x.EntityId,
                        principalTable: "Loads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoutePoint<LoadEntity>",
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
                    table.PrimaryKey("PK_RoutePoint<LoadEntity>", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoutePoint<LoadEntity>_Loads_EntityId",
                        column: x => x.EntityId,
                        principalTable: "Loads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FileEntity<LoadEntity>_OwnerId",
                table: "FileEntity<LoadEntity>",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_LoadDrafts_UserId",
                table: "LoadDrafts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Loads_UserId",
                table: "Loads",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Payload_EntityId",
                table: "Payload",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_PayloadDraft_EntityId",
                table: "PayloadDraft",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_RoutePoint<LoadDraft>_EntityId",
                table: "RoutePoint<LoadDraft>",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_RoutePoint<LoadEntity>_EntityId",
                table: "RoutePoint<LoadEntity>",
                column: "EntityId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FileEntity<LoadEntity>");

            migrationBuilder.DropTable(
                name: "Payload");

            migrationBuilder.DropTable(
                name: "PayloadDraft");

            migrationBuilder.DropTable(
                name: "RoutePoint<LoadDraft>");

            migrationBuilder.DropTable(
                name: "RoutePoint<LoadEntity>");

            migrationBuilder.DropTable(
                name: "LoadDrafts");

            migrationBuilder.DropTable(
                name: "Loads");

            migrationBuilder.DropColumn(
                name: "Height",
                table: "Payloads");

            migrationBuilder.DropColumn(
                name: "Length",
                table: "Payloads");

            migrationBuilder.DropColumn(
                name: "Width",
                table: "Payloads");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Payloads",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
