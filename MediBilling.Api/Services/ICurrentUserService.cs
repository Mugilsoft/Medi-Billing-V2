namespace MediBilling.Api.Services;

public interface ICurrentUserService
{
    int? UserId { get; }
    int? BranchId { get; }
    bool IsAdmin { get; }
}
