document.addEventListener('DOMContentLoaded', () => {
  const decrementButtons = document.querySelectorAll('.decrement-btn');
  const incrementButtons = document.querySelectorAll('.increment-btn');
  const qtyInputs = document.querySelectorAll('.qty-input');

  // Helper function to update input color
  function updateInputColor(input) {
    const value = parseInt(input.value, 10);

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
      const input = document.querySelector(`input[data-productid="${productId}"]`);
      let currentValue = parseInt(input.value, 10) || 0;
      input.value = currentValue - 1;

      // Update color
      updateInputColor(input);
    });
  });

  // Attach click handlers to increment buttons
  incrementButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.getAttribute('data-productid');
      const input = document.querySelector(`input[data-productid="${productId}"]`);
      let currentValue = parseInt(input.value, 10) || 0;
      input.value = currentValue + 1;

      // Update color
      updateInputColor(input);
    });
  });

  // Also attach an 'input' event for manual typing
  qtyInputs.forEach(input => {
    input.addEventListener('input', () => {
      updateInputColor(input);
    });
  });
});
