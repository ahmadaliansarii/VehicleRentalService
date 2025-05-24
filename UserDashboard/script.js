document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    const userNameElement = document.getElementById("userName");
    userNameElement.innerText = localStorage.getItem('userFullName');
    if (currentPage === "mainDashboard.html") {
        fetchVehicles();
    }
    else if (currentPage === "vehicleDetails.html") {
        fetchVehicleDetails();
    }
    else if (currentPage === "carListings.html") {
        carListings();
    }
    else if (currentPage === "mainDashboard.html"){
        fetchVehicles();
    }
    else if (currentPage === "allBookings.html"){
        loadUserReservations();
    }
    else if (currentPage === "Feedbacks.html"){
        loadUserFeedbacks();
    }

    // Enable Enter key to trigger search on all pages with the search bar
    const searchInputElem = document.getElementById('searchInput');
    if (searchInputElem) {
        searchInputElem.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleCarSearch();
            }
        });
    }
});

function openAboutUs() {
    window.location.href = 'AboutUs.html';
  }

function formatDate(dateString) {
    if (!dateString) return ' - ';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    if (isNaN(date)) return ' - ';
    return date.toLocaleDateString('en-GB', options);
}

async function fetchVehicles() {
    try {
        const carCardsContainer = document.getElementById('carCardsContainer');
        const response = await fetch('http://localhost:3000/user/get-vehicles');
        if (!response.ok) throw new Error('Failed to fetch vehicles from server.');

        const vehicles = await response.json();

        carCardsContainer.innerHTML = '';

        vehicles.forEach(vehicle => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${vehicle.brand} ${vehicle.model}</h3>
                <p><strong>Model Year:</strong> ${vehicle.year}</p>
                <p><strong>Capacity:</strong> ${vehicle.capacity} Peoples</p>
                <p><strong>Price Per Day:</strong> ${vehicle.price_per_day}</p>
                <p><strong>Comfort:</strong> ${vehicle.comfort_quality}/5</p>
                <p><strong>Mileage:</strong> ${vehicle.mileage} Km</p>
            `;

            card.addEventListener('click', () => {
                window.location.href = `vehicleDetails.html?vehicle_id=${vehicle.vehicle_id}`;
            });

            carCardsContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching vehicles:', error);
    }
}

async function fetchVehicleDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleId = urlParams.get('vehicle_id');

    try {
        const response = await fetch(`http://localhost:3000/user/get-vehicle/${vehicleId}`);
        if (!response.ok) throw new Error('Failed to fetch vehicle details.');

        const vehicle = await response.json();

        const vehicleDetailsContainer = document.getElementById('vehicleDetailsContainer');
        vehicleDetailsContainer.innerHTML = `
            <h1>${vehicle.brand} ${vehicle.model}</h1>
            <p><strong>Model Year:</strong> ${vehicle.year}</p>
            <p><strong>Capacity:</strong> ${vehicle.capacity} Peoples</p>
            <p><strong>Price Per Day:</strong> ${vehicle.price_per_day}</p>
            <p><strong>Comfort:</strong> ${vehicle.comfort_quality}/5</p>
            <p><strong>Mileage:</strong> ${vehicle.mileage} Km</p>
        `;
    } catch (error) {
        console.error('Error fetching vehicle details:', error);
    }
}

async function logout() {
    const userId = localStorage.getItem('userUser_ID');
    try {
        const response = await fetch('http://localhost:3000/common/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });

        const data = await response.json();

        if (data.success) {
            localStorage.removeItem('userUser_ID');
            alert(data.message);
            window.location.href = '/LoginSignup/login.html';
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error('Logout error:', err);
        alert('An error occurred during logout.');
    }
}

document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = e.target.current_password.value;
    const newPassword = e.target.new_password.value;
    const confirmPassword = e.target.confirm_password.value;

    if (newPassword !== confirmPassword) {
        return alert('New password and confirm password do not match.');
    }

    // Retrieve user_id from localStorage
    const userId = localStorage.getItem('userUser_ID');
    if (!userId) {
        return alert('User ID not found. Please log in again.');
    }

    try {
        const response = await fetch('http://localhost:3000/common/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, currentPassword, newPassword }),
        });

        const data = await response.json();
        alert(data.message);
        if (data.success) window.location.href = 'mainDashboard.html';
    } catch (err) {
        console.error('Password change error:', err);
        alert('An error occurred during password change.');
    }
});

document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('userUser_ID');
    const vehicleId = new URLSearchParams(window.location.search).get('vehicle_id');
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const message = document.getElementById('message').value;

    if (!userId) {
        alert('Error: User ID missing.');
        return;
    }
    if(!vehicleId){
        alert('Error: Vehicle ID missing.');
        return;
    }
    
    const today = new Date().setHours(0, 0, 0, 0);
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(0, 0, 0, 0);

    if (start < today) {
        alert('Error: Start date must be today or a future date.');
        return;
    }
    if (end <= start) {
        alert('Error: End date must be after the start date.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/user/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                vehicle_id: vehicleId,
                start_date: startDate,
                end_date: endDate,
                message: message
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('Booking successful!');
            window.location.href = "mainDashboard.html"
        } else {
            alert(`Booking failed: ${result.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while booking.');
    }
});


// --- Car Search Functionality ---
function handleCarSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    const query = searchInput.value.trim();
    if (query.length === 0) return;
    window.location.href = `carListings.html?search=${encodeURIComponent(query)}`;
}

// On carListings.html, filter by search query if present
function getSearchQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') || '';
}

// Patch carListings to support search filtering
function carListings() {
    const sortBy = document.getElementById('sortBy');
    const availabilityFilter = document.getElementById('availabilityFilter');
    const vehicleCardsContainer = document.getElementById('AAA');
    const searchQuery = getSearchQuery().toLowerCase();

    const fetchAndRenderVehicles = () => {
        const sortOption = sortBy.value;
        const isAvailableOnly = availabilityFilter.checked;
        let url = `http://localhost:3000/user/vehicles?sort=${sortOption}&available=${isAvailableOnly}`;
        if (searchQuery) {
            url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        fetch(url)
            .then((response) => response.json())
            .then((vehicles) => {
                vehicleCardsContainer.innerHTML = '';
                if (vehicles.length === 0) {
                    vehicleCardsContainer.innerHTML = '<div class="no-results">No results found for your search.</div>';
                    return;
                }
                vehicles.forEach((vehicle) => {
                    const card = document.createElement('div');
                    card.className = 'vehicle-card';
                    card.innerHTML = `
                        <div class="card-details">
                            <h3>${vehicle.brand} ${vehicle.model}</h3>
                            <p>Year: ${vehicle.year}</p>
                            <p>Capacity: ${vehicle.capacity}</p>
                            <p>Price: ${vehicle.price_per_day} per day</p>
                            <p>Comfort Quality: ${vehicle.comfort_quality}</p>
                            <p>Mileage: ${vehicle.mileage} km</p>
                        </div>
                    `;
                    card.addEventListener('click', () => {
                        window.location.href = `vehicleDetails.html?vehicle_id=${vehicle.vehicle_id}`;
                    });
                    vehicleCardsContainer.appendChild(card);
                });
            });
    };

    sortBy.addEventListener('change', fetchAndRenderVehicles);
    availabilityFilter.addEventListener('change', fetchAndRenderVehicles);

    fetchAndRenderVehicles();
}

async function loadUserReservations(){
    const userName = localStorage.getItem('userFullName');
    const userId = localStorage.getItem('userUser_ID');
    if (!userId) {
        alert("User not logged in!");
        return;
    }

    const userGreeting = document.getElementById("userGreeting");
    userGreeting.innerHTML = `Welcome,   ${userName}`;

    try {
        const response = await fetch(`http://localhost:3000/user/get-user-reservations/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch reservations");

        const data = await response.json();

        populateTable("pendingTable", data.pending, false);
        populateTable("confirmedTable", data.confirmed, true);

        document.getElementById("totalReservations").innerHTML = data.summary.totalReservations;
        document.getElementById("pendingReservations").innerHTML = data.summary.pendingReservations;
        document.getElementById("confirmedReservations").innerHTML = data.summary.confirmedReservations;
        document.getElementById("totalAmount").innerHTML = `Rs. ${data.summary.totalAmount}`;
    } catch (error) {
        console.error("Error loading reservations:", error);
    }
}

function populateTable(tableId, reservations, includeActions) {
    const tableBody = document.getElementById(tableId).querySelector("tbody");
    tableBody.innerHTML = "";
    
    if (reservations.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="${includeActions ? 8 : 6}">No Reservations Found.</td></tr>`;
    }

    reservations.forEach((reservation) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${reservation.reservation_id}</td>
            <td>${reservation.vehicle}</td>
            <td>${formatDate(reservation.start_date)}</td>
            <td>${formatDate(reservation.end_date)}</td>
            <td>${reservation.Message}</td>
            ${includeActions ? `<td>${reservation.amount}</td><td>${reservation.payment_status}</td>` : ""}
        `;
        if (tableId === "pendingTable") {
            const actionsCell = document.createElement("td");
            // Refund button logic
            const refundBtn = document.createElement("button");
            refundBtn.className = "btn-del";
            refundBtn.innerText = reservation.refund_status === 'In Process' ? 'In Process' : 'Refund';
            refundBtn.disabled = reservation.refund_status === 'In Process';
            refundBtn.onclick = async () => {
                refundBtn.innerText = 'In Process';
                refundBtn.disabled = true;
                await requestRefund(reservation.reservation_id, refundBtn);
            };
            actionsCell.appendChild(refundBtn);
            row.appendChild(actionsCell);
        } else if (includeActions) {
            const actionsCell = document.createElement("td");
            actionsCell.innerHTML = `
                <button class="btn-pay" onclick="payReservation(${reservation.reservation_id})">Pay</button>
            `;
            // Add refund button beside pay button for confirmed reservations
            const refundBtn = document.createElement("button");
            refundBtn.className = "btn-del";
            refundBtn.innerText = reservation.refund_status === 'In Process' ? 'In Process' : 'Refund';
            refundBtn.disabled = reservation.refund_status === 'In Process';
            refundBtn.onclick = async () => {
                refundBtn.innerText = 'In Process';
                refundBtn.disabled = true;
                await requestRefund(reservation.reservation_id, refundBtn);
            };
            actionsCell.appendChild(refundBtn);
            row.appendChild(actionsCell);
        }
        tableBody.appendChild(row);
    });
}

async function requestRefund(reservationId, btn) {
    try {
        const response = await fetch(`http://localhost:3000/user/request-refund/${reservationId}`, { method: 'POST' });
        const result = await response.json();
        if (result.success) {
            btn.innerText = 'In Process';
            btn.disabled = true;
            alert('Refund request submitted.');
        } else {
            btn.innerText = 'Refund';
            btn.disabled = false;
            alert(result.message || 'Refund request failed.');
        }
    } catch (err) {
        btn.innerText = 'Refund';
        btn.disabled = false;
        alert('Error submitting refund request.');
    }
}

async function payReservation(reservationId) {
    await fetch(`http://localhost:3000/user/update-payment-status/${reservationId}`, { method: "POST" });
    alert("Payment Completed");
    location.reload();
}

async function loadUserFeedbacks () {
    const userID = localStorage.getItem("userUser_ID");
    const vehicleSelect = document.getElementById("vehicleSelect");
    console.log(userID);

    try {
        const response = await fetch(`http://localhost:3000/user/getReservations?user_id=${userID}`);
        const vehicles = await response.json();

        if (vehicles.length === 0) {
            alert("No vehicles found for feedback. Make a Reservation First");
            return;
        }

        vehicles.forEach(vehicle => {
            const option = document.createElement("option");
            option.value = vehicle.vehicle_id;
            option.textContent = `${vehicle.brand} ${vehicle.model}`;
            vehicleSelect.appendChild(option);
        });
    } catch (err) {
        console.error("Error fetching reservations:", err);
    }

    document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const vehicleID = vehicleSelect.value;
        const rating = document.getElementById("rating").value;
        const comments = document.getElementById("comments").value;

        const feedback = { user_id: userID, vehicle_id: vehicleID, rating, comments };

        try {
            const response = await fetch("http://localhost:3000/user/submitFeedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(feedback),
            });

            const result = await response.json();
            if (result.success) {
                alert("Feedback submitted successfully!");
                location.reload();
            } else {
                alert("Error submitting feedback.");
            }
        } catch (err) {
            console.error("Error submitting feedback:", err);
        }
    });
}
