import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.*
import org.junit.Rule
import org.junit.Test

class ArtSpaceUiTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun nextButton_changesArtworkTitle() {

        composeTestRule.setContent {
            ArtSpaceScreen()
        }

        // Check initial title exists
        composeTestRule.onNodeWithText("Sunset Glow")
            .assertExists()

        // Click Next
        composeTestRule.onNodeWithText("Next")
            .performClick()

        // Check next artwork title appears
        composeTestRule.onNodeWithText("Silent Lake")
            .assertExists()
    }
}