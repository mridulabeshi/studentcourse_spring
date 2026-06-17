package com.example.studentcourse.model

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "attendance")
data class Attendance(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne
    @JoinColumn(name = "enrollment_id")
    var enrollment: Enrollment? = null,

    var date: LocalDate = LocalDate.now(),

    var present: Boolean = true
)