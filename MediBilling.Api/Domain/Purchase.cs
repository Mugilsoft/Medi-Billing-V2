namespace MediBilling.Api.Domain;

public class Purchase
{
    public int Id { get; set; }
    public required string InvoiceNumber { get; set; }
    public DateTime InvoiceDate { get; set; }

    public int SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    public int BranchId { get; set; }
    public Branch? Branch { get; set; }

    public decimal SubTotal { get; set; }
    public decimal GstAmount { get; set; }
    public decimal TotalAmount { get; set; }

    public ICollection<PurchaseItem> Items { get; set; } = new List<PurchaseItem>();
}

