using FluentValidation;

namespace Application.CQRS.UserCQ.Commands.Create;

public class CreateUserValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserValidator()
    {
        RuleFor(command => command.Login)
            .NotEmpty()
            .MaximumLength(50);
        RuleFor(command => command.Password)
            .NotEmpty()
            .MaximumLength(50);
        RuleFor(command => command.Password)
            .NotEmpty()
            .MaximumLength(50);
        RuleFor(command => command.Password)
            .NotEmpty()
            .MaximumLength(256);
    }
}