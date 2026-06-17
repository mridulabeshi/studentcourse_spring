package com.example.studentcourse.repository

import com.example.studentcourse.model.Course
import org.springframework.data.jpa.repository.JpaRepository

interface CourseRepository : JpaRepository<Course, Long>{
    fun findByTitleContainingIgnoreCase(title:String):List<Course>
}