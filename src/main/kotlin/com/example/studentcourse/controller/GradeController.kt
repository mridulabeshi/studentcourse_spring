package com.example.studentcourse.controller

import com.example.studentcourse.dto.GradeRequest
import com.example.studentcourse.service.GradeService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/grades")
class GradeController(

    private val gradeService: GradeService

) {

    @PostMapping
    fun addGrade(
        @RequestBody request: GradeRequest
    ) =
        gradeService.addGrade(request)

    @GetMapping
    fun getAll() =
        gradeService.getAll()

    @GetMapping("/student/{studentId}")
    fun getStudentGrades(
        @PathVariable studentId: Long
    ) =
        gradeService.getStudentGrades(studentId)
}