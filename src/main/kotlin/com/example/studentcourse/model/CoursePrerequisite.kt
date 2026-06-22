package com.example.studentcourse.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*

@Entity
@Table(name = "course_prerequisites")
data class CoursePrerequisite(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
        
    @ManyToOne
@JoinColumn(name = "course_id")
@JsonIgnoreProperties("prerequisites")
var course: Course? = null,

@ManyToOne  
@JoinColumn(name = "prerequisite_course_id")
@JsonIgnoreProperties("prerequisites")
var prerequisiteCourse: Course? = null
)

