package com.example.focusnest.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Star
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Home : Screen("home", "Home", Icons.Default.Home)
    object Tasks : Screen("tasks", "Tasks", Icons.AutoMirrored.Filled.List)
    object Timer : Screen("timer", "Timer", Icons.Default.DateRange)
    object Stats : Screen("stats", "Stats", Icons.Default.Star)
}

val bottomNavigationItems = listOf(
    Screen.Home,
    Screen.Tasks,
    Screen.Timer,
    Screen.Stats
)
