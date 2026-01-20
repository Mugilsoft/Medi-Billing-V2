namespace MediBilling.Api.Domain;

public class PurchaseItem
{
    public int Id { get; set; }

    public int PurchaseId { get; set; }
    public Purchase? Purchase { get; set; }

    public int MedicineId { get; set; }
    public Medicine? Medicine { get; set; }

    public int BranchId { get; set; }
    public Branch? Branch { get; set; }

    public required string BatchNumber { get; set; }
    public DateOnly? ManufactureDate { get; set; }
    public DateOnly ExpiryDate { get; set; }

    public int Quantity { get; set; }
    public decimal PurchasePrice { get; set; }
    public decimal SalePrice { get; set; }
    public decimal Mrp { get; set; }
    public decimal GstPercentage { get; set; }
    public decimal LineTotal { get; set; }
}

