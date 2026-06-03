using FluentValidation;

namespace Application.CQRS.TruckCQ.Commands.Update;

/// <summary>
/// Валидатор команды обновления грузового транспортного средства
/// </summary>
public class UpdateTruckCommandValidator : AbstractValidator<UpdateTruckCommand>
{
    public UpdateTruckCommandValidator()
    {
        // Обязательные поля (всегда должны быть)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Truck ID is required.");
        
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required.");
        
        // Валидация BodyType (если передан)
        RuleFor(x => x.BodyType)
            .MaximumLength(50)
            .When(x => x.BodyType != null)
            .WithMessage("Body type must be 50 characters or fewer.")
            .Matches(@"^[a-zA-Zа-яА-Я\s\-]+$")
            .When(x => x.BodyType != null)
            .WithMessage("Body type can only contain letters, spaces, and hyphens.");
        
        // Валидация LoadType (если передан)
        RuleFor(x => x.LoadType)
            .Must(loadTypes => loadTypes == null || loadTypes.Count > 0)
            .WithMessage("Load type must contain at least one value.")
            .Must(loadTypes => loadTypes == null || loadTypes.All(lt => !string.IsNullOrWhiteSpace(lt)))
            .WithMessage("Load type values cannot be empty.")
            .Must(loadTypes => loadTypes == null || loadTypes.All(lt => lt.Length <= 30))
            .WithMessage("Each load type must be 30 characters or fewer.");
        
        // Валидация UnloadType (если передан)
        RuleFor(x => x.UnloadType)
            .Must(unloadTypes => unloadTypes == null || unloadTypes.Count > 0)
            .WithMessage("Unload type must contain at least one value.")
            .Must(unloadTypes => unloadTypes == null || unloadTypes.All(ut => !string.IsNullOrWhiteSpace(ut)))
            .WithMessage("Unload type values cannot be empty.")
            .Must(unloadTypes => unloadTypes == null || unloadTypes.All(ut => ut.Length <= 30))
            .WithMessage("Each unload type must be 30 characters or fewer.");
        
        // Валидация Vehicles (если передан)
        RuleFor(x => x.Vehicles)
            .InclusiveBetween(1, 100)
            .When(x => x.Vehicles.HasValue)
            .WithMessage("Vehicles count must be between 1 and 100.");
        
        // Валидация TemperatureFrom (если передан)
        RuleFor(x => x.TemperatureFrom)
            .InclusiveBetween(-50, 50)
            .When(x => x.TemperatureFrom.HasValue)
            .WithMessage("Temperature from must be between -50°C and 50°C.");
        
        // Валидация TemperatureTo (если передан)
        RuleFor(x => x.TemperatureTo)
            .InclusiveBetween(-50, 50)
            .When(x => x.TemperatureTo.HasValue)
            .WithMessage("Temperature to must be between -50°C and 50°C.");
        
        // Логическая проверка температурного диапазона
        RuleFor(x => x)
            .Must(x => !x.TemperatureFrom.HasValue || !x.TemperatureTo.HasValue || 
                       x.TemperatureFrom <= x.TemperatureTo)
            .When(x => x.TemperatureFrom.HasValue && x.TemperatureTo.HasValue)
            .WithMessage("Temperature from must be less than or equal to temperature to.");
        
        // Валидация ADR (если передан)
        RuleFor(x => x.Adr)
            .InclusiveBetween(0, 9)
            .When(x => x.Adr.HasValue)
            .WithMessage("ADR class must be between 0 and 9.");
        
        // Валидация Description (если передан)
        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .When(x => x.Description != null)
            .WithMessage("Description must be 500 characters or fewer.");
        
        // Валидация финансовых полей (если переданы)
        RuleFor(x => x.TaxedByCard)
            .GreaterThanOrEqualTo(0)
            .When(x => x.TaxedByCard.HasValue)
            .WithMessage("Taxed by card amount must be greater than or equal to 0.");
        
        RuleFor(x => x.NotTaxedByCard)
            .GreaterThanOrEqualTo(0)
            .When(x => x.NotTaxedByCard.HasValue)
            .WithMessage("Not taxed by card amount must be greater than or equal to 0.");
        
        RuleFor(x => x.ByCash)
            .GreaterThanOrEqualTo(0)
            .When(x => x.ByCash.HasValue)
            .WithMessage("Cash amount must be greater than or equal to 0.");
        
        // Комплексная проверка: хотя бы одно финансовое поле должно быть указано, если грузовик создается для оплачиваемой перевозки
        // (это опционально, зависит от бизнес-логики)
        RuleFor(x => x)
            .Must(x => !x.TaxedByCard.HasValue && !x.NotTaxedByCard.HasValue && !x.ByCash.HasValue ||
                       x.TaxedByCard.GetValueOrDefault(0) + x.NotTaxedByCard.GetValueOrDefault(0) + x.ByCash.GetValueOrDefault(0) > 0)
            .When(x => x.TaxedByCard.HasValue || x.NotTaxedByCard.HasValue || x.ByCash.HasValue)
            .WithMessage("At least one payment method must have a positive amount if payment information is provided.");
    }
}