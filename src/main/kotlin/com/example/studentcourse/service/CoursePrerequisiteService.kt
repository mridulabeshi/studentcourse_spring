package com.example.studentcourse.service

import com.example.studentcourse.dto.PrerequisiteRequest
import com.example.studentcourse.model.CoursePrerequisite
import com.example.studentcourse.repository.CoursePrerequisiteRepository
import com.example.studentcourse.repository.CourseRepository
import org.springframework.stereotype.Service

@Service
class CoursePrerequisiteService(
    private val prerequisiteRepository: CoursePrerequisiteRepository,
    private val courseRepository: CourseRepository
) {

    fun addPrerequisite(
        request: PrerequisiteRequest
    ): CoursePrerequisite {

        val course =
            courseRepository.findById(request.courseId)
                .orElseThrow()

        val prerequisite =
            courseRepository.findById(
                request.prerequisiteCourseId
            ).orElseThrow()

        return prerequisiteRepository.save(
            CoursePrerequisite(
                course = course,
                prerequisiteCourse = prerequisite
            )
        )
    }

    fun getAll() =
        prerequisiteRepository.findAll()
}