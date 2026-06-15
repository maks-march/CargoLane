using FluentValidation;

namespace Application.CQRS.UserCQ.Commands.UpdateProfile;

public class UpdateUserProfileValidator : AbstractValidator<UpdateUserProfileCommand>
{
    public UpdateUserProfileValidator()
    {
        RuleFor(x => x.FirstName)
            .MaximumLength(50)
            .When(x => x.FirstName != null);

        RuleFor(x => x.LastName)
            .MaximumLength(50)
            .When(x => x.LastName != null);

        RuleFor(x => x.NickName)
            .MaximumLength(30)
            .When(x => x.NickName != null);

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20)
            .When(x => x.PhoneNumber != null);

        RuleFor(x => x.Country)
            .MaximumLength(100)
            .When(x => x.Country != null);

        RuleFor(x => x.City)
            .MaximumLength(100)
            .When(x => x.City != null);

        RuleFor(x => x.Address)
            .MaximumLength(200)
            .When(x => x.Address != null);
    }
}