using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StudentEnrollmentApi.Data;
using StudentEnrollmentApi.Models;

namespace StudentEnrollmentApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                return BadRequest(new AuthResponseDto { Message = "Username / Roll Number already exists" });

            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new AuthResponseDto { Message = "Email already exists" });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = new User
                {
                    Username = dto.Username,
                    Email = dto.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    Role = dto.Role == "Admin" ? "Admin" : "User"
                };

                _context.Users.Add(user);

                if (user.Role == "User")
                {
                    var student = new Student
                    {
                        RollNumber = dto.Username,
                        FirstName = string.IsNullOrEmpty(dto.FirstName) ? "New" : dto.FirstName,
                        LastName = string.IsNullOrEmpty(dto.LastName) ? "Student" : dto.LastName,
                        Email = dto.Email,
                        Phone = dto.Phone ?? string.Empty,
                        DateOfBirth = dto.DateOfBirth ?? System.DateTime.Now.AddYears(-20),
                        EnrollmentDate = System.DateTime.Now
                    };
                    _context.Students.Add(student);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var token = GenerateToken(user);
                return Ok(new AuthResponseDto
                {
                    Token = token,
                    Username = user.Username,
                    Role = user.Role,
                    Message = "Registration successful"
                });
            }
            catch (System.Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new AuthResponseDto { Message = $"An error occurred during registration: {ex.Message}" });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new AuthResponseDto { Message = "Invalid username or password" });

            var token = GenerateToken(user);
            return Ok(new AuthResponseDto
            {
                Token = token,
                Username = user.Username,
                Role = user.Role,
                Message = "Login successful"
            });
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            var username = User.Identity?.Name;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (string.IsNullOrEmpty(username))
                return Unauthorized(new AuthResponseDto { Message = "Not authenticated" });

            return Ok(new AuthResponseDto
            {
                Username = username,
                Role = role ?? "User",
                Message = "Authenticated"
            });
        }

        private string GenerateToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(_configuration["Jwt:ExpiryMinutes"])),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
