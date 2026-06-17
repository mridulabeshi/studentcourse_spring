package com.example.studentcourse.repository

import com.example.studentcourse.model.Grade
import org.springframework.data.jpa.repository.JpaRepository

interface GradeRepository :
    JpaRepository<Grade, Long> {

    fun findByEnrollmentStudentId(
        studentId: Long
    ): List<Grade>

    fun existsByEnrollmentId(
        enrollmentId: Long
    ): Boolean
}