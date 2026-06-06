using Domain.Models.Abstract;
using Domain.Models.Truck;
using Domain.Models.Chat; // Добавили ссылку на пространство имен чатов

namespace Domain.Models;

public class User : Entity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string NickName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int TimeZone { get; set; } = 0;
    public string PhoneNumber { get; set; } = string.Empty;
    
    public string CompanyName { get; set; } = string.Empty;
    public string CompanyCountry { get; set; } = string.Empty;
    public string CompanyType { get; set; } = string.Empty;
    
    public string Country { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;

    public Guid? AvatarId { get; set; } = null;
    public UserFile? Avatar { get; set; } = null;
    public ICollection<UserFile> Certificates { get; set; }
    
    public ICollection<TruckEntity> Trucks { get; set; } = new List<TruckEntity>();
    
    public ICollection<Order.OrderEntity> Orders { get; set; } = new List<Order.OrderEntity>();

    public virtual ICollection<ChatEntity> Chats { get; set; } = new List<ChatEntity>();
}