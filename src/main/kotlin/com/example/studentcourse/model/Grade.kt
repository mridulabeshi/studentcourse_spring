package com.example.studentcourse.model

import jakarta.persistence.*

@Entity
@Table(name = "grades")
data class Grade(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
        
    @OneToOne
    @JoinColumn(name = "enrollment_id")
    var enrollment: Enrollment?=null ,
    
    var grade:String ="",
    var semester:String =""
)
