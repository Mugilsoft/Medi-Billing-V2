namespace MediBilling.Api.Domain;

public class PrescriptionItem
{
    public int Id { get; set; }

    public int PrescriptionId { get; set; }
    public Prescription? Prescription { get; set; }

    public int MedicineId { get; set; }
    public Medicine? Medicine { get; set; }

    public required string Dosage { get; set; } // e.g., 1-0-1
    public required string Duration { get; set; } // e.g., 5 days
    public string? Instructions { get; set; }
}

