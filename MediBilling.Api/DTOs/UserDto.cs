namespace MediBilling.Api.DTOs;

public record UserDto(
    int Id,
    string Username,
    string FullName,
    string? Email,
    string? Phone,
    bool IsActive,
    int BranchId,
    string BranchName,
    IEnumerable<string> Roles
);

public record CreateUserDto(
    string Username,
    string Password,
    string FullName,
    string? Email,
    string? Phone,
    int BranchId,
    IEnumerable<int> RoleIds
);

public record UpdateUserDto(
    string FullName,
    string? Email,
    string? Phone,
    int BranchId,
    bool IsActive,
    IEnumerable<int> RoleIds
);
