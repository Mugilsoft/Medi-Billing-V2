using MediBilling.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBilling.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats([FromQuery] int? branchId = null)
    {
        var today = DateTime.UtcNow.Date;
        var startOfMonth = new DateTime(today.Year, today.Month, 1);

        var salesQuery = _db.SaleInvoices.AsQueryable();
        var purchaseQuery = _db.Purchases.AsQueryable();
        var stockQuery = _db.StockBatches.AsQueryable();

        if (branchId.HasValue)
        {
            salesQuery = salesQuery.Where(s => s.BranchId == branchId.Value);
            purchaseQuery = purchaseQuery.Where(p => p.BranchId == branchId.Value);
            stockQuery = stockQuery.Where(st => st.BranchId == branchId.Value);
        }

        var totalSalesToday = await salesQuery
            .Where(s => s.InvoiceDate >= today)
            .SumAsync(s => s.TotalAmount);

        var totalSalesMonth = await salesQuery
            .Where(s => s.InvoiceDate >= startOfMonth)
            .SumAsync(s => s.TotalAmount);

        var totalPurchasesMonth = await purchaseQuery
            .Where(p => p.InvoiceDate >= startOfMonth)
            .SumAsync(p => p.TotalAmount);

        var lowStockCount = await stockQuery
            .Where(st => (st.QuantityIn - st.QuantityOut) > 0 && (st.QuantityIn - st.QuantityOut) <= 10)
            .CountAsync();

        var nearExpiryCount = await stockQuery
            .Where(st => (st.QuantityIn - st.QuantityOut) > 0 && st.ExpiryDate <= DateOnly.FromDateTime(today.AddDays(30)))
            .CountAsync();

        var nearExpiryItems = await stockQuery
            .Include(st => st.Medicine)
            .Where(st => (st.QuantityIn - st.QuantityOut) > 0 && st.ExpiryDate <= DateOnly.FromDateTime(today.AddDays(30)))
            .OrderBy(st => st.ExpiryDate)
            .Take(5)
            .Select(st => new {
                MedicineName = st.Medicine!.Name,
                st.BatchNumber,
                st.ExpiryDate,
                AvailableQuantity = st.QuantityIn - st.QuantityOut
            })
            .ToListAsync();

        var mostSellingProducts = await _db.SaleInvoiceItems
            .Include(sii => sii.StockBatch)
                .ThenInclude(sb => sb!.Medicine)
            .GroupBy(sii => sii.StockBatch!.Medicine!.Name)
            .Select(g => new {
                MedicineName = g.Key,
                TotalQuantity = g.Sum(sii => sii.Quantity),
                TotalRevenue = g.Sum(sii => sii.LineTotal)
            })
            .OrderByDescending(x => x.TotalQuantity)
            .Take(5)
            .ToListAsync();

        var recentSales = await salesQuery
            .OrderByDescending(s => s.InvoiceDate)
            .Take(5)
            .Select(s => new {
                s.InvoiceNumber,
                s.InvoiceDate,
                s.TotalAmount,
                PatientName = s.Patient != null ? s.Patient.Name : "Walk-in"
            })
            .ToListAsync();

        return Ok(new
        {
            TotalSalesToday = totalSalesToday,
            TotalSalesMonth = totalSalesMonth,
            TotalPurchasesMonth = totalPurchasesMonth,
            LowStockCount = lowStockCount,
            NearExpiryCount = nearExpiryCount,
            NearExpiryItems = nearExpiryItems,
            MostSellingProducts = mostSellingProducts,
            RecentSales = recentSales
        });
    }
}
