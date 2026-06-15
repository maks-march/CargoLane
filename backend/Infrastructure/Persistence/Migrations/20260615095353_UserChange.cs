using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UserChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FileEntity<User>_Users_OwnerId",
                table: "FileEntity<User>");

            migrationBuilder.DropIndex(
                name: "IX_FileEntity<User>_OwnerId",
                table: "FileEntity<User>");

            migrationBuilder.DropColumn(
                name: "NickName",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "TimeZone",
                table: "Users",
                newName: "Timezone");

            migrationBuilder.RenameColumn(
                name: "Purpose",
                table: "Users",
                newName: "Phone");

            migrationBuilder.RenameColumn(
                name: "PhoneNumber",
                table: "Users",
                newName: "DisplayName");

            migrationBuilder.AddColumn<bool>(
                name: "IsMetric",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSystem",
                table: "Messages",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsMetric",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsSystem",
                table: "Messages");

            migrationBuilder.RenameColumn(
                name: "Timezone",
                table: "Users",
                newName: "TimeZone");

            migrationBuilder.RenameColumn(
                name: "Phone",
                table: "Users",
                newName: "Purpose");

            migrationBuilder.RenameColumn(
                name: "DisplayName",
                table: "Users",
                newName: "PhoneNumber");

            migrationBuilder.AddColumn<string>(
                name: "NickName",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_FileEntity<User>_OwnerId",
                table: "FileEntity<User>",
                column: "OwnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_FileEntity<User>_Users_OwnerId",
                table: "FileEntity<User>",
                column: "OwnerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
