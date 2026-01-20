namespace MediBilling.Api.Domain;

public class User
{
    public int Id { get; set; }
    public required string Username { get; set; }
    public required string PasswordHash { get; set; }
    public required string FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; } = true;

    public int BranchId { get; set; }
    public Branch? Branch { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}

