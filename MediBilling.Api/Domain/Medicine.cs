namespace MediBilling.Api.Domain;

public class Medicine
{
    public int Id { get; set; }
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? GenericName { get; set; }
    public string? Manufacturer { get; set; }
    public string? Unit { get; set; } // Tablet, Strip, Bottle, etc.

    public decimal GstPercentage { get; set; }
    public bool IsActive { get; set; } = true;
    public int LowStockThreshold { get; set; }

    public ICollection<StockBatch> StockBatches { get; set; } = new List<StockBatch>();
}

