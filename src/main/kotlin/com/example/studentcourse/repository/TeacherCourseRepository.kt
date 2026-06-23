package com.example.studentcourse.repository

import com.example.studentcourse.model.TeacherCourse
import org.springframework.data.jpa.repository.JpaRepository

interface TeacherCourseRepository :
    JpaRepository<TeacherCourse, Long> {

    fun findByTeacherId(teacherId: Long): List<TeacherCourse>
    fun findByCourseId(courseId: Long): List<TeacherCourse>
}