using FluentValidation;

namespace Application.CQRS.UserCQ.Commands.Create;

public class CreateUserValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserValidator()
    {
        RuleFor(command => command.FirstName)
            .NotEmpty()
            .MaximumLength(50);
        RuleFor(command => command.LastName)
            .NotEmpty()
            .MaximumLength(50);
        RuleFor(command => command.LastName)
            .NotEmpty()
            .MaximumLength(50);
        RuleFor(command => command.LastName)
            .NotEmpty()
            .MaximumLength(256);
    }
}