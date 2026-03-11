package com.example.incredibleindiaexplorer.viewmodel

import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import com.example.incredibleindiaexplorer.R
import com.example.incredibleindiaexplorer.data.TravelDestination
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue

class DestinationViewModel : ViewModel() {

    private val _destinations = mutableStateListOf(
        TravelDestination(
            id = 1,
            name = "Taj Mahal",
            location = "Agra",
            description = "The Taj Mahal is an ivory-white marble mausoleum built by Mughal emperor Shah Jahan in memory of his wife Mumtaz Mahal. It is one of the Seven Wonders of the World and a symbol of India's rich history and architecture.",
            image = R.drawable.tajmahal
        ),
        TravelDestination(
            id = 2,
            name = "Hampi",
            location = "Karnataka",
            description = "Hampi is a UNESCO World Heritage Site famous for the ruins of the Vijayanagara Empire. The ancient temples, stone chariots, and boulder landscapes make it one of the most historically rich destinations in India.",
            image = R.drawable.hampi
        ),
        TravelDestination(
            id = 3,
            name = "Leh Ladakh",
            location = "Ladakh",
            description = "Leh Ladakh is known for its breathtaking Himalayan landscapes, high-altitude mountain passes, monasteries, and adventure activities. It is a dream destination for travelers seeking nature and adventure.",
            image = R.drawable.leh
        )
    )

    val destinations: List<TravelDestination>
        get() = _destinations

    var expandedId by mutableStateOf<Int?>(null)
        private set

    fun toggleExpand(id: Int) {
        expandedId = if (expandedId == id) null else id
    }

    fun toggleFavourite(id: Int) {
        val index = _destinations.indexOfFirst { it.id == id }
        if (index != -1) {
            val item = _destinations[index]
            _destinations[index] = item.copy(isFavourite = !item.isFavourite)
        }
    }
}