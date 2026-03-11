package com.example.incredibleindiaexplorer.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.incredibleindiaexplorer.ui.components.DestinationCard
import com.example.incredibleindiaexplorer.viewmodel.DestinationViewModel
import androidx.compose.foundation.layout.PaddingValues

@Composable
fun TravelScreen(viewModel: DestinationViewModel = viewModel()) {

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        items(viewModel.destinations) { destination ->
            DestinationCard(
                destination = destination,
                isExpanded = viewModel.expandedId == destination.id,
                onExpand = { viewModel.toggleExpand(destination.id) },
                onFavourite = { viewModel.toggleFavourite(destination.id) }
            )
        }
    }
}