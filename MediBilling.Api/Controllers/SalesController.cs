using MediBilling.Api.Data;
using MediBilling.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBilling.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SalesController : ControllerBase
{
    private readonly AppDbContext _db;

    public SalesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var sales = await _db.SaleInvoices
            .Include(s => s.Branch)
            .Include(s => s.Patient)
            .OrderByDescending(s => s.InvoiceDate)
            .ToListAsync();
        return Ok(sales);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var sale = await _db.SaleInvoices
            .Include(s => s.Branch)
            .Include(s => s.Patient)
            .Include(s => s.Items)
                .ThenInclude(i => i.StockBatch)
                    .ThenInclude(b => b!.Medicine)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale == null) return NotFound();

        return Ok(sale);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaleCreateDto dto)
    {
        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var invoice = new SaleInvoice
            {
                InvoiceNumber = $"INV-{DateTime.Now:yyyyMMddHHmmss}",
                InvoiceDate = DateTime.Now,
                BranchId = dto.BranchId,
                PatientId = dto.PatientId,
                SubTotal = 0,
                GstAmount = 0,
                TotalAmount = 0
            };

            foreach (var itemDto in dto.Items)
            {
                var stock = await _db.StockBatches
                    .Include(b => b.Medicine)
                    .FirstOrDefaultAsync(b => b.Id == itemDto.StockBatchId);

                if (stock == null || stock.AvailableQuantity < itemDto.Quantity)
                {
                    return BadRequest($"Insufficient stock for batch {stock?.BatchNumber ?? itemDto.StockBatchId.ToString()}");
                }

                // Deduct stock by increasing QuantityOut
                stock.QuantityOut += itemDto.Quantity;

                var lineTotal = itemDto.Quantity * stock.SalePrice;
                var gst = lineTotal * (stock.Medicine?.GstPercentage ?? 0) / 100;

                var invoiceItem = new SaleInvoiceItem
                {
                    StockBatchId = itemDto.StockBatchId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = stock.SalePrice,
                    GstPercentage = stock.Medicine?.GstPercentage ?? 0,
                    LineTotal = lineTotal + gst
                };

                invoice.Items.Add(invoiceItem);
                invoice.SubTotal += lineTotal;
                invoice.GstAmount += gst;
                invoice.TotalAmount += (lineTotal + gst);
            }

            _db.SaleInvoices.Add(invoice);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, invoice);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    public class SaleCreateDto
    {
        public int BranchId { get; set; }
        public int? PatientId { get; set; }
        public List<SaleItemDto> Items { get; set; } = new();
    }

    public class SaleItemDto
    {
        public int StockBatchId { get; set; }
        public int Quantity { get; set; }
    }
}
