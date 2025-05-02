document.addEventListener('DOMContentLoaded', () => {
  const decrementButtons = document.querySelectorAll('.decrement-btn');
  const incrementButtons = document.querySelectorAll('.increment-btn');
  const qtyInputs = document.querySelectorAll('.qty-input');
  const inventoryForm = document.getElementById('inventory-form');
  const confirmModalElement = document.getElementById('confirmChangesModal');
  const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');
  const changesSummaryList = document.getElementById('changes-summary-list');
  const noChangesMessage = document.getElementById('no-changes-message');

  // Helper function to update input color
  function updateInputColor(input) {
      const value = parseInt(input.value, 10) || 0;
      input.classList.remove('negative', 'positive');
      if (value < 0) {
          input.classList.add('negative');
      } else if (value > 0) {
          input.classList.add('positive');
      }
  }

  // Attach click handlers to decrement buttons
  decrementButtons.forEach(btn => {
      btn.addEventListener('click', () => {
          const productId = btn.getAttribute('data-productid');
          const input = document.querySelector(`.qty-input[data-productid="${productId}"]`);
          if (input) {
              let currentValue = parseInt(input.value, 10) || 0;
              input.value = currentValue - 1;
              updateInputColor(input);
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
              updateInputColor(input);
          }
      });
  });

  // Attach 'input' event for manual typing/pasting
  qtyInputs.forEach(input => {
      input.addEventListener('input', () => {
          let value = parseInt(input.value, 10);
          if (isNaN(value)) {
              input.value = 0;
              value = 0;
          }
          input.value = value; // Ensure value is numeric in the field
          updateInputColor(input);
      });
      // Initial color check on page load
      updateInputColor(input);
  });


  // --- Code for Confirmation Modal ---
  if (confirmModalElement && inventoryForm && confirmSubmitBtn && changesSummaryList && noChangesMessage) {

      // Get the Bootstrap Modal instance if needed (optional for just listening)
      // const modal = bootstrap.Modal.getInstance(confirmModalElement) || new bootstrap.Modal(confirmModalElement);

      // Listen for when the modal is about to be shown
      confirmModalElement.addEventListener('show.bs.modal', event => {

          // Get and display location name
          const locationNameHolder = document.getElementById('current-location-name-holder');
          const modalLocationElement = document.getElementById('modalLocationName');
          // Use optional chaining and provide a fallback
          const currentLocationName = locationNameHolder?.dataset?.locationName || 'Unknown Location';

          if (modalLocationElement) {
              modalLocationElement.textContent = currentLocationName; // Set the location name
          } else {
               console.warn('Modal location display element (#modalLocationName) not found.');
          }

          // Clear previous summary
          changesSummaryList.innerHTML = '';
          let changesFound = false;

          // Iterate through quantity inputs to build summary
          qtyInputs.forEach(input => {
              const quantityChange = parseInt(input.value, 10) || 0;
              if (quantityChange !== 0) {
                  changesFound = true;
                  const productName = input.getAttribute('data-product-name') || `Product ID ${input.getAttribute('data-productid')}`;
                  const listItem = document.createElement('li');
                  const changePrefix = quantityChange > 0 ? '+' : '';
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
              confirmSubmitBtn.disabled = true;
          }
      });

      // Add event listener for the modal's actual confirm button
      confirmSubmitBtn.addEventListener('click', () => {
          inventoryForm.submit(); // Submit the original form
      });

  } else {
       console.warn('One or more elements required for inventory confirmation modal were not found.');
  }
  // --- End Confirmation Modal Code ---

}); // End DOMContentLoaded