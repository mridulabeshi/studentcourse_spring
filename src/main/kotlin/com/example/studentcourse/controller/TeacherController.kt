package com.example.studentcourse.controller

import com.example.studentcourse.model.Teacher
import com.example.studentcourse.service.TeacherService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/teachers")
@CrossOrigin(origins = ["http://localhost:5173"])
class TeacherController(

    private val teacherService: TeacherService

) {

    @GetMapping
    fun getAll(): List<Teacher> = teacherService.getAll()

    @GetMapping("/{id}")
    fun getById( @PathVariable id: Long): Teacher = teacherService.getById(id)

    @PostMapping
    fun create( @RequestBody teacher: Teacher): Teacher = teacherService.create(teacher)

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody teacher: Teacher): Teacher = teacherService.update(id, teacher)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long) = teacherService.delete(id)
}