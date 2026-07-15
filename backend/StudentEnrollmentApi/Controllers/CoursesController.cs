using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentEnrollmentApi.Data;
using StudentEnrollmentApi.Models;

namespace StudentEnrollmentApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CoursesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CoursesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<IEnumerable<Course>>> GetCourses()
        {
            return await _context.Courses.ToListAsync();
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<Course>> GetCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound();
            return course;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Course>> PostCourse(CourseCreateDto dto)
        {
            try
            {
                var course = new Course
                {
                    CourseName = dto.CourseName,
                    CourseCode = dto.CourseCode,
                    Description = dto.Description,
                    Credits = dto.Credits,
                    Instructor = dto.Instructor,
                    MaxCapacity = dto.MaxCapacity
                };

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetCourse), new { id = course.CourseId }, course);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutCourse(int id, CourseCreateDto dto)
        {
            try
            {
                var course = await _context.Courses.FindAsync(id);
                if (course == null) return NotFound();

                course.CourseName = dto.CourseName;
                course.CourseCode = dto.CourseCode;
                course.Description = dto.Description;
                course.Credits = dto.Credits;
                course.Instructor = dto.Instructor;
                course.MaxCapacity = dto.MaxCapacity;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            try
            {
                var course = await _context.Courses.FindAsync(id);
                if (course == null) return NotFound();
                _context.Courses.Remove(course);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, inner = ex.InnerException?.Message });
            }
        }
    }
}
