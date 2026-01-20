namespace MediBilling.Api.Domain;

public class Role
{
    public int Id { get; set; }
    public required string Name { get; set; } // e.g., Admin, Pharmacist, Doctor, BillingClerk
    public string? Description { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}

