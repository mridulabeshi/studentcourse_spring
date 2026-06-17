package com.example.studentcourse.repository

import com.example.studentcourse.model.CoursePrerequisite
import org.springframework.data.jpa.repository.JpaRepository

interface CoursePrerequisiteRepository: JpaRepository<CoursePrerequisite, Long> {
    fun findByCourseId(courseId: Long): List<CoursePrerequisite>
    
}