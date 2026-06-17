package com.example.studentcourse.controller

import com.example.studentcourse.model.Course
import com.example.studentcourse.service.CourseService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/courses")
class CourseController(
    private val courseService: CourseService
) {

    @GetMapping
    fun getAll() = courseService.getAllCourses()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long) =
        courseService.getCourseById(id)

    @PostMapping
    fun create(@RequestBody course: Course) =
        courseService.save(course)

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: Long,
        @RequestBody course: Course
    ): Course {

        val existing = courseService.getCourseById(id)

        existing.title = course.title
        existing.credits = course.credits

        return courseService.save(existing)
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long) =courseService.delete(id)
        
    @GetMapping("/search")
    fun search(@RequestParam title: String): List<Course> { 
        return courseService.searchByTitle(title)
    }
}