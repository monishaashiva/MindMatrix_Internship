package com.example.focusnest

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.example.focusnest.navigation.BottomNavigationBar
import com.example.focusnest.navigation.SetupNavGraph
import com.example.focusnest.ui.screens.Task
import com.example.focusnest.ui.theme.FocusNestTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            FocusNestTheme {
                FocusNestAppContent()
            }
        }
    }
}

@Composable
fun FocusNestAppContent() {
    val navController = rememberNavController()
    
    // Shared state for tasks
    val tasks = remember {
        mutableStateListOf(
            Task(1, "Math Assignment", "High"),
            Task(2, "Read History Chapter 4", "Medium"),
            Task(3, "Prepare Presentation", "High"),
            Task(4, "Buy Notebooks", "Low")
        )
    }

    Scaffold(
        bottomBar = { BottomNavigationBar(navController = navController) }
    ) { innerPadding ->
        SetupNavGraph(
            navController = navController,
            tasks = tasks,
            modifier = Modifier.padding(innerPadding)
        )
    }
}
