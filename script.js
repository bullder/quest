document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const input = document.querySelector('input[type="text"]');
    const errorMessage = document.getElementById('error-message');

    if (!form || !input || !errorMessage) return;

    // Helper to compute SHA-256 hash using native Fetch/Crypto API
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 7);
        return hashHex;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Hide error initially
        errorMessage.classList.remove('visible');
        errorMessage.textContent = '';

        // Normalize input: remove spaces, lowercase
        const rawValue = input.value;
        const normalizedValue = rawValue.replace(/\s+/g, '').toLowerCase();

        if (!normalizedValue) return;

        try {
            // Calculate SHA-256
            const hashResult = await sha256(normalizedValue);
            const fileName = hashResult + '.html';

            console.log(`Input: "${normalizedValue}", Hash: ${hashResult}, Target: ${fileName}`);

            // Check if file exists
            const response = await fetch(fileName, { method: 'HEAD' });

            if (response.ok) {
                window.location.href = fileName;
            } else {
                showError(input.dataset.error || 'Error');
            }
        } catch (error) {
            console.error('Error:', error);
            showError(input.dataset.error || 'Error');
        }
    });

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.add('visible');

        // Shake animation reset
        errorMessage.style.animation = 'none';
        errorMessage.offsetHeight; /* trigger reflow */
        errorMessage.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
    }
});
