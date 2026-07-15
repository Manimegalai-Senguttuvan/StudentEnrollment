namespace StudentEnrollmentApi.Models
{
    public class CourseCreateDto
    {
        public string CourseName { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Credits { get; set; }
        public string Instructor { get; set; } = string.Empty;
        public int MaxCapacity { get; set; }
    }
}
