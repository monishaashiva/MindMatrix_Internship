package com.example.diceroller

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            DiceRollerScreen()
        }
    }
}

@Composable
fun DiceRollerScreen() {
    // 1. Initial States
    var diceResult by remember { mutableStateOf(1) }
    var rotationAngle by remember { mutableStateOf(0f) }

    // 2. Animation setup
    val animatedRotation by animateFloatAsState(
        targetValue = rotationAngle,
        animationSpec = tween(durationMillis = 500, easing = FastOutSlowInEasing),
        label = "spin_animation"
    )

    // 3. Match the rolled number to the correct Unicode dice face
    val diceFace = when (diceResult) {
        1 -> "⚀"
        2 -> "⚁"
        3 -> "⚂"
        4 -> "⚃"
        5 -> "⚄"
        else -> "⚅"
    }

    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Text(
                text = diceFace,
                fontSize = 100.sp,
                modifier = Modifier.rotate(animatedRotation)
            )

            Spacer(modifier = Modifier.width(16.dp))

            Text(
                text = "$diceResult",
                fontSize = 100.sp
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        // 4. A Row to place the buttons side-by-side
        Row(
            horizontalArrangement = Arrangement.spacedBy(16.dp) // Adds space between buttons
        ) {
            // Roll Button
            Button(onClick = {
                diceResult = (1..6).random()
                rotationAngle += 360f
            }) {
                Text(text = "Roll Dice", fontSize = 24.sp)
            }

            // Reset Button
            Button(onClick = {
                diceResult = 1        // Revert to initial number
                rotationAngle = 0f    // Revert to initial angle (spins backward)
            }) {
                Text(text = "Reset", fontSize = 24.sp)
            }
        }
    }
}