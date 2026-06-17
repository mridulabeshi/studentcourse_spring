package com.example.studentcourse.service

import com.example.studentcourse.dto.EnrollmentRequest
import com.example.studentcourse.model.Enrollment
import com.example.studentcourse.repository.CourseRepository
import com.example.studentcourse.repository.EnrollmentRepository
import com.example.studentcourse.repository.StudentRepository
import org.springframework.stereotype.Service

@Service
class EnrollmentService (
    private val studentRepository: StudentRepository,
    private val courseRepository: CourseRepository,
    private val enrollmentRepository: EnrollmentRepository
) {
    fun enroll(request: EnrollmentRequest): Enrollment {
        val student = studentRepository.findById(request.studentId).orElseThrow { RuntimeException("Student not found") }
        val course = courseRepository.findById(request.courseId).orElseThrow { RuntimeException("Course not found") }
        val alreadyEnrolled =enrollmentRepository.existsByStudentIdAndCourseId(request.studentId,request.courseId)
        if (alreadyEnrolled) {
            throw RuntimeException(
                "Student already enrolled in this course"
            )
        }

        val currentCount =enrollmentRepository.countByCourseId(request.courseId)

        if (currentCount >= course.maxSeats) {throw RuntimeException("Course is full")}
        
        val enrollment = Enrollment(student = student, course = course)
        return enrollmentRepository.save(enrollment)
    }
    fun getAllEnrollments(): List<Enrollment> = enrollmentRepository.findAll()
    
    fun delete(id: Long) {
        enrollmentRepository.deleteById(id)
    }
    
    fun getEnrollmentsByStudent(studentId: Long): List<Enrollment> = enrollmentRepository.findByStudentId(studentId)
    
    fun getEnrollmentsByCourse(courseId: Long): List<Enrollment> = enrollmentRepository.findByCourseId(courseId)
}