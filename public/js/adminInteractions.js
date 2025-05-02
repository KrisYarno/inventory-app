// public/js/adminInteractions.js
document.addEventListener('DOMContentLoaded', () => {

    // --- Logic for Admin Inventory Table Collapse Icon Toggle ---
    const inventoryTable = document.getElementById('inventory-table');

    if (inventoryTable) {
        const collapseElements = inventoryTable.querySelectorAll('.location-details-row');

        collapseElements.forEach(collapseEl => {
            // When a section starts to show
            collapseEl.addEventListener('show.bs.collapse', event => {
                // Find the button that controls this specific collapse element
                const controlButton = inventoryTable.querySelector(`button[data-bs-target="#${event.target.id}"]`);
                if (controlButton) {
                    const icon = controlButton.querySelector('.toggle-icon'); // Find the icon within the button
                    if (icon) {
                        icon.classList.remove('bi-plus-lg');
                        icon.classList.add('bi-dash-lg');
                    }
                }
            });

            // When a section starts to hide
            collapseEl.addEventListener('hide.bs.collapse', event => {
                // Find the button that controls this specific collapse element
                 const controlButton = inventoryTable.querySelector(`button[data-bs-target="#${event.target.id}"]`);
                 if (controlButton) {
                     const icon = controlButton.querySelector('.toggle-icon'); // Find the icon within the button
                     if (icon) {
                         icon.classList.remove('bi-dash-lg');
                         icon.classList.add('bi-plus-lg');
                     }
                 }
            });
        });
    }

    // --- Add other admin-specific JS interactions here later if needed ---

});