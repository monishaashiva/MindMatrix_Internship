package com.example.greetingcard

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.greetingcard.ui.theme.GreetingCardTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            GreetingCardTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    WeightExperiment()
                    //PaddingExperiment()


                }
            }
        }
    }
}

@Composable
fun WeightExperiment() {

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement =
            //Arrangement.SpaceBetween
                //Arrangement.SpaceEvenly
                //Arrangement.Start
               Arrangement.End

    ) {
        Box(
            modifier = Modifier
                .size(60.dp)
                .background(Color.Red)
        )

        Box(
            modifier = Modifier
                .size(60.dp)
                .background(Color.Blue)
        )
    }

}
@Composable
fun PaddingExperiment() {

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.LightGray)
            .padding(0.dp),   // We will change this later
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Top
    ) {

        Text(
            text = "Padding Experiment",
            modifier = Modifier
                .background(Color.Blue)
                .padding(40.dp),
            color = Color.White
        )
    }
}

