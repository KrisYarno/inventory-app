document.addEventListener('DOMContentLoaded', () => {
    const decrementButtons = document.querySelectorAll('.decrement-btn');
    const incrementButtons = document.querySelectorAll('.increment-btn');
  
    decrementButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.getAttribute('data-productid');
        const input = document.querySelector(`input[data-productid="${productId}"]`);
        let currentValue = parseInt(input.value, 10);
        input.value = currentValue - 1;
      });
    });
  
    incrementButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.getAttribute('data-productid');
        const input = document.querySelector(`input[data-productid="${productId}"]`);
        let currentValue = parseInt(input.value, 10);
        input.value = currentValue + 1;
      });
    });
  });
  