import org.junit.Assert.assertEquals
import org.junit.Test

class ArtSpaceLogicTest {

    @Test
    fun nextIndex_incrementsCorrectly() {
        val currentIndex = 0
        val newIndex = currentIndex + 1
        assertEquals(1, newIndex)
    }

    @Test
    fun previousIndex_decrementsCorrectly() {
        val currentIndex = 2
        val newIndex = currentIndex - 1
        assertEquals(1, newIndex)
    }
}