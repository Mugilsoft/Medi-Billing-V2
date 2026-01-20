namespace MediBilling.Api.Domain;

public class Supplier
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? SupplierCode { get; set; }

    public string? ContactPerson { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }

    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }

    public string? GstNumber { get; set; }
    public bool IsActive { get; set; } = true;

    // Optional: if suppliers are branch-specific
    public int? BranchId { get; set; }
    public Branch? Branch { get; set; }
}

