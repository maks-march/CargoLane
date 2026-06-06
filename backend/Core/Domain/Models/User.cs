using Domain.Models.Abstract;
using Domain.Models.Truck;
using Domain.Models.Chat; // Добавили ссылку на пространство имен чатов

namespace Domain.Models;

public class User : Entity
{
    public required string Name { get; set; }
    public required string Surname { get; set; }
    public string Country { get; set; }
    public string City { get; set; }
    public string PhoneNumber { get; set; }
    public string Purpose { get; set; }
    
    public Guid AvatarId { get; set; }
    public UserFile Avatar { get; set; }
    public UserFile[] Certificates { get; set; }
    
    public ICollection<TruckEntity> Trucks { get; set; } = new List<TruckEntity>();
    public ICollection<Order.OrderEntity> Orders { get; set; } = new List<Order.OrderEntity>();

    // Ссылка на чаты пользователя
    public virtual ICollection<ChatEntity> Chats { get; set; } = new List<ChatEntity>();
}