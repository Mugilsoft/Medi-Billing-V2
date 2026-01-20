using MediBilling.Api.Data;
using MediBilling.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBilling.Api.Controllers;

public record PurchaseItemDto(
    int MedicineId,
    string BatchNumber,
    DateOnly? ManufactureDate,
    DateOnly ExpiryDate,
    int Quantity,
    decimal PurchasePrice,
    decimal SalePrice,
    decimal GstPercentage
);

public record CreatePurchaseRequest(
    string InvoiceNumber,
    DateTime InvoiceDate,
    int SupplierId,
    int BranchId,
    List<PurchaseItemDto> Items
);

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PurchasesController : ControllerBase
{
    private readonly AppDbContext _db;

    public PurchasesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Purchase>>> GetAll()
    {
        var purchases = await _db.Purchases
            .Include(p => p.Supplier)
            .Include(p => p.Branch)
            .OrderByDescending(p => p.InvoiceDate)
            .Take(100)
            .ToListAsync();

        return Ok(purchases);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Purchase>> GetById(int id)
    {
        var purchase = await _db.Purchases
            .Include(p => p.Supplier)
            .Include(p => p.Branch)
            .Include(p => p.Items)
                .ThenInclude(i => i.Medicine)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (purchase == null) return NotFound();

        return Ok(purchase);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreatePurchaseRequest request)
    {
        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            if (request.Items.Count == 0)
            {
                return BadRequest("At least one item is required.");
            }

            var purchase = new Purchase
            {
                InvoiceNumber = request.InvoiceNumber,
                InvoiceDate = request.InvoiceDate,
                SupplierId = request.SupplierId,
                BranchId = request.BranchId,
            };

            decimal subTotal = 0;
            decimal gstTotal = 0;

            foreach (var item in request.Items)
            {
                var lineBase = item.Quantity * item.PurchasePrice;
                var lineGst = Math.Round(lineBase * item.GstPercentage / 100m, 2);
                var lineTotal = lineBase + lineGst;

                purchase.Items.Add(new PurchaseItem
                {
                    MedicineId = item.MedicineId,
                    BranchId = request.BranchId,
                    BatchNumber = item.BatchNumber,
                    ManufactureDate = item.ManufactureDate,
                    ExpiryDate = item.ExpiryDate,
                    Quantity = item.Quantity,
                    PurchasePrice = item.PurchasePrice,
                    SalePrice = item.SalePrice,
                    GstPercentage = item.GstPercentage,
                    LineTotal = lineTotal
                });

                // Update or create stock batch
                var stockBatch = await _db.StockBatches.FirstOrDefaultAsync(b =>
                    b.MedicineId == item.MedicineId &&
                    b.BranchId == request.BranchId &&
                    b.BatchNumber == item.BatchNumber &&
                    b.ExpiryDate == item.ExpiryDate);

                if (stockBatch == null)
                {
                    stockBatch = new StockBatch
                    {
                        MedicineId = item.MedicineId,
                        BranchId = request.BranchId,
                        BatchNumber = item.BatchNumber,
                        ManufactureDate = item.ManufactureDate,
                        ExpiryDate = item.ExpiryDate,
                        QuantityIn = item.Quantity,
                        QuantityOut = 0,
                        PurchasePrice = item.PurchasePrice,
                        SalePrice = item.SalePrice
                    };
                    _db.StockBatches.Add(stockBatch);
                }
                else
                {
                    stockBatch.QuantityIn += item.Quantity;
                    stockBatch.PurchasePrice = item.PurchasePrice;
                    stockBatch.SalePrice = item.SalePrice;
                }

                subTotal += lineBase;
                gstTotal += lineGst;
            }

            purchase.SubTotal = subTotal;
            purchase.GstAmount = gstTotal;
            purchase.TotalAmount = subTotal + gstTotal;

            _db.Purchases.Add(purchase);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetById), new { id = purchase.Id }, purchase);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}

