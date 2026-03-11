package com.example.focusnest.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.focusnest.ui.screens.*

@Composable
fun SetupNavGraph(
    navController: NavHostController,
    tasks: SnapshotStateList<Task>,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route,
        modifier = modifier
    ) {
        composable(route = Screen.Home.route) {
            HomeScreen(navController = navController)
        }
        composable(route = Screen.Tasks.route) {
            TaskScreen(tasks = tasks)
        }
        composable(route = Screen.Timer.route) {
            TimerScreen()
        }
        composable(route = Screen.Stats.route) {
            StatsScreen(tasks = tasks)
        }
    }
}
