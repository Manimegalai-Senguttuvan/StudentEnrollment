namespace StudentEnrollmentApi.Models
{
    public class EnrollmentCreateDto
    {
        public int StudentId { get; set; }
        public int CourseId { get; set; }
        public string Grade { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
    }
}
