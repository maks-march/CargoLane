using FluentValidation;

namespace Application.CQRS.UserCQ.Commands.UpdateCompany;

public class UpdateUserCompanyValidator : AbstractValidator<UpdateUserCompanyCommand>
{
    public UpdateUserCompanyValidator()
    {
        RuleFor(x => x.CompanyName)
            .MaximumLength(100)
            .When(x => x.CompanyName != null);

        RuleFor(x => x.CompanyCountry)
            .MaximumLength(100)
            .When(x => x.CompanyCountry != null);

        RuleFor(x => x.CompanyType)
            .MaximumLength(50)
            .When(x => x.CompanyType != null);
    }
}