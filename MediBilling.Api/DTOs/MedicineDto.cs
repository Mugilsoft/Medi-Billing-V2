namespace MediBilling.Api.DTOs;

public class MedicineDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? GenericName { get; set; }
    public string? Manufacturer { get; set; }
    public string? Unit { get; set; }
    public decimal GstPercentage { get; set; }
    public bool IsActive { get; set; }
    
}
