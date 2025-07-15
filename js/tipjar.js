async function initTipJar() {
    const sendTip = document.getElementById("sendTip");
    const tipAddress = document.getElementById("tipAddress");
    const tipAmount = document.getElementById("tipAmount");
    const tipMessage = document.getElementById("tipMessage");
    const tipError = document.getElementById("tipError");
    const tipList = document.getElementById("tipList");

    // Load existing tips from localStorage
    function renderTips() {
        const tips = JSON.parse(localStorage.getItem("tips") || "[]");
        tipList.innerHTML = tips.length ? tips.map(t => `
            <div class="bg-green-100 p-4 rounded">
                <p class="text-sm">Tipped ${t.amount} drops to ${t.address.slice(0, 10)}...</p>
                <p class="text-gray-600 italic">${t.message}</p>
                <p class="text-xs text-gray-500">${t.date}</p>
            </div>
        `).join("") : "<p class='text-gray-500'>No tips yet. Be the first!</p>";
    }

    // Handle tip submission
    sendTip.addEventListener("click", async () => {
        tipError.classList.add("hidden");
        const address = tipAddress.value.trim();
        const amount = parseInt(tipAmount.value);
        const message = tipMessage.value.trim().slice(0, 50);

        // Validate inputs
        if (!xrpl.isValidAddress(address)) {
            tipError.textContent = "Invalid XRPL address.";
            tipError.classList.remove("hidden");
            return;
        }
        if (!amount || amount < 1) {
            tipError.textContent = "Enter a valid amount in drops (e.g., 1000).";
            tipError.classList.remove("hidden");
            return;
        }
        if (!message) {
            tipError.textContent = "Please add a thank-you note.";
            tipError.classList.remove("hidden");
            return;
        }

        // Connect to XRPL Testnet
        const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
        try {
            await client.connect();

            // Use a Testnet faucet address (user must replace with their own for real testing)
            const tx = await client.autofill({
                TransactionType: "Payment",
                Account: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe", // Testnet faucet (replace with user's Testnet wallet)
                Amount: amount.toString(),
                Destination: address
            });

            // Simulate transaction (not signing for security; user would sign via wallet like XUMM)
            alert(`Simulated tipping ${amount} drops to ${address}!`);

            // Store tip in localStorage
            const tips = JSON.parse(localStorage.getItem("tips") || "[]");
            tips.unshift({
                address,
                amount,
                message,
                date: new Date().toLocaleString()
            });
            localStorage.setItem("tips", JSON.stringify(tips));
            renderTips();

            // Clear inputs
            tipAddress.value = "";
            tipAmount.value = "";
            tipMessage.value = "";
        } catch (error) {
            tipError.textContent = `Error: ${error.message}`;
            tipError.classList.remove("hidden");
        } finally {
            await client.disconnect();
        }
    });

    // Initial render
    renderTips();
}

initTipJar();
