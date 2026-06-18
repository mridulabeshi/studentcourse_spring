package com.example.studentcourse.service

import com.example.studentcourse.repository.CourseRepository
import com.example.studentcourse.model.Course
import org.springframework.stereotype.Service

@Service
class CourseService(
    private val courseRepository: CourseRepository
) {
    fun getAllCourses() : List<Course> = courseRepository.findAll()
    
    fun getCourseById(id: Long): Course = courseRepository.findById(id).orElseThrow { RuntimeException("Course not found") }
    
    fun save(course: Course): Course = courseRepository.save(course)
    
    fun delete(id: Long) = courseRepository.deleteById(id)
    
    fun searchByTitle(title: String): List<Course> = courseRepository.findByTitleContainingIgnoreCase(title)
    
    fun getByCourseCode(courseCode: String): Course? {
        return courseRepository
        .findByCourseCode(courseCode)
    }
}