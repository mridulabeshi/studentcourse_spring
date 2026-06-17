package com.example.studentcourse.model

import jakarta.persistence.*

@Entity
@Table(name = "enrollments")
data class Enrollment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
        
    @ManyToOne
    @JoinColumn(name = "student_id")
    var student: Student?=null,
        
    @ManyToOne
    @JoinColumn(name = "course_id")
    var course: Course?=null
)
