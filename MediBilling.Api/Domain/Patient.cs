namespace MediBilling.Api.Domain;

public class Patient
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
}

