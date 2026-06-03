using Domain.Enums;
using Domain.Models.Abstract;

namespace Domain.Models.Order;

public class Payment : EntityField<OrderEntity>
{
    public required PaymentType PaymentType { get; set; } = PaymentType.NoNegotiable;
    public required bool IsTaxedByCard {get; set;}
    public required bool IsNotTaxedByCard {get; set;}
    public required bool IsByCash {get; set;}
    
    public double TaxedByCard {get; set;}
    public double NotTaxedByCard { get; set; }
    public double ByCash {get; set;}
    
    public bool IsVisible { get; set; } = false;
    public int PaymentAfterDays { get; set; } = 0;
    public double Prepayment { get; set; } = 0;
    public bool IsPrepaymentByFuel {get; set;}
}