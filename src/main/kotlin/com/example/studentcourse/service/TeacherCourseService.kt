package com.example.studentcourse.service

import com.example.studentcourse.dto.TeacherCourseRequest
import com.example.studentcourse.model.TeacherCourse
import com.example.studentcourse.repository.CourseRepository
import com.example.studentcourse.repository.TeacherCourseRepository
import com.example.studentcourse.repository.TeacherRepository
import org.springframework.stereotype.Service

@Service
class TeacherCourseService(

    private val teacherCourseRepository: TeacherCourseRepository,

    private val teacherRepository: TeacherRepository,

    private val courseRepository: CourseRepository
) {

    fun assignTeacher(
        request: TeacherCourseRequest
    ): TeacherCourse {

        val teacher =
            teacherRepository.findById(
                request.teacherId
            ).orElseThrow()

        val course =
            courseRepository.findById(
                request.courseId
            ).orElseThrow()

        val teacherCourse =
            TeacherCourse(
                teacher = teacher,
                course = course
            )

        return teacherCourseRepository.save(
            teacherCourse
        )
    }

    fun getAll(): List<TeacherCourse> =
        teacherCourseRepository.findAll()

    fun getByTeacher(
        teacherId: Long
    ): List<TeacherCourse> =
        teacherCourseRepository.findByTeacherId(
            teacherId
        )

    fun getByCourse(
        courseId: Long
    ): List<TeacherCourse> =
        teacherCourseRepository.findByCourseId(
            courseId
        )

    fun delete(
        id: Long
    ) {
        teacherCourseRepository.deleteById(id)
    }
}