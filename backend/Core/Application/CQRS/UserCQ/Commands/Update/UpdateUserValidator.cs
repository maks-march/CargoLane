using FluentValidation;

namespace Application.CQRS.UserCQ.Commands.Update;

public class UpdateUserValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserValidator()
    {
        RuleFor(x => x.FirstName)
            .MaximumLength(50).WithMessage("First name is too long")
            .When(x => x.FirstName != null);  // Validate only if value is provided

        RuleFor(x => x.LastName)
            .MaximumLength(50).WithMessage("Last name is too long")
            .When(x => x.LastName != null);  // Validate only if value is provided

        RuleFor(x => x.DisplayName)
            .MaximumLength(30).WithMessage("DisplayName is too long")
            .When(x => x.DisplayName != null);  // Validate only if value is provided

        RuleFor(x => x.Timezone)
            .InclusiveBetween(-12, 14).WithMessage("Invalid time zone")
            .When(x => x.Timezone != null);  // Validate only if value is provided

        RuleFor(x => x.Phone)
            .Matches(@"^\+?[1-9]\d{1,14}$")
            .WithMessage("Invalid phone number format")
            .When(x => !string.IsNullOrEmpty(x.Phone));  // Validate if not null and not empty string

        RuleFor(x => x.PostalCode)
            .MaximumLength(10).WithMessage("Postal code is too long")
            .When(x => x.PostalCode != null);  // Validate only if value is provided

        RuleFor(x => x.CompanyName)
            .MaximumLength(100)
            .When(x => x.CompanyName != null);  // Validate only if value is provided
        
        // Check that if NickName is provided, it's not just whitespace
        RuleFor(x => x.DisplayName)
            .Must(nickname => !string.IsNullOrWhiteSpace(nickname))
            .WithMessage("Nickname cannot consist only of whitespace")
            .When(x => x.DisplayName != null);
    }
}