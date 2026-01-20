namespace MediBilling.Api.Domain;

public class SaleInvoice
{
    public int Id { get; set; }
    public required string InvoiceNumber { get; set; }
    public DateTime InvoiceDate { get; set; }

    public int BranchId { get; set; }
    public Branch? Branch { get; set; }

    public int? PatientId { get; set; }
    public Patient? Patient { get; set; }

    public decimal SubTotal { get; set; }
    public decimal GstAmount { get; set; }
    public decimal TotalAmount { get; set; }

    public ICollection<SaleInvoiceItem> Items { get; set; } = new List<SaleInvoiceItem>();
}

