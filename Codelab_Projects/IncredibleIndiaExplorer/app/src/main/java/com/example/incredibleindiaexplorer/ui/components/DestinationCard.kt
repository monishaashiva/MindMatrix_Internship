package com.example.incredibleindiaexplorer.ui.components

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.example.incredibleindiaexplorer.data.TravelDestination

@Composable
fun DestinationCard(
    destination: TravelDestination,
    isExpanded: Boolean,
    onExpand: () -> Unit,
    onFavourite: () -> Unit
) {

    Card(
        modifier = Modifier
            .padding(16.dp)
            .fillMaxWidth()
            .wrapContentHeight()
            .animateContentSize(),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
    ) {

        Column {

            Image(
                painter = painterResource(id = destination.image),
                contentDescription = destination.name,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp),
                contentScale = ContentScale.Crop
            )

            Column(
                modifier = Modifier.padding(16.dp)
            ) {

                Row(
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {

                    Column {

                        Text(
                            text = destination.name,
                            style = MaterialTheme.typography.titleMedium
                        )

                        Text(
                            text = destination.location,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }

                    IconButton(onClick = onFavourite) {

                        Icon(
                            imageVector =
                                if (destination.isFavourite)
                                    Icons.Default.Favorite
                                else
                                    Icons.Default.FavoriteBorder,
                            contentDescription = "Favourite"
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                TextButton(onClick = onExpand) {

                    Text(
                        text = if (isExpanded) "Hide" else "Expand"
                    )
                }

                if (isExpanded) {

                    Text(
                        text = destination.description,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }
    }
}