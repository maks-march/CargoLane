using FluentValidation;

namespace Application.CQRS.TruckCQ.Commands.Create;

/// <summary>
/// Валидатор команды создания грузового транспортного средства
/// </summary>
public class CreateTruckCommandValidator : AbstractValidator<CreateTruckCommand>
{
    public CreateTruckCommandValidator()
    {
        // Обязательные поля
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required.");
        
        RuleFor(x => x.BodyType)
            .NotEmpty()
            .WithMessage("Body type is required.")
            .MaximumLength(50)
            .WithMessage("Body type must be 50 characters or fewer.")
            .Matches(@"^[a-zA-Zа-яА-Я\s\-]+$")
            .WithMessage("Body type can only contain letters, spaces, and hyphens.");
        
        RuleFor(x => x.LoadType)
            .NotEmpty()
            .WithMessage("Load type is required.")
            .Must(loadTypes => loadTypes.Count > 0)
            .WithMessage("Load type must contain at least one value.")
            .Must(loadTypes => loadTypes.All(lt => !string.IsNullOrWhiteSpace(lt)))
            .WithMessage("Load type values cannot be empty.")
            .Must(loadTypes => loadTypes.All(lt => lt.Length <= 30))
            .WithMessage("Each load type must be 30 characters or fewer.");
        
        RuleFor(x => x.UnloadType)
            .NotEmpty()
            .WithMessage("Unload type is required.")
            .Must(unloadTypes => unloadTypes.Count > 0)
            .WithMessage("Unload type must contain at least one value.")
            .Must(unloadTypes => unloadTypes.All(ut => !string.IsNullOrWhiteSpace(ut)))
            .WithMessage("Unload type values cannot be empty.")
            .Must(unloadTypes => unloadTypes.All(ut => ut.Length <= 30))
            .WithMessage("Each unload type must be 30 characters or fewer.");
        
        RuleFor(x => x.Vehicles)
            .NotEmpty()
            .WithMessage("Vehicles count is required.")
            .InclusiveBetween(1, 100)
            .WithMessage("Vehicles count must be between 1 and 100.");
        
        RuleFor(x => x.Adr)
            .InclusiveBetween(0, 9)
            .WithMessage("ADR class must be between 0 and 9.");
        
        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage("Description must be 500 characters or fewer.");
        
        // Валидация температурного режима (опционально, если рефрижератор)
        When(x => x.BodyType?.ToLower() == "рефрижератор" || x.BodyType?.ToLower() == "refrigerator", () =>
        {
            RuleFor(x => x.TemperatureFrom)
                .NotNull()
                .WithMessage("Temperature from is required for refrigerator body type.")
                .InclusiveBetween(-50, 50)
                .WithMessage("Temperature from must be between -50°C and 50°C.");
            
            RuleFor(x => x.TemperatureTo)
                .NotNull()
                .WithMessage("Temperature to is required for refrigerator body type.")
                .InclusiveBetween(-50, 50)
                .WithMessage("Temperature to must be between -50°C and 50°C.");
            
            RuleFor(x => x)
                .Must(x => x.TemperatureFrom <= x.TemperatureTo)
                .WithMessage("Temperature from must be less than or equal to temperature to.");
        });
        
        // Валидация финансовых полей
        RuleFor(x => x.TaxedByCard)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Taxed by card amount must be greater than or equal to 0.");
        
        RuleFor(x => x.NotTaxedByCard)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Not taxed by card amount must be greater than or equal to 0.");
        
        RuleFor(x => x.ByCash)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Cash amount must be greater than or equal to 0.");
        
        RuleFor(x => x)
            .Must(x => x.TaxedByCard + x.NotTaxedByCard + x.ByCash > 0)
            .WithMessage("At least one payment method must have a positive amount.");
    }
}