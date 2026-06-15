using FluentValidation;

namespace Application.CQRS.UserCQ.Queries.GetUserDetails;

public class GetUserDetailsValidator : AbstractValidator<GetUserDetailsQuery>
{
    public GetUserDetailsValidator()
    {
        RuleFor(query => query.Id).NotEmpty().WithMessage("Id is required.");
    }
}