// const socket = io();

// if (navigator.geolocation) {
//     navigator.geolocation.watchPosition(
//         (position) => {
//             const { latitude, longitude } = position.coords;
//             console.log(`Sending location: ${latitude}, ${longitude}`);
//             socket.emit("send-location", { latitude: latitude, longitude: longitude });
//         },
//         (error) => {
//             console.error(error);
//         },
//         {
//             enableHighAccuracy: true,
//             timeout: 5000,
//             maximumAge: 0
//         }
//     );
// }

// const map = L.map("map").setView([0, 0], 16);

// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution: "OpenStreetMap"
// }).addTo(map);

// const markers = {};

// socket.on("receive-location", (data) => {
//     const { id, latitude, longitude } = data;
//     console.log(`Received location from ${id}: ${latitude}, ${longitude}`);
//     if (markers[id]) {
//         markers[id].setLatLng([latitude, longitude]);
//     } else {
//         markers[id] = L.marker([latitude, longitude]).addTo(map);
//     }
// });

// socket.on("user-disconnected", (id) => {
//     console.log(`User disconnected: ${id}`);
//     if (markers[id]) {
//         map.removeLayer(markers[id]);
//         delete markers[id];
//     }
// });


const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`Sending location: ${latitude}, ${longitude}`);
            socket.emit("send-location", { latitude: latitude, longitude: longitude });
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Ajinkya Bhise"
}).addTo(map);

const markers = {};
const waypoints = [];
let routingControl;

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    console.log(`Received location from ${id}: ${latitude}, ${longitude}`);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
    waypoints.push(L.latLng(latitude, longitude));
    if (waypoints.length === 2) {
        drawRoute(waypoints[0], waypoints[1]);
    }
});

socket.on("user-disconnected", (id) => {
    console.log(`User disconnected: ${id}`);
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
    // Remove waypoint associated with disconnected user
    waypoints.splice(waypoints.findIndex(wp => wp.id === id), 1);
});

function drawRoute(start, end) {
    if (routingControl) {
        map.removeControl(routingControl);
    }
    routingControl = L.Routing.control({
        waypoints: [start, end],
        routeWhileDragging: false,
        geocoder: L.Control.Geocoder.nominatim()
    }).addTo(map);
}