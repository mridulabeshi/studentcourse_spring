package com.example.studentcourse.model

import jakarta.persistence.*

@Entity
@Table(name = "students")
data class Student(    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(unique = true, nullable = false)
    var rollNo: String = "",
    var department: String = "",
    
    var name: String = "",
    var email: String = ""
)