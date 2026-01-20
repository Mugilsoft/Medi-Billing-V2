namespace MediBilling.Api.Domain;

public class SaleInvoiceItem
{
    public int Id { get; set; }

    public int SaleInvoiceId { get; set; }
    public SaleInvoice? SaleInvoice { get; set; }

    public int StockBatchId { get; set; }
    public StockBatch? StockBatch { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal GstPercentage { get; set; }
    public decimal LineTotal { get; set; }
}

