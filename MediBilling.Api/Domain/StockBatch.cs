namespace MediBilling.Api.Domain;

public class StockBatch
{
    public int Id { get; set; }

    public int MedicineId { get; set; }
    public Medicine? Medicine { get; set; }

    public int BranchId { get; set; }
    public Branch? Branch { get; set; }

    public required string BatchNumber { get; set; }
    public DateOnly? ManufactureDate { get; set; }
    public DateOnly ExpiryDate { get; set; }

    public int QuantityIn { get; set; }
    public int QuantityOut { get; set; }

    public decimal PurchasePrice { get; set; }
    public decimal SalePrice { get; set; }
    public decimal Mrp { get; set; }

    public int AvailableQuantity => QuantityIn - QuantityOut;
}

