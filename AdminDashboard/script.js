document.addEventListener('DOMContentLoaded', () => {
    const adminNameElement = document.getElementById("adminName");
    adminNameElement.innerText = localStorage.getItem('adminFullName');

    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === "manage_vehicles.html") {
        checkAdmin(loadVehicles);
    }
    else if (currentPage === "edit_vehicle.html") {
        checkAdmin(loadVehicleDataForEdit);
    }
    else if (currentPage === "new_bookings.html") {
        checkAdmin(loadPendingReservations);
    }
    else if (currentPage === "confirmed_bookings.html") {
        checkAdmin(loadConfirmedReservations);
    }
    else if (currentPage === "manage_users.html") {
        checkAdmin(loadAdminsAndCustomers);
    }
    else if (currentPage === "manage_feedbacks.html") {
        checkAdmin(loadFeedbacks);
    }
    else if (currentPage === "manage_maintenance.html") {
        checkAdmin(loadMaintenanceRecords);
    }
    else if (currentPage === "manage_payments.html") {
        checkAdmin(() => {
            loadPayments();
            loadRefunds();
        });
    }
    else if (currentPage === "manage_insurances.html") {
        checkAdmin(loadInsurances);
    }
    else if (currentPage === "edit_insurance.html") {
        checkAdmin(loadInsuranceDataForEdit);
    }
    else if (currentPage === "index.html") {
        checkAdmin(loadDashboardData);
    }
    else if (currentPage === "customer_details.html") {
        checkAdmin(loadCustomerDetails);
    }
    else if (currentPage === "manage_reports.html") {
        checkAdmin(initReportsPage);
    }
});

// Login Form
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
        const response = await fetch('http://localhost:3000/common/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.message === 'Invalid credentials') {
                alert('Incorrect email or password. Please try again.');
            } else {
                alert('An error occurred. Please try again later.');
            }
            return;
        }

        const data = await response.json();
        
        if (data.success) {
            if (data.user.role === 'Admin') {
                const fullName = `${data.user.first_name} ${data.user.last_name}`;
                localStorage.setItem('adminFullName', fullName);
                localStorage.setItem('User_ID', data.user.user_id);
                window.location.href = '/AdminDashboard/index.html';
            } else if (data.user.role === 'Customer') {
                const fullName = `${data.user.first_name} ${data.user.last_name}`;
                localStorage.setItem('userFullName', fullName);
                localStorage.setItem('userUser_ID', data.user.user_id);
                window.location.href = '/UserDashboard/mainDashboard.html';
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login.');
        window.location.href = '#';
    }
});

// Signup Form 
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        role: e.target.role.value,
        first_name: e.target.first_name.value,
        last_name: e.target.last_name.value,
        email: e.target.email.value,
        phone_number: e.target.phone_number.value,
        password: e.target.password.value,
    };

    try {
        const response = await fetch('http://localhost:3000/common/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await response.json();
        alert(data.message);
        if (data.success) window.location.href = '/LoginSignup/login.html';
    } catch (error) {
        console.error('Signup error:', error);
        alert('An error occurred during signup.');
    }
});

// Change Password Form
document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = e.target.current_password.value;
    const newPassword = e.target.new_password.value;
    const confirmPassword = e.target.confirm_password.value;

    if (newPassword !== confirmPassword) {
        return alert('New password and confirm password do not match.');
    }

    const userId = localStorage.getItem('User_ID');
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
        if (data.success) window.location.href = 'index.html';
    } catch (err) {
        console.error('Password change error:', err);
        alert('An error occurred during password change.');
    }
});

// Logout Functionality
async function logout() {
    const userId = localStorage.getItem('User_ID');
    try {
        const response = await fetch('http://localhost:3000/common/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });

        const data = await response.json();

        if (data.success) {
            localStorage.removeItem('User_ID');
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

// post_vehicle.html
document.getElementById("postVehicleForm")?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('http://localhost:3000/admin/post-vehicle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert("Vehicle posted successfully!");
            event.target.reset();
        } else {
            alert("Failed to post vehicle. Please try again.");
        }
    } catch (error) {
        alert("An error occurred: " + error.message);
    }
});

//Check Admin Only
function checkAdmin(callback) {
    fetch('http://localhost:3000/admin/check-admin')
        .then(response => {
            if (response.status === 200) {
                callback();
            } else {
                window.location.href = "/LoginSignup/login.html";
            }
        })
        .catch(error => {
            alert("Error checking admin status:");
            window.location.href = "/LoginSignup/login.html";
        });
}

//Format Date
function formatDate(dateString) {
    if (!dateString) return ' - ';
    
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const date = new Date(dateString);

    if (isNaN(date)) return ' - ';
    return date.toLocaleDateString('en-GB', options);
}



//Manage Vehicles
async function loadVehicles() {
    try {
        const response = await fetch('http://localhost:3000/admin/get-vehicles');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const vehicles = await response.json();
        const tableBody = document.querySelector('#vehiclesTable tbody');
        tableBody.innerHTML = '';

        if (vehicles.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="10">No Vehicles found.</td></tr>';
        }

        vehicles.forEach(vehicle => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vehicle.vehicle_id}</td>
                <td>${vehicle.brand}</td>
                <td>${vehicle.model}</td>
                <td>${vehicle.year}</td>
                <td>${vehicle.capacity}</td>
                <td>Rs. ${vehicle.price_per_day}</td>
                <td>${vehicle.comfort_quality}/5</td>
                <td>${vehicle.availability_status === 1 ? 'Available' : 'Unavailable'}</td>
                <td>${vehicle.mileage} Km</td>
                <td>
                    <a href="edit_vehicle.html?id=${vehicle.vehicle_id}" class="btn btn-edit">Edit</a>
                    <button class="btn btn-delete" onclick="deleteVehicle(${vehicle.vehicle_id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching vehicles:', error);
    }
}
// Delete Vehicle
async function deleteVehicle(vehicleId) {
    const confirmAction = confirm("Are you sure you want to delete this vehicle?");
    if (!confirmAction) return;

    try {
        const response = await fetch(`http://localhost:3000/admin/delete-vehicle/${vehicleId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert("Vehicle deleted successfully.");
            loadVehicles();
        } else {
            alert("Failed to delete vehicle. Please try again.");
        }
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        alert("An error occurred while deleting the vehicle.");
    }
}
// edit_vehicle.html
document.getElementById("editVehicleForm")?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('http://localhost:3000/admin/edit-vehicle', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert("Vehicle updated successfully!");
            window.location.href = "manage_vehicles.html";
        } else {
            alert("Failed to update vehicle. Please try again.");
        }
    } catch (error) {
        alert("An error occurred: " + error.message);
    }
});

// Pre-fill with data for edit_vehicle.html
async function loadVehicleDataForEdit() {
    const params = new URLSearchParams(window.location.search);
    const vehicleId = params.get("id");

    if (!vehicleId) { return; }
    try {
        const response = await fetch(`http://localhost:3000/admin/get-vehicle/${vehicleId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const vehicle = await response.json();

        document.getElementById("vehicle_id").value = vehicle.vehicle_id;
        document.getElementById("brand").value = vehicle.brand;
        document.getElementById("model").value = vehicle.model;
        document.getElementById("year").value = vehicle.year;
        document.getElementById("capacity").value = vehicle.capacity;
        document.getElementById("price_per_day").value = vehicle.price_per_day;
        document.getElementById("comfort_quality").value = vehicle.comfort_quality;
        document.getElementById("availability_status").value = vehicle.availability_status;
        document.getElementById("mileage").value = vehicle.mileage;
    } catch (error) {
        console.error('Error loading vehicle data for edit:', error);
        alert("Failed to load vehicle data. Please try again.");
    }
}

// new_bookings.html
async function loadPendingReservations() {
    try {
        const response = await fetch('http://localhost:3000/admin/get-pending-reservations');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const reservations = await response.json();

        const tableBody = document.querySelector('#reservationsTable tbody');
        tableBody.innerHTML = '';

        reservations.forEach(reservation => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${reservation.reservation_id}</td>
                <td>${reservation.vehicle_brand} ${reservation.vehicle_model}</td>
                <td>${reservation.first_name} ${reservation.last_name}</td>
                <td>${formatDate(reservation.start_date)}</td>
                <td>${formatDate(reservation.end_date)}</td>
                <td>${reservation.status}</td>
                <td>${reservation.message}</td>
                <td><button class="approve-btn" onclick="approveReservation(${reservation.reservation_id})">Approve</button></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading reservations:', error);
    }
}

//Related to New Bookings
async function approveReservation(reservationId) {
    const confirmAction = confirm("Are you sure you want to approve this reservation?");
    if (!confirmAction) return;

    try {
        const response = await fetch(`http://localhost:3000/admin/approve-reservation/${reservationId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        alert("Reservation approved successfully.");
        loadPendingReservations();
    } catch (error) {
        console.error("Error approving reservation:", error);
        alert("Failed to approve the reservation. Please try again.");
    }
}

// confirmed_bookings.html
async function loadConfirmedReservations() {
    try {
        const response = await fetch("http://localhost:3000/admin/get-confirmed-reservations");
        const data = await response.json();

        const tableBody = document.querySelector("#reservationsTable tbody");

        data.forEach((reservation) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${reservation.reservation_id}</td>
                <td>${reservation.vehicle_brand} ${reservation.vehicle_model}</td>
                <td>${reservation.first_name} ${reservation.last_name}</td>
                <td>${formatDate(reservation.start_date)}</td>
                <td>${formatDate(reservation.end_date)}</td>
                <td>${reservation.status}</td>
                <td>${reservation.message}</td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching confirmed reservations:", error);
    }
}
// manage_users.html
async function loadAdminsAndCustomers() {
    try {
        // Admins
        const adminsResponse = await fetch("http://localhost:3000/admin/get-admins");
        const adminsData = await adminsResponse.json();

        const adminsTableBody = document.querySelector("#adminsTable tbody");
        adminsTableBody.innerHTML = "";

        adminsData.forEach((admin) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${admin.user_id}</td>
                <td>${admin.first_name}</td>
                <td>${admin.last_name}</td>
                <td>${admin.email}</td>
                <td>${admin.phone_number}</td>
            `;

            adminsTableBody.appendChild(row);
        });

        // Customers
        const customersResponse = await fetch("http://localhost:3000/admin/get-customers");
        const customersData = await customersResponse.json();

        const customersTableBody = document.querySelector("#customersTable tbody");
        customersTableBody.innerHTML = "";

        customersData.forEach((customer) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${customer.user_id}</td>
                <td>${customer.first_name}</td>
                <td>${customer.last_name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone_number}</td>
                <td>
                    <button class="btn-detail" onclick="viewCustomerDetails(${customer.user_id})">Details</button>
                </td>
            `;

            customersTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading users:", error);
    }
}

// Getting Customer History
function viewCustomerDetails(userId) {
    window.location.href = `customer_details.html?user_id=${userId}`;
}

// manage_feedbacks.html
async function loadFeedbacks() {
    try {
        const response = await fetch("http://localhost:3000/admin/get-feedbacks");
        const data = await response.json();

        const tableBody = document.querySelector("#feedbacksTable tbody");
        tableBody.innerHTML = "";

        data.forEach((feedback) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${feedback.feedback_id}</td>
                <td>${feedback.vehicle_id}</td>
                <td>${feedback.user_id}</td>
                <td>${feedback.rating}</td>
                <td>${feedback.comments}</td>
                <td>${formatDate(feedback.feedback_date)}</td>
                <td>${feedback.read_status}</td>
                <td>
                    ${feedback.read_status === "Unread"
                        ? `<button class="read-btn" onclick="markFeedbackAsRead(${feedback.feedback_id})">Mark as Read</button>`
                        : "Already Read"}
                </td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading feedbacks:", error);
    }
}

async function markFeedbackAsRead(feedbackId) {
    try {
        await fetch(`http://localhost:3000/admin/mark-feedback-read/${feedbackId}`, {
            method: "PUT",
        });
        loadFeedbacks();
    } catch (error) {
        console.error("Error marking feedback as read:", error);
    }
}

// manage_maintenance.html
async function loadMaintenanceRecords() {
    try {
        const response = await fetch('http://localhost:3000/admin/get-maintenance');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const maintenanceRecords = await response.json();
        const tableBody = document.querySelector('#maintenanceTable tbody');
        tableBody.innerHTML = '';

        maintenanceRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.maintenance_id}</td>
                <td>${record.vehicle_id}</td>
                <td>${formatDate(record.service_date)}</td>
                <td>${record.details}</td>
                <td>Rs. ${record.cost}</td>
                <td><button class="btn-delete" onclick="deleteMaintenance(${record.maintenance_id})">Delete</button></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching maintenance records:', error);
        alert('Failed to load maintenance records. Please try again.');
    }
}

// Post_maintainance.html
document.getElementById('postMaintenanceForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const vehicleId = document.getElementById('vehicle_id').value;
    const serviceDate = document.getElementById('service_date').value;
    const details = document.getElementById('details').value;
    const cost = document.getElementById('cost').value;

    try {
        const response = await fetch('http://localhost:3000/admin/post-maintenance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vehicle_id: vehicleId,
                service_date: serviceDate,
                details: details,
                cost: parseFloat(cost)
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Maintenance record successfully added!');
            document.getElementById('postMaintenanceForm').reset();
        } else {
            alert(`Failed to add maintenance record: ${result.message}`);
        }
    } catch (error) {
        console.error('Error submitting maintenance record:', error);
        alert('An error occurred while submitting the form. Please try again.');
    }
});

// Delete maintenance
async function deleteMaintenance(maintenanceId) {
    const confirmAction = confirm('Are you sure you want to delete this maintenance record?');
    if (!confirmAction) return;

    try {
        const response = await fetch(`http://localhost:3000/admin/delete-maintenance/${maintenanceId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Maintenance record deleted successfully.');
            loadMaintenanceRecords();
        } else {
            alert('Failed to delete maintenance record. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting maintenance record:', error);
        alert('An error occurred while deleting the maintenance record.');
    }
}

// manage_payments.html
async function loadPayments() {
    try {
        const response = await fetch('http://localhost:3000/admin/get-payments');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const payments = await response.json();

        const tableBody = document.querySelector('#paymentsTable tbody');
        tableBody.innerHTML = '';

        if (payments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">No payments found.</td></tr>';
        }

        payments.forEach(payment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${payment.payment_id}</td>
                <td>${payment.first_name} ${payment.last_name}</td>
                <td>${payment.reservation_id}</td>
                <td>Rs. ${payment.amount}</td>
                <td>${formatDate(payment.payment_date)}</td>
                <td>${payment.payment_status}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        alert('Failed to load payments. Please try again.');
    }
}

// Load Pending Refunds
async function loadRefunds() {
    try {
        const response = await fetch('http://localhost:3000/admin/get-pending-refunds');
        if (!response.ok) throw new Error('Failed to fetch pending refunds');
        const refunds = await response.json();
        const tableBody = document.querySelector('#refundsTable tbody');
        tableBody.innerHTML = '';
        if (refunds.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7">No pending refunds.</td></tr>';
        }
        refunds.forEach(refund => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${refund.payment_id}</td>
                <td>${refund.first_name} ${refund.last_name}</td>
                <td>${refund.reservation_id}</td>
                <td>Rs. ${refund.amount}</td>
                <td>${formatDate(refund.payment_date)}</td>
                <td>${refund.status}</td>
                <td><button class="btn-del" onclick="processRefund(${refund.reservation_id})">Process Refund</button></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading refunds:', error);
    }
}

async function processRefund(reservationId) {
    if (!confirm('Are you sure you want to process this refund?')) return;
    try {
        const response = await fetch(`http://localhost:3000/admin/process-refund/${reservationId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to process refund');
        alert('Refund processed and reservation deleted.');
        loadRefunds();
        loadPayments();
    } catch (error) {
        alert('Error processing refund.');
    }
}

// manage_insurances.html
function loadInsurances() {
    fetch('http://localhost:3000/admin/manage-insurances')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#insurancesTable tbody');
            tableBody.innerHTML = '';
            data.forEach((insurance) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${insurance.insurance_id}</td>
                    <td>${insurance.brand}</td>
                    <td>${insurance.model}</td>
                    <td>${insurance.insurance_provider}</td>
                    <td>${insurance.coverage_details}</td>
                    <td>${formatDate(insurance.start_date)}</td>
                    <td>${formatDate(insurance.end_date)}</td>
                    <td>${insurance.claim_status}</td>
                    <td>
                        <a href="edit_insurance.html?id=${insurance.insurance_id}" class="btn btn-edit">Edit</a>
                        <button class="btn btn-delete" onclick="deleteInsurance(${insurance.insurance_id})">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching insurances:', error));
}

// Delete Insurance
async function deleteInsurance(insurance_id) {
    const confirmAction = confirm("Are you sure you want to delete this insurance?");
    if (!confirmAction) return;

    try {
        const response = await fetch(`http://localhost:3000/admin/delete-insurance/${insurance_id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert("Insurance deleted successfully.");
            loadInsurances();
        } else {
            alert("Failed to delete insurance. Please try again.");
        }
    } catch (error) {
        console.error("Error deleting insurance:", error);
        alert("An error occurred while deleting the insurance.");
    }
}

// edit_insurance.html
document.getElementById("editInsuranceForm")?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('http://localhost:3000/admin/edit-insurance', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert("Insurance updated successfully!");
            window.location.href = "manage_insurances.html";
        } else {
            alert("Failed to update insurance. Please try again.");
        }
    } catch (error) {
        alert("An error occurred: " + error.message);
    }
});

// Pre-fill data on 
// edit_insurance.html
async function loadInsuranceDataForEdit() {
    const params = new URLSearchParams(window.location.search);
    const insuranceId = params.get("id");

    if (!insuranceId) { return; }
    try {
        const response = await fetch(`http://localhost:3000/admin/get-insurance/${insuranceId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const insurance = await response.json();
        console.log(insurance);

        document.getElementById("insurance_id").value = insurance.insurance_id;
        document.getElementById("vehicle_id").value = insurance.vehicle_id;
        document.getElementById("insurance_provider").value = insurance.insurance_provider;
        document.getElementById("coverage_details").value = insurance.coverage_details;
        document.getElementById("start_date").value = insurance.start_date.split('T')[0];
        document.getElementById("end_date").value = insurance.end_date.split('T')[0];
        document.getElementById("claim_status").value = insurance.claim_status;
    } catch (error) {
        console.error('Error loading insurance data for edit:', error);
        alert("Failed to load insurance data. Please try again.");
    }
}


async function loadCustomerDetails() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("user_id");

    if (!userId) {
        console.warn("User ID is missing in the URL.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/admin/get-customer-history/${userId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        const customerNameElem = document.getElementById("customerName");
        const tableBody = document.querySelector("#rentalHistoryTable tbody");
        const totalReservationsElem = document.getElementById("totalReservations");
        const totalAmountElem = document.getElementById("totalAmount");

        // Set customer name
        customerNameElem.innerText = `Customer Name: ${data.user.first_name} ${data.user.last_name}`;
        
        tableBody.innerHTML = "";

        data.reservations.forEach((reservation) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${reservation.reservation_id}</td>
                <td>${reservation.vehicle_brand} ${reservation.vehicle_model}</td>
                <td>${formatDate(reservation.start_date)}</td>
                <td>${formatDate(reservation.end_date)}</td>
                <td>Rs. ${reservation.amount}</td>
                <td>${formatDate(reservation.payment_date)}</td>
                <td>${reservation.payment_status}</td>
            `;
            tableBody.appendChild(row);
        });

        totalReservationsElem.innerHTML = data.totalReservations;
        totalAmountElem.innerHTML = `Rs. ${data.totalAmount}`;


    } catch (error) {
        console.error("Error loading customer details:", error);
        alert("Failed to load customer details. Please try again.");
    }
}

// Dashboard
async function loadDashboardData() {
    try {
        const response = await fetch("http://localhost:3000/admin/get-dashboard-data");
        if (!response.ok) throw new Error("Failed to fetch dashboard data.");

        const data = await response.json();

        document.getElementById("vehicleCount").innerHTML = data.vehiclesCount;
        document.getElementById("maintenanceCount").innerHTML = data.maintenanceCount;
        document.getElementById("newBookingsCount").innerHTML = data.newBookingsCount;
        document.getElementById("confirmedBookingsCount").innerHTML = data.confirmedBookingsCount;
        document.getElementById("insuranceCount").innerHTML = data.insuranceCount;
        document.getElementById("feedbackCount").innerHTML = data.feedbackCount;
        document.getElementById("customerCount").innerHTML = data.customerCount;
        document.getElementById("adminCount").innerHTML = data.adminCount;
    } catch (error) {
        console.error("Error loading dashboard data:", error);
        alert("Failed to load dashboard data. Please try again later.");
    }
}

// Reports Page
function initReportsPage() {
    loadAvailableMonths();
    document.getElementById('filterByDate').addEventListener('click', fetchReportByDateRange);
    document.getElementById('monthSelect').addEventListener('change', fetchReportByMonth);
}

async function loadAvailableMonths() {
    try {
        const response = await fetch('http://localhost:3000/admin/get-report-months');
        const months = await response.json();
        const monthSelect = document.getElementById('monthSelect');
        monthSelect.innerHTML = '<option value="">--Select Month--</option>';
        months.forEach(m => {
            const option = document.createElement('option');
            option.value = m.year + '-' + (m.month < 10 ? '0' : '') + m.month;
            option.text = `${m.monthName} ${m.year}`;
            monthSelect.appendChild(option);
        });
    } catch (err) {
        console.error('Error loading months:', err);
    }
}

async function fetchReportByDateRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    if (!startDate || !endDate) {
        alert('Please select both start and end dates.');
        return;
    }
    try {
        const response = await fetch(`http://localhost:3000/admin/get-report-by-dates?start=${startDate}&end=${endDate}`);
        const data = await response.json();
        renderReportTable(data);
    } catch (err) {
        console.error('Error fetching report:', err);
    }
}

async function fetchReportByMonth() {
    const monthVal = document.getElementById('monthSelect').value;
    if (!monthVal) return;
    try {
        const response = await fetch(`http://localhost:3000/admin/get-report-by-month?month=${monthVal}`);
        const data = await response.json();
        renderReportTable(data);
    } catch (err) {
        console.error('Error fetching report:', err);
    }
}

function renderReportTable(data) {
    const tableBody = document.querySelector('#reportTable tbody');
    tableBody.innerHTML = '';
    let totalReservations = 0;
    let totalAmount = 0;
    if (data.reservations && data.reservations.length > 0) {
        data.reservations.forEach(reservation => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${reservation.reservation_id}</td>
                <td>${reservation.first_name} ${reservation.last_name}</td>
                <td>${reservation.vehicle_brand} ${reservation.vehicle_model}</td>
                <td>${formatDate(reservation.start_date)}</td>
                <td>${formatDate(reservation.end_date)}</td>
                <td>Rs. ${reservation.amount}</td>
                <td>${formatDate(reservation.payment_date)}</td>
                <td>${reservation.payment_status}</td>
            `;
            tableBody.appendChild(row);
            totalReservations++;
            totalAmount += Number(reservation.amount) || 0;
        });
    } else {
        tableBody.innerHTML = '<tr><td colspan="7">No reservations found for selected period.</td></tr>';
    }
    document.getElementById('totalReservations').innerText = totalReservations;
    document.getElementById('totalAmount').innerText = `Rs. ${totalAmount}`;
}