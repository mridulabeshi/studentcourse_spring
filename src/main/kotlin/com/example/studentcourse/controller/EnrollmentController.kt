package com.example.studentcourse.controller

import com.example.studentcourse.dto.EnrollmentRequest
import com.example.studentcourse.service.EnrollmentService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/enrollments")
class EnrollmentController(
    private val enrollmentService: EnrollmentService
) {

    @PostMapping
    fun enroll(@RequestBody request: EnrollmentRequest) = enrollmentService.enroll(request)

    @GetMapping
    fun getAll() = enrollmentService.getAllEnrollments()
        
    @DeleteMapping("/{id}")
    fun dropCourse( @PathVariable id: Long) {
        enrollmentService.delete(id)
    }
    
    @GetMapping("/student/{studentId}")
    fun getByStudent(@PathVariable studentId: Long) = enrollmentService.getEnrollmentsByStudent(studentId)
    
    @GetMapping("/course/{courseId}")
    fun getByCourse(@PathVariable courseId: Long) = enrollmentService.getEnrollmentsByCourse(courseId)
}