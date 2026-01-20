using MediBilling.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBilling.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReportsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("sales")]
    public async Task<IActionResult> GetSalesReport(
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate, 
        [FromQuery] int? branchId)
    {
        var query = _db.SaleInvoices
            .Include(s => s.Patient)
            .Include(s => s.Branch)
            .AsNoTracking()
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(s => s.InvoiceDate >= startDate.Value.Date);
        
        if (endDate.HasValue)
        {
            var endOfDay = endDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(s => s.InvoiceDate <= endOfDay);
        }

        if (branchId.HasValue)
            query = query.Where(s => s.BranchId == branchId.Value);

        var result = await query
            .OrderByDescending(s => s.InvoiceDate)
            .Select(s => new {
                s.InvoiceNumber,
                s.InvoiceDate,
                BranchName = s.Branch != null ? s.Branch.Name : "N/A",
                PatientName = s.Patient != null ? s.Patient.Name : "Walk-in",
                s.SubTotal,
                s.GstAmount,
                s.TotalAmount
            })
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("inventory")]
    public async Task<IActionResult> GetInventoryReport([FromQuery] int? branchId)
    {
        var query = _db.StockBatches
            .Include(b => b.Medicine)
            .Include(b => b.Branch)
            .AsNoTracking()
            .AsQueryable();

        if (branchId.HasValue)
            query = query.Where(b => b.BranchId == branchId.Value);

        var result = await query
            .Where(b => b.AvailableQuantity > 0)
            .OrderBy(b => b.Medicine != null ? b.Medicine.Name : "Unknown")
            .Select(b => new {
                MedicineName = b.Medicine != null ? b.Medicine.Name : "N/A",
                BranchName = b.Branch != null ? b.Branch.Name : "N/A",
                b.BatchNumber,
                b.ExpiryDate,
                b.AvailableQuantity,
                b.PurchasePrice,
                b.SalePrice,
                StockValue = b.AvailableQuantity * b.PurchasePrice
            })
            .ToListAsync();

        return Ok(result);
    }
}
