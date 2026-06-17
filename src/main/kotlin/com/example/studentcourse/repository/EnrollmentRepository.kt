package com.example.studentcourse.repository

import com.example.studentcourse.model.Enrollment
import org.springframework.data.jpa.repository.JpaRepository

interface EnrollmentRepository : JpaRepository<Enrollment, Long>{

    fun existsByStudentIdAndCourseId(studentId: Long, courseId: Long): Boolean

    fun countByCourseId(courseId: Long  ): Long
    
    fun findByStudentId(studentId: Long): List<Enrollment>
    
    fun findByCourseId(courseId: Long): List<Enrollment>
}