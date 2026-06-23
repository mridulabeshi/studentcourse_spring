package com.example.studentcourse.model

import jakarta.persistence.*

@Entity
@Table(name = "teachers")
data class Teacher(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    var employeeCode: String = "",

    var name: String = "",

    @OneToOne
    @JoinColumn(name = "user_id")
    var user: User? = null
)
