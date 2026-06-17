using FluentValidation;
using Domain.Enums.Load; // Подключи свои enum, чтобы проверить валидность строк

namespace Application.CQRS.LoadCQ.Commands.CreateLoad;

public class CreateLoadCommandValidator : AbstractValidator<CreateLoadCommand>
{
    public CreateLoadCommandValidator()
    {
        RuleFor(x => x.UserId)
            .Must(x => x != Guid.Empty)
            .WithMessage("UserId is required.");

        RuleFor(x => x.Payment)
            .GreaterThan(0).WithMessage("Payment must be greater than 0.");

        RuleFor(x => x.Insurance)
            .GreaterThanOrEqualTo(0).WithMessage("Insurance cannot be negative.");

        RuleFor(x => x.Adr)
            .InclusiveBetween(0, 9).WithMessage("ADR class must be between 0 and 9.");

        RuleFor(x => x.CargoType)
            .NotEmpty().WithMessage("Cargo type is required.")
            .MaximumLength(100);

        RuleFor(x => x.About)
            .MaximumLength(2000).WithMessage("Description is too long.");

        RuleFor(x => x.Duration)
            .NotEmpty().WithMessage("Duration is required.")
            .MaximumLength(20).WithMessage("Duration is too long.")
            .Matches(@"^\d+:\d+:\d+$")
            .WithMessage("Duration must be in format HH:MM:SS, e.g. 00:00:00.");
        
        RuleFor(x => x.Distance)
            .GreaterThan(0).WithMessage("Distance must be positive.");
        
        // Валидация списка грузов
        RuleFor(x => x.Payloads)
            .NotEmpty().WithMessage("At least one payload item is required.");
        
        RuleForEach(x => x.Payloads)
            .SetValidator(new PayloadInputDtoValidator());

        // Валидация маршрута
        RuleFor(x => x.RoutePoints)
            .Must(x => x != null && x.Count >= 2)
            .WithMessage("Route must have at least two points (pickup and delivery).");

        RuleForEach(x => x.RoutePoints)
            .SetValidator(new RoutePointInputDtoValidator());
        
        RuleFor(x => x.VehicleTypes)
            .NotEmpty().WithMessage("At least one vehicle type must be selected.");
    }
}

public class PayloadInputDtoValidator : AbstractValidator<PayloadInputDto>
{
    public PayloadInputDtoValidator()
    {
        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Payload type is required.");
            // Если PayloadType - это Enum, можно добавить проверку:
            // .IsEnumName(typeof(PayloadType), caseSensitive: false)
            // .WithMessage("Payload type one of suggested.");

        RuleFor(x => x.Length)
            .GreaterThan(0).WithMessage("Length must be greater than 0.");

        RuleFor(x => x.Width)
            .GreaterThan(0).WithMessage("Width must be greater than 0.");

        RuleFor(x => x.Height)
            .GreaterThan(0).WithMessage("Height must be greater than 0.");

        RuleFor(x => x.Weight)
            .GreaterThan(0).WithMessage("Weight must be greater than 0.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be at least 1.");
    }
}

public class RoutePointInputDtoValidator : AbstractValidator<RoutePointInputDto>
{
    public RoutePointInputDtoValidator()
    {
        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required.")
            .MaximumLength(100);

        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Address is required.")
            .MaximumLength(250);

        RuleFor(x => x.ArrivalTime)
            .NotEmpty().WithMessage("Arrival time is required.")
            // Проверка, что дата не из прошлого (опционально)
            .Must(time => time >= DateTime.UtcNow.AddMinutes(-1)) 
            .WithMessage("Arrival time cannot be in the past.");
    }
}