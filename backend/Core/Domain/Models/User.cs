using Domain.Models.Abstract;
using Domain.Models.Chat;
using Domain.Models.Load; // Добавили ссылку на пространство имен чатов

namespace Domain.Models;

public class User : Entity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public int Timezone { get; set; } = 0;
    public string Phone { get; set; } = string.Empty;
    
    public string CompanyName { get; set; } = string.Empty;
    public string CompanyCountry { get; set; } = string.Empty;
    public string CompanyType { get; set; } = string.Empty;
    
    public string Country { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;

    public bool IsMetric { get; set; } = true;
    public string Role { get; set; } = string.Empty;
    public Guid? AvatarId { get; set; } = null;
    public UserFile? Avatar { get; set; } = null;
    
    public ICollection<LoadEntity> Loads { get; set; } = new List<LoadEntity>();
    public ICollection<LoadDraft> LoadsDrafts { get; set; } = new List<LoadDraft>();

    public virtual ICollection<ChatEntity> Chats { get; set; } = new List<ChatEntity>();
}