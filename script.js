document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const input = document.querySelector('input[type="text"]');
    const errorMessage = document.getElementById('error-message');

    if (!form || !input || !errorMessage) return;

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 7);
        return hashHex;
    }

    async function sendToTelegram(message) {
        const url = `https://msg.garifull.in/notify`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({message: message})
            });

            const result = await response.json();
            console.log("Response:", result);
        } catch (err) {
            console.error("Network Error:", err);
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.classList.remove('visible');
        errorMessage.textContent = '';
        const rawValue = input.value;
        const normalizedValue = rawValue.replace(/\s+/g, '').toLowerCase();

        if (!normalizedValue) return;

        try {
            const hashResult = await sha256(normalizedValue);
            const fileName = hashResult + '.html';

            msg = `PageTitle: ${document.title}, Input: "${normalizedValue}", Hash: ${hashResult}`;
            console.log(msg);
            await sendToTelegram(msg);

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
        errorMessage.style.animation = 'none';
        errorMessage.offsetHeight;
        errorMessage.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
    }
});
