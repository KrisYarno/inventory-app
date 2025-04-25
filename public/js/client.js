document.addEventListener('DOMContentLoaded', () => {
  const decrementButtons = document.querySelectorAll('.decrement-btn');
  const incrementButtons = document.querySelectorAll('.increment-btn');
  const qtyInputs = document.querySelectorAll('.qty-input');
  const inventoryForm = document.getElementById('inventory-form'); // Get the form
  const confirmModalElement = document.getElementById('confirmChangesModal'); // Get modal element
  const confirmSubmitBtn = document.getElementById('confirmSubmitBtn'); // Get modal confirm button
  const changesSummaryList = document.getElementById('changes-summary-list'); // Get list element in modal
  const noChangesMessage = document.getElementById('no-changes-message'); // Get no changes message element

  // Helper function to update input color
  function updateInputColor(input) {
    const value = parseInt(input.value, 10) || 0; // Default to 0 if NaN

    // Remove previous color classes
    input.classList.remove('negative');
    input.classList.remove('positive');

    if (value < 0) {
      input.classList.add('negative');
    } else if (value > 0) {
      input.classList.add('positive');
    }
    // If == 0, remove both classes => stays neutral
  }

  // Attach click handlers to decrement buttons
  decrementButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.getAttribute('data-productid');
      const input = document.querySelector(`.qty-input[data-productid="${productId}"]`);
      if (input) {
          let currentValue = parseInt(input.value, 10) || 0;
          input.value = currentValue - 1;
          updateInputColor(input); // Update color after changing value
      }
    });
  });

  // Attach click handlers to increment buttons
  incrementButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.getAttribute('data-productid');
      const input = document.querySelector(`.qty-input[data-productid="${productId}"]`);
       if (input) {
            let currentValue = parseInt(input.value, 10) || 0;
            input.value = currentValue + 1;
            updateInputColor(input); // Update color after changing value
       }
    });
  });

  // Also attach an 'input' event for manual typing or pasting
  qtyInputs.forEach(input => {
    input.addEventListener('input', () => {
        // Ensure the value is treated as a number, reset if invalid
        let value = parseInt(input.value, 10);
        if (isNaN(value)) {
           input.value = 0; // Reset to 0 if not a number
           value = 0;
        }
        input.value = value; // Update input field in case parseInt changed it (e.g., removed letters)
        updateInputColor(input);
    });
     // Initial color check on page load
     updateInputColor(input);
  });


  // --- New Code for Confirmation Modal ---

  if (confirmModalElement && inventoryForm) {
    const modal = new bootstrap.Modal(confirmModalElement); // Initialize Bootstrap modal instance

    // Listen for when the modal is about to be shown
    confirmModalElement.addEventListener('show.bs.modal', event => {
      // Clear previous summary
      changesSummaryList.innerHTML = '';
      let changesFound = false;

      // Iterate through quantity inputs
      qtyInputs.forEach(input => {
        const quantityChange = parseInt(input.value, 10) || 0;

        if (quantityChange !== 0) {
          changesFound = true;
          // Get product name using the data attribute we added in EJS
          const productName = input.getAttribute('data-product-name') || `Product ID ${input.getAttribute('data-productid')}`; // Fallback if name missing
          const listItem = document.createElement('li');
          const changePrefix = quantityChange > 0 ? '+' : '';
          // Add Bootstrap text color classes for emphasis
          const textColorClass = quantityChange > 0 ? 'text-success' : 'text-danger';

          listItem.innerHTML = `<span class="${textColorClass} fw-bold">${changePrefix}${quantityChange}</span> ${productName}`;
          changesSummaryList.appendChild(listItem);
        }
      });

      // Show/hide messages and enable/disable confirm button
      if (changesFound) {
        noChangesMessage.style.display = 'none';
        changesSummaryList.style.display = '';
        confirmSubmitBtn.disabled = false;
      } else {
        noChangesMessage.style.display = 'block';
        changesSummaryList.style.display = 'none';
        confirmSubmitBtn.disabled = true; // Disable confirm if no changes
      }
    });

    // Add event listener for the modal's confirm button
    if (confirmSubmitBtn) {
        confirmSubmitBtn.addEventListener('click', () => {
            inventoryForm.submit(); // Submit the original form
            // Optionally hide modal manually if needed, though submit might refresh page anyway
            // modal.hide();
        });
    }
  }

}); // End DOMContentLoaded