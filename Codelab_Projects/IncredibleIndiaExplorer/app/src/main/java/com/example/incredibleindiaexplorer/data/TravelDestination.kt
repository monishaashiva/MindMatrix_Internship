package com.example.incredibleindiaexplorer.data

data class TravelDestination(
    val id: Int,
    val name: String,
    val location: String,
    val description: String,
    val image: Int,
    val isFavourite: Boolean = false
)