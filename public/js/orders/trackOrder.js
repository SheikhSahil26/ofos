window.addEventListener("DOMContentLoaded",()=>{

    const customerLat = 23.0225;
    const customerLng = 72.5714;

    const partnerLat = 23.028;
    const partnerLng = 72.563;

    const map = L.map("map").setView(
        [customerLat, customerLng],
        14
    );

    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom:19
        }
    ).addTo(map);

    L.marker([
        customerLat,
        customerLng
    ])
    .addTo(map);

    L.marker([
        partnerLat,
        partnerLng
    ])
    .addTo(map);

});