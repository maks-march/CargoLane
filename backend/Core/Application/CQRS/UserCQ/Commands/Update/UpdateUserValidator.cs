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

        RuleFor(x => x.NickName)
            .MaximumLength(30).WithMessage("Nickname is too long")
            .When(x => x.NickName != null);  // Validate only if value is provided

        RuleFor(x => x.TimeZone)
            .InclusiveBetween(-12, 14).WithMessage("Invalid time zone")
            .When(x => x.TimeZone != null);  // Validate only if value is provided

        RuleFor(x => x.PhoneNumber)
            .Matches(@"^\+?[1-9]\d{1,14}$")
            .WithMessage("Invalid phone number format")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber));  // Validate if not null and not empty string

        RuleFor(x => x.PostalCode)
            .MaximumLength(10).WithMessage("Postal code is too long")
            .When(x => x.PostalCode != null);  // Validate only if value is provided

        RuleFor(x => x.CompanyName)
            .MaximumLength(100)
            .When(x => x.CompanyName != null);  // Validate only if value is provided
            
        RuleFor(x => x.Purpose)
            .NotEmpty()
            .WithMessage("Purpose cannot be an empty string")
            .When(x => x.Purpose != null);  // Validate only if value is provided (if not null, then not empty)
        
        // Check that if NickName is provided, it's not just whitespace
        RuleFor(x => x.NickName)
            .Must(nickname => !string.IsNullOrWhiteSpace(nickname))
            .WithMessage("Nickname cannot consist only of whitespace")
            .When(x => x.NickName != null);
    }
}