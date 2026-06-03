using Application.Common.Extensions;
using FluentValidation;

namespace Application.CQRS.OrderCQ.Commands.Create.Validators;

public class RoutePointDtoValidator : AbstractValidator<RoutePointVm>
{
    public RoutePointDtoValidator()
    {
        // City и Address - обязательные текстовые поля с ограничением длины
        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required.")
            .MaximumLength(100).WithMessage("City name cannot exceed 100 characters.");

        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Address is required.")
            .MaximumLength(100).WithMessage("Address cannot exceed 100 characters.");

        // Date - дата должна быть указана и не может быть в далеком прошлом
        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Date for the route point is required.")
            .GreaterThan(DateTime.Now.AddDays(-1).ToDateOnly()).WithMessage("Date cannot be in the past.");
            
        // LoadTimeEnd должно быть больше или равно LoadTimeStart
        RuleFor(x => x.LoadTimeEnd)
            .GreaterThanOrEqualTo(x => x.LoadTimeStart)
            .WithMessage("'Load time end' must be after or the same as 'Load time start'.")
            .When(x => x.LoadTimeStart != TimeSpan.Zero && x.LoadTimeEnd != TimeSpan.Zero);
    }
}