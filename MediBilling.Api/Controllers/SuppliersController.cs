using MediBilling.Api.Data;
using MediBilling.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediBilling.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SuppliersController : ControllerBase
{
    private readonly AppDbContext _db;

    public SuppliersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Supplier>>> GetAll()
    {
        var suppliers = await _db.Suppliers
            .OrderBy(s => s.Name)
            .ToListAsync();

        return Ok(suppliers);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Supplier>> GetById(int id)
    {
        var supplier = await _db.Suppliers.FindAsync(id);
        if (supplier == null) return NotFound();
        return Ok(supplier);
    }

    [HttpPost]
    public async Task<ActionResult<Supplier>> Create(Supplier supplier)
    {
        _db.Suppliers.Add(supplier);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = supplier.Id }, supplier);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Supplier supplier)
    {
        if (id != supplier.Id) return BadRequest();

        _db.Entry(supplier).State = EntityState.Modified;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var supplier = await _db.Suppliers.FindAsync(id);
        if (supplier == null) return NotFound();

        _db.Suppliers.Remove(supplier);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}

