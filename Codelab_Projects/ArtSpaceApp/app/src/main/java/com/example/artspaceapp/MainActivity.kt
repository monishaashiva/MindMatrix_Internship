package com.example.artspaceapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ArtSpaceScreen()
        }
    }
}

data class Artwork(
    val imageRes: Int,
    val title: String,
    val artist: String,
    val year: String
)

@Composable
fun ArtSpaceScreen() {

    val artworks = listOf(
        Artwork(R.drawable.art1, "Sunset Glow", "A. Sharma", "2022"),
        Artwork(R.drawable.art2, "Silent Lake", "M. Rao", "2021"),
        Artwork(R.drawable.art3, "Golden Fields", "R. Mehta", "2020")
    )

    var currentIndex by remember { mutableStateOf(0) }
    var favourites by remember { mutableStateOf(setOf<Int>()) }

    val currentArtwork = artworks[currentIndex]
    val isFavourite = favourites.contains(currentIndex)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {

        Image(
            painter = painterResource(currentArtwork.imageRes),
            contentDescription = currentArtwork.title,
            modifier = Modifier
                .fillMaxWidth()
                .height(300.dp),
            contentScale = ContentScale.Crop
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = currentArtwork.title,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold
        )

        Text(
            text = "${currentArtwork.artist} (${currentArtwork.year})",
            fontSize = 16.sp
        )

        Spacer(modifier = Modifier.height(16.dp))

        IconButton(onClick = {
            favourites = if (isFavourite)
                favourites - currentIndex
            else
                favourites + currentIndex
        }) {
            Icon(
                imageVector = if (isFavourite)
                    Icons.Default.Favorite
                else
                    Icons.Default.FavoriteBorder,
                contentDescription = "Toggle Favourite"
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Row(
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth()
        ) {

            Button(
                onClick = {
                    if (currentIndex > 0) currentIndex--
                },
                enabled = currentIndex > 0
            ) {
                Text("Previous")
            }

            Button(
                onClick = {
                    if (currentIndex < artworks.size - 1) currentIndex++
                },
                enabled = currentIndex < artworks.size - 1
            ) {
                Text("Next")
            }
        }
    }
}