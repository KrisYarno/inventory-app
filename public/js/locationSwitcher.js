// public/js/locationSwitcher.js
document.addEventListener('DOMContentLoaded', () => {
    const locationDropdown = document.getElementById('locationSelectorDropdown');
    const locationDropdownButton = document.getElementById('locationDropdownMenuLink'); // Button showing current location

    if (locationDropdown && locationDropdownButton) {
        const currentLocId = locationDropdownButton.getAttribute('data-current-location-id');

        locationDropdown.addEventListener('click', async (event) => {
            // Check if the clicked element is a dropdown item link (A tag)
            if (event.target.tagName === 'A' && event.target.classList.contains('dropdown-item')) {
                event.preventDefault(); // Prevent default link behavior

                const selectedLocationId = event.target.getAttribute('data-location-id');
                const selectedLocationName = event.target.textContent.trim();

                // Only proceed if a different location is selected
                if (selectedLocationId && selectedLocationId !== currentLocId) {
                    console.log(`Attempting to switch location to ID: ${selectedLocationId}`); // Debugging

                    try {
                        const response = await fetch('/user/set-location', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                // Include other headers if needed, e.g., CSRF token
                            },
                            body: JSON.stringify({ locationId: selectedLocationId })
                        });

                        const result = await response.json();

                        if (response.ok && result.success) {
                            console.log(`Successfully set location to ${selectedLocationId}. Reloading page.`); // Debugging
                            // Reload the page to reflect the change server-side
                            window.location.reload();
                        } else {
                            console.error('Failed to set location:', result.message || 'Unknown error');
                            // Optionally show an error message to the user (e.g., using a small alert)
                            alert(`Error switching location: ${result.message || 'Please try again.'}`);
                        }
                    } catch (error) {
                        console.error('Network or fetch error setting location:', error);
                        alert('Could not switch location due to a network error. Please check your connection.');
                    }
                }
            }
        });
    }
});