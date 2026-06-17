using Application.CQRS.LoadCQ.Commands.CreateLoad;
using FluentValidation;

namespace Application.CQRS.LoadCQ.Commands.Draft.Create;

/// <summary>
/// Валидатор для создания черновика груза.
/// Все scalar-поля опциональны (null допускается), но если переданы — должны быть валидны.
/// RoutePoint, если указан, не должен содержать пустых полей.
/// Payload, если указан, валидируется частично: заполненные поля должны быть корректны.
/// </summary>
public class CreateLoadDraftCommandValidator : AbstractValidator<CreateLoadDraftCommand>
{
    public CreateLoadDraftCommandValidator()
    {
        RuleFor(x => x.UserId)
            .Must(x => x != Guid.Empty)
            .WithMessage("UserId is required.");

        // Опциональные scalar-поля: проверяем только если заданы
        RuleFor(x => x.Payment)
            .GreaterThan(0)
            .When(x => x.Payment.HasValue && x.Payment != 0)
            .WithMessage("Payment must be greater than 0.");

        RuleFor(x => x.Insurance)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Insurance.HasValue)
            .WithMessage("Insurance cannot be negative.");

        RuleFor(x => x.Adr)
            .InclusiveBetween(0, 9)
            .When(x => x.Adr.HasValue)
            .WithMessage("ADR class must be between 0 and 9.");

        RuleFor(x => x.CargoType)
            .NotEmpty()
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.CargoType))
            .WithMessage("Cargo type cannot be empty.");

        RuleFor(x => x.HScode)
            .MaximumLength(50)
            .When(x => !string.IsNullOrEmpty(x.HScode));

        RuleFor(x => x.About)
            .MaximumLength(2000)
            .When(x => !string.IsNullOrEmpty(x.About));

        RuleFor(x => x.VehicleTypes)
            .Must(x => x != null && x.Length > 0)
            .When(x => x.VehicleTypes != null && x.VehicleTypes?.Length != 0)
            .WithMessage("Vehicle types cannot be empty.");

        // RoutePoints: если переданы, каждая точка должна быть заполнена
        RuleForEach(x => x.RoutePoints)
            .SetValidator(new RoutePointDraftInputDtoValidator())
            .When(x => x.RoutePoints != null);

        // Payloads: если переданы, валидируем каждый элемент
        RuleForEach(x => x.Payloads)
            .SetValidator(new PayloadDraftInputDtoValidator())
            .When(x => x.Payloads != null);
    }
}


public class RoutePointDraftInputDtoValidator : AbstractValidator<RoutePointInputDto>
{
    public RoutePointDraftInputDtoValidator()
    {
        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required.")
            .MaximumLength(100);

        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Address is required.")
            .MaximumLength(250);

        RuleFor(x => x.ArrivalTime)
            .NotEmpty().WithMessage("Arrival time is required.");
    }
}

public class PayloadDraftInputDtoValidator : AbstractValidator<PayloadDraftInputDto>
{
    public PayloadDraftInputDtoValidator()
    {
        RuleFor(x => x.Type)
            .NotEmpty()
            .When(x => !string.IsNullOrEmpty(x.Type))
            .WithMessage("Payload type cannot be empty.")
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.Type));

        RuleFor(x => x.Length)
            .GreaterThan(0)
            .When(x => x.Length.HasValue && x.Length != 0)
            .WithMessage("Length must be greater than 0.");

        RuleFor(x => x.Width)
            .GreaterThan(0)
            .When(x => x.Width.HasValue && x.Width != 0)
            .WithMessage("Width must be greater than 0.");

        RuleFor(x => x.Height)
            .GreaterThan(0)
            .When(x => x.Height.HasValue && x.Height != 0)
            .WithMessage("Height must be greater than 0.");

        RuleFor(x => x.Weight)
            .GreaterThan(0)
            .When(x => x.Weight.HasValue && x.Weight != 0)
            .WithMessage("Weight must be greater than 0.");

        RuleFor(x => x.Amount)
            .GreaterThanOrEqualTo(1)
            .When(x => x.Amount.HasValue && x.Amount != 0)
            .WithMessage("Amount must be at least 1.");
    }
}