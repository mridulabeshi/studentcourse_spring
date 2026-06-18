package com.example.studentcourse.model

import jakarta.persistence.*

@Entity
@Table(name = "courses")
data class Course(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(unique = true, nullable = false)
    var courseCode: String = "",

    var title: String = "",
    var credits: Int = 0,
    
    val maxSeats: Int =30
    
)