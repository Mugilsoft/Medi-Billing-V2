using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MediBilling.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace MediBilling.Api.Controllers;

public record LoginRequest(string Username, string Password);

public record LoginResponse(string Token, DateTime ExpiresAt, string Username, string[] Roles);

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

        if (user == null)
        {
            return Unauthorized("Invalid username or password.");
        }

        bool isPasswordValid = false;
        bool needsUpgrade = false;

        try
        {
            isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            // Fallback for legacy plain-text passwords
            isPasswordValid = user.PasswordHash == request.Password;
            needsUpgrade = isPasswordValid;
        }

        if (!isPasswordValid)
        {
            return Unauthorized("Invalid username or password.");
        }

        if (needsUpgrade)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            await _db.SaveChangesAsync();
        }




        var roles = user.UserRoles.Select(ur => ur.Role!.Name).ToArray();

        var jwtSection = _configuration.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expiresMinutes = int.TryParse(jwtSection["ExpiryMinutes"], out var m) ? m : 60;
        var expiresAt = DateTime.UtcNow.AddMinutes(expiresMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, user.Username),
            new("fullName", user.FullName),
            new("branchId", user.BranchId.ToString())
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: jwtSection["Issuer"],
            audience: jwtSection["Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new LoginResponse(tokenString, expiresAt, user.Username, roles));
    }
}

