using FluentValidation;

namespace Application.CQRS.UserCQ.Commands.UploadAvatar;

public class UploadUserAvatarValidator : AbstractValidator<UploadUserAvatarCommand>
{
    public UploadUserAvatarValidator()
    {
        RuleFor(x => x.Avatar)
            .NotNull()
            .WithMessage("Avatar file is required");

        RuleFor(x => x.Avatar!.Length)
            .LessThanOrEqualTo(25 * 1024 * 1024) // 5 MB
            .WithMessage("Avatar size must be less than 25 MB")
            .When(x => x.Avatar != null);

        RuleFor(x => x.Avatar!.ContentType)
            .Must(type => type is "image/jpeg" or "image/png" or "image/webp")
            .WithMessage("Only JPEG, PNG or WEBP images are allowed")
            .When(x => x.Avatar != null);
    }
}