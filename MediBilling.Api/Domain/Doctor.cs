namespace MediBilling.Api.Domain;

public class Doctor
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? RegistrationNumber { get; set; }
    public string? Specialization { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
}

