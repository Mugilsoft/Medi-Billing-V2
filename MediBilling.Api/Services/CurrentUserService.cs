using System.Security.Claims;

namespace MediBilling.Api.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int? UserId
    {
        get
        {
            var id = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(id, out var userId) ? userId : null;
        }
    }

    public int? BranchId
    {
        get
        {
            var id = _httpContextAccessor.HttpContext?.User?.FindFirstValue("branchId");
            return int.TryParse(id, out var branchId) ? branchId : null;
        }
    }

    public bool IsAdmin => _httpContextAccessor.HttpContext?.User?.IsInRole("Admin") ?? false;
}
