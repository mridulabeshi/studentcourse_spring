package com.example.studentcourse.controller

import com.example.studentcourse.dto.TeacherCourseRequest
import com.example.studentcourse.model.TeacherCourse
import com.example.studentcourse.service.TeacherCourseService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/teacher-courses")
@CrossOrigin(origins = ["http://localhost:5173"])
class TeacherCourseController(

    private val teacherCourseService: TeacherCourseService

) {

    @PostMapping
    fun assignTeacher(
        @RequestBody request: TeacherCourseRequest
    ): TeacherCourse =
        teacherCourseService.assignTeacher(
            request
        )

    @GetMapping
    fun getAll(): List<TeacherCourse> =
        teacherCourseService.getAll()

    @GetMapping("/teacher/{teacherId}")
    fun getByTeacher(
        @PathVariable teacherId: Long
    ): List<TeacherCourse> =
        teacherCourseService.getByTeacher(
            teacherId
        )

    @GetMapping("/course/{courseId}")
    fun getByCourse(
        @PathVariable courseId: Long
    ): List<TeacherCourse> =
        teacherCourseService.getByCourse(
            courseId
        )

    @DeleteMapping("/{id}")
    fun delete(
        @PathVariable id: Long
    ) {
        teacherCourseService.delete(id)
    }
}