package com.example.studentcourse.service

import com.example.studentcourse.dto.GradeRequest
import com.example.studentcourse.model.Grade
import com.example.studentcourse.repository.EnrollmentRepository
import com.example.studentcourse.repository.GradeRepository
import org.springframework.stereotype.Service

@Service
class GradeService(

    private val gradeRepository: GradeRepository,

    private val enrollmentRepository: EnrollmentRepository

) {

    fun addGrade(
        request: GradeRequest
    ): Grade {

        val enrollment = enrollmentRepository
            .findById(request.enrollmentId)
            .orElseThrow()

        val grade = Grade(
            enrollment = enrollment,
            grade = request.grade,
            semester = request.semester
        )

        return gradeRepository.save(grade)
    }

    fun getAll(): List<Grade> =
        gradeRepository.findAll()

    fun getStudentGrades(
        studentId: Long
    ): List<Grade> =
        gradeRepository.findByEnrollmentStudentId(studentId)
}