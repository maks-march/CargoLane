using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class LoadChange3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoutePoint<LoadDraft>_LoadDrafts_EntityId",
                table: "RoutePoint<LoadDraft>");

            migrationBuilder.DropForeignKey(
                name: "FK_RoutePoint<LoadEntity>_Loads_EntityId",
                table: "RoutePoint<LoadEntity>");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RoutePoint<LoadEntity>",
                table: "RoutePoint<LoadEntity>");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RoutePoint<LoadDraft>",
                table: "RoutePoint<LoadDraft>");

            migrationBuilder.RenameTable(
                name: "RoutePoint<LoadEntity>",
                newName: "RoutePoints");

            migrationBuilder.RenameTable(
                name: "RoutePoint<LoadDraft>",
                newName: "RoutePointsDraft");

            migrationBuilder.RenameIndex(
                name: "IX_RoutePoint<LoadEntity>_EntityId",
                table: "RoutePoints",
                newName: "IX_RoutePoints_EntityId");

            migrationBuilder.RenameIndex(
                name: "IX_RoutePoint<LoadDraft>_EntityId",
                table: "RoutePointsDraft",
                newName: "IX_RoutePointsDraft_EntityId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RoutePoints",
                table: "RoutePoints",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RoutePointsDraft",
                table: "RoutePointsDraft",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RoutePoints_Loads_EntityId",
                table: "RoutePoints",
                column: "EntityId",
                principalTable: "Loads",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RoutePointsDraft_LoadDrafts_EntityId",
                table: "RoutePointsDraft",
                column: "EntityId",
                principalTable: "LoadDrafts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoutePoints_Loads_EntityId",
                table: "RoutePoints");

            migrationBuilder.DropForeignKey(
                name: "FK_RoutePointsDraft_LoadDrafts_EntityId",
                table: "RoutePointsDraft");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RoutePointsDraft",
                table: "RoutePointsDraft");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RoutePoints",
                table: "RoutePoints");

            migrationBuilder.RenameTable(
                name: "RoutePointsDraft",
                newName: "RoutePoint<LoadDraft>");

            migrationBuilder.RenameTable(
                name: "RoutePoints",
                newName: "RoutePoint<LoadEntity>");

            migrationBuilder.RenameIndex(
                name: "IX_RoutePointsDraft_EntityId",
                table: "RoutePoint<LoadDraft>",
                newName: "IX_RoutePoint<LoadDraft>_EntityId");

            migrationBuilder.RenameIndex(
                name: "IX_RoutePoints_EntityId",
                table: "RoutePoint<LoadEntity>",
                newName: "IX_RoutePoint<LoadEntity>_EntityId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RoutePoint<LoadDraft>",
                table: "RoutePoint<LoadDraft>",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RoutePoint<LoadEntity>",
                table: "RoutePoint<LoadEntity>",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RoutePoint<LoadDraft>_LoadDrafts_EntityId",
                table: "RoutePoint<LoadDraft>",
                column: "EntityId",
                principalTable: "LoadDrafts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RoutePoint<LoadEntity>_Loads_EntityId",
                table: "RoutePoint<LoadEntity>",
                column: "EntityId",
                principalTable: "Loads",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
