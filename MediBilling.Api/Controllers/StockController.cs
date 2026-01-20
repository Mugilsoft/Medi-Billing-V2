using MediBilling.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBilling.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StockController : ControllerBase
{
    private readonly AppDbContext _db;

    public StockController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentStock([FromQuery] int? branchId = null)
    {
        var query = _db.StockBatches
            .Include(b => b.Medicine)
            .Include(b => b.Branch)
            .AsQueryable();

        if (branchId.HasValue)
        {
            query = query.Where(b => b.BranchId == branchId.Value);
        }

        var result = await query
            .Where(b => (b.QuantityIn - b.QuantityOut) > 0)
            .OrderBy(b => b.Medicine!.Name)
            .ThenBy(b => b.ExpiryDate)
            .Select(b => new
            {
                b.Id,
                MedicineId = b.MedicineId,
                MedicineName = b.Medicine!.Name,
                b.BranchId,
                BranchName = b.Branch!.Name,
                b.BatchNumber,
                b.ManufactureDate,
                b.ExpiryDate,
                AvailableQuantity = b.QuantityIn - b.QuantityOut,
                b.PurchasePrice,
                b.SalePrice
            })
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("alerts")]
    public async Task<IActionResult> GetAlerts(
        [FromQuery] int? branchId = null,
        [FromQuery] int daysToExpiry = 30,
        [FromQuery] int lowStockThreshold = 10)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
        var expiryLimit = today.AddDays(daysToExpiry);

        var query = _db.StockBatches
            .Include(b => b.Medicine)
            .Include(b => b.Branch)
            .AsQueryable();

        if (branchId.HasValue)
        {
            query = query.Where(b => b.BranchId == branchId.Value);
        }

        var result = await query
            .Where(b => (b.QuantityIn - b.QuantityOut) > 0)
            .Select(b => new
            {
                b.Id,
                MedicineId = b.MedicineId,
                MedicineName = b.Medicine!.Name,
                b.BranchId,
                BranchName = b.Branch!.Name,
                b.BatchNumber,
                b.ExpiryDate,
                AvailableQuantity = b.QuantityIn - b.QuantityOut,
                IsNearExpiry = b.ExpiryDate <= expiryLimit,
                IsLowStock = (b.QuantityIn - b.QuantityOut) <= lowStockThreshold
            })
            .Where(x => x.IsNearExpiry || x.IsLowStock)
            .OrderBy(x => x.ExpiryDate)
            .ToListAsync();

        return Ok(result);
    }
}

