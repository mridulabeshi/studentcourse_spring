package com.example.studentcourse.controller

import com.example.studentcourse.dto.PrerequisiteRequest
import com.example.studentcourse.service.CoursePrerequisiteService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/prerequisites")
class CoursePrerequisiteController(
    private val service: CoursePrerequisiteService
) {

    @PostMapping
    fun add(@RequestBody request: PrerequisiteRequest) = service.addPrerequisite(request)

    @GetMapping
    fun getAll() = service.getAll()
}