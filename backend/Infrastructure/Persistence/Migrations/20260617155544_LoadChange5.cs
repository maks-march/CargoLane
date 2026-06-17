using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class LoadChange5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsReviewed",
                table: "Loads");

            migrationBuilder.AddColumn<double>(
                name: "Distance",
                table: "Loads",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "Duration",
                table: "Loads",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RejectReason",
                table: "Loads",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ReviewDate",
                table: "Loads",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ReviewerName",
                table: "Loads",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "UserSavedLoads",
                columns: table => new
                {
                    SavedLoadsId = table.Column<Guid>(type: "uuid", nullable: false),
                    UsersSavesId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSavedLoads", x => new { x.SavedLoadsId, x.UsersSavesId });
                    table.ForeignKey(
                        name: "FK_UserSavedLoads_Loads_SavedLoadsId",
                        column: x => x.SavedLoadsId,
                        principalTable: "Loads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserSavedLoads_Users_UsersSavesId",
                        column: x => x.UsersSavesId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserSavedLoads_UsersSavesId",
                table: "UserSavedLoads",
                column: "UsersSavesId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserSavedLoads");

            migrationBuilder.DropColumn(
                name: "Distance",
                table: "Loads");

            migrationBuilder.DropColumn(
                name: "Duration",
                table: "Loads");

            migrationBuilder.DropColumn(
                name: "RejectReason",
                table: "Loads");

            migrationBuilder.DropColumn(
                name: "ReviewDate",
                table: "Loads");

            migrationBuilder.DropColumn(
                name: "ReviewerName",
                table: "Loads");

            migrationBuilder.AddColumn<bool>(
                name: "IsReviewed",
                table: "Loads",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
