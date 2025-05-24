const express = require('express');
const router = express.Router();
const db = require('./db');


router.get("/check-admin", (req, res) => {
    const query = "SELECT * FROM user WHERE role = 'Admin' AND LoggedIn = 'Yes'";

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            res.status(500).json({ success: false, message: "Internal server error." });
        } else if (results.length === 0) {
            res.status(401).json({ success: false, message: "No admin is currently logged in." });
        } else {
            res.status(200).json({ success: true, message: "An admin is logged in." });
        }
    });
});

// post_vehicle.html
router.post("/post-vehicle", (req, res) => {
    const {
        brand,
        model,
        year,
        capacity,
        price_per_day,
        comfort_quality,
        availability_status,
        mileage,
    } = req.body;

    const query = `
        INSERT INTO vehicle (brand, model, year, capacity, price_per_day, comfort_quality, availability_status, mileage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [brand, model, year, capacity, price_per_day, comfort_quality, availability_status, mileage],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send("Failed to insert vehicle.");
            } else {
                res.status(200).send("Vehicle added successfully.");
            }
        }
    );
});

// manage_vehicels.html 
router.get("/get-vehicles", (req, res) => {
    const query = "SELECT * FROM vehicle";

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            res.status(500).send("Failed to fetch vehicles.");
        } else {
            res.status(200).json(results);
        }
    });
});

// DELETE vehicle
router.delete("/delete-vehicle/:id", (req, res) => {
    const vehicleId = req.params.id;
    const query = "DELETE FROM vehicle WHERE vehicle_id = ?";

    db.query(query, [vehicleId], (err, result) => {
        if (err) {
            console.error("Error deleting vehicle:", err);
            res.status(500).send("Failed to delete vehicle.");
        } else if (result.affectedRows === 0) {
            res.status(404).send("Vehicle not found.");
        } else {
            res.status(200).send("Vehicle deleted successfully.");
        }
    });
});

// edit_vehicle.html
router.get("/get-vehicle/:id", (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM vehicle WHERE vehicle_id = ?";

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            res.status(500).send("Failed to fetch vehicle.");
        } else if (results.length === 0) {
            res.status(404).send("Vehicle not found.");
        } else {
            res.status(200).json(results[0]);
        }
    });
});

router.put("/edit-vehicle", (req, res) => {
    const {
        vehicle_id,
        brand,
        model,
        year,
        capacity,
        price_per_day,
        comfort_quality,
        availability_status,
        mileage,
    } = req.body;

    const query = `
        UPDATE vehicle 
        SET brand = ?, model = ?, year = ?, capacity = ?, price_per_day = ?, comfort_quality = ?, availability_status = ?, mileage = ?
        WHERE vehicle_id = ?
    `;

    db.query(
        query,
        [brand, model, year, capacity, price_per_day, comfort_quality, availability_status, mileage, vehicle_id],
        (err, result) => {
            if (err) {
                console.error("Database Update Error:", err);
                res.status(500).send("Failed to update vehicle.");
            } else if (result.affectedRows === 0) {
                res.status(404).send("Vehicle not found.");
            } else {
                res.status(200).send("Vehicle updated successfully.");
            }
        }
    );
});
// new_bookings.html
router.get("/get-pending-reservations", (req, res) => {
    const query = `SELECT 
    r.reservation_id, 
    v.brand AS vehicle_brand, 
    v.model AS vehicle_model,
    u.first_name,
    u.last_name,
    r.start_date,
    r.end_date,
    r.status,
    r.message
    FROM reservation r
    INNER JOIN vehicle v ON r.vehicle_id = v.vehicle_id
    INNER JOIN user u ON u.user_id=r.user_id
    WHERE r.status = 'Pending'`;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            res.status(500).send("Failed to fetch reservations.");
        } else {
            res.status(200).json(results);
        }
    });
});

// Update history table when a reservation is approved
router.put("/approve-reservation/:id", (req, res) => {
    const reservationId = req.params.id;
    const query = "UPDATE reservation SET status = 'Confirmed' WHERE reservation_id = ?";

    db.query(query, [reservationId], (err, results) => {
        if (err) {
            console.error("Error updating reservation status:", err);
            res.status(500).send("Failed to approve reservation.");
        } else {
            const historyQuery = `UPDATE history SET status = 'Confirmed' WHERE reservation_id = ?`;

            db.query(historyQuery, [reservationId], (historyErr) => {
                if (historyErr) {
                    console.error("Error updating history table:", historyErr);
                    res.status(500).send("Failed to update history table.");
                } else {
                    res.status(200).send("Reservation approved and history updated successfully.");
                }
            });
        }
    });
});

// confirmed_bookings.html
router.get("/get-confirmed-reservations", (req, res) => {
    const query = `SELECT 
    r.reservation_id, 
    v.brand AS vehicle_brand, 
    v.model AS vehicle_model,
    u.first_name,
    u.last_name,
    r.start_date,
    r.end_date,
    r.status,
    r.message
    FROM reservation r
    INNER JOIN vehicle v ON r.vehicle_id = v.vehicle_id
    INNER JOIN user u ON u.user_id=r.user_id
    WHERE r.status = 'Confirmed'
    ORDER BY u.user_id`;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            res.status(500).send("Failed to fetch confirmed reservations.");
        } else {
            res.status(200).json(results);
        }
    });
});
// manage_feedbacks.html
router.get("/get-feedbacks", (req, res) => {
    const query = "SELECT * FROM feedback ORDER BY read_status ASC, feedback_date DESC";

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            res.status(500).send("Failed to fetch feedbacks.");
        } else {
            res.status(200).json(results);
        }
    });
});

router.put("/mark-feedback-read/:id", (req, res) => {
    const feedbackId = req.params.id;
    const query = "UPDATE feedback SET read_status = 'Read' WHERE feedback_id = ?";

    db.query(query, [feedbackId], (err, results) => {
        if (err) {
            console.error("Error updating feedback read status:", err);
            res.status(500).send("Failed to mark feedback as read.");
        } else {
            res.status(200).send("Feedback marked as read successfully.");
        }
    });
});
// manage_users.html
router.get("/get-admins", (req, res) => {
    const query = "SELECT * FROM user WHERE role = 'Admin' ORDER BY user_id ASC";

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            res.status(500).send("Failed to fetch users.");
        } else {
            res.status(200).json(results);
        }
    });
});


router.get("/get-customers", (req, res) => {
    const query = "SELECT * FROM user WHERE role = 'Customer' ORDER BY user_id ASC";

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            res.status(500).send("Failed to fetch users.");
        } else {
            res.status(200).json(results);
        }
    });
});

// manage_maintenance.html
router.get('/get-maintenance', (req, res) => {
    const query = 'SELECT * FROM vehicle_maintenance';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Post_maintainance.html
router.post('/post-maintenance', (req, res) => {
    const { vehicle_id, service_date, details, cost } = req.body;

    if (!vehicle_id || !service_date || !details || !cost) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const query = `
        INSERT INTO vehicle_maintenance (vehicle_id, service_date, details, cost)
        VALUES (?, ?, ?, ?)
    `;
    const values = [vehicle_id, service_date, details, cost];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting maintenance record:', err.message);
            return res.status(500).json({ message: 'Failed to add maintenance record.' });
        }

        res.status(201).json({ message: 'Maintenance record added successfully.', recordId: result.insertId });
    });
});

router.delete('/delete-maintenance/:id', (req, res) => {
    const maintenanceId = req.params.id;
    const query = 'DELETE FROM vehicle_maintenance WHERE maintenance_id = ?';
    db.query(query, [maintenanceId], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Record deleted successfully' });
    });
});

// manage_payments.html
router.get('/get-payments', (req, res) => {
    const query = `
        SELECT 
            p.payment_id,
            p.reservation_id,
            p.amount,
            p.payment_date,
            p.payment_status,
            u.first_name,
            u.last_name
        FROM payment p
        JOIN reservation r ON p.reservation_id = r.reservation_id
        JOIN user u ON r.user_id = u.user_id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching payments:', err);
            res.status(500).send('Failed to fetch payments.');
        } else {
            res.status(200).json(results);
        }
    });
});

// post_insurance.html
router.post("/post-insurances", (req, res) => {
    const {
        vehicle_id,
        insurance_provider,
        coverage_details,
        start_date,
        end_date,
        claim_status,
    } = req.body;

    const query = `
        INSERT INTO insurance (vehicle_id, insurance_provider, coverage_details, start_date, end_date, claim_status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [vehicle_id, insurance_provider, coverage_details, start_date, end_date, claim_status],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send("Failed to insert insurance.");
            } else {
                res.status(200).send("Insurance added successfully.");
            }
        }
    );
});

// manage_insurances.html
router.get('/manage-insurances', (req, res) => {
    const query = `
        SELECT 
            i.insurance_id,
            v.brand, 
            v.model,
            i.insurance_provider, 
            i.coverage_details, 
            i.start_date, 
            i.end_date, 
            i.claim_status
        FROM 
            insurance i
        JOIN 
            vehicle v ON i.vehicle_id = v.vehicle_id
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Failed to retrieve insurances.");
        } else {
            res.json(result);
        }
    });
});

// Delete Insurance
router.delete("/delete-insurance/:id", (req, res) => {
const insurance_id = req.params.id;
const query = "DELETE FROM insurance WHERE insurance_id = ?";

db.query(query, [insurance_id], (err, result) => {
    if (err) {
        console.error("Error deleting insurance:", err);
        res.status(500).send("Failed to delete insurance.");
    } else if (result.affectedRows === 0) {
        res.status(404).send("Insurance not found.");
    } else {
        res.status(200).send("Insurance deleted successfully.");
    }
});
});

// edit_insurance.html
router.get("/get-insurance/:id", (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM insurance WHERE insurance_id = ?";

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            res.status(500).send("Failed to fetch insurance.");
        } else if (results.length === 0) {
            res.status(404).send("Insurance not found.");
        } else {
            res.status(200).json(results[0]);
        }
    });
    });

    router.put("/edit-insurance", (req, res) => {
    const {
        insurance_id,
        vehicle_id,
        insurance_provider,
        coverage_details,
        start_date,
        end_date,
        claim_status,
    } = req.body;

    const query = `
        UPDATE insurance 
        SET vehicle_id = ?, insurance_provider = ?, coverage_details = ?, start_date = ?, end_date = ?, claim_status = ?
        WHERE insurance_id = ?
    `;

    db.query(
        query,
        [vehicle_id, insurance_provider, coverage_details, start_date, end_date, claim_status, insurance_id],
        (err, result) => {
            if (err) {
                console.error("Database Update Error:", err);
                res.status(500).send("Failed to update insurance.");
            } else if (result.affectedRows === 0) {
                res.status(404).send("Insurance not found.");
            } else {
                res.status(200).send("Insurance updated successfully.");
            }
        }
    );
});

router.get("/get-customer-history/:id", (req, res) => {
    const { id } = req.params;

    const historyQuery = `
        SELECT 
            h.history_id,
            h.reservation_id,
            v.brand AS vehicle_brand, 
            v.model AS vehicle_model,
            h.start_date,
            h.end_date,
            h.amount, 
            h.payment_date, 
            h.payment_status
        FROM history h
        INNER JOIN vehicle v ON h.vehicle_id = v.vehicle_id
        WHERE h.user_id = ?
    `;

    const summaryQuery = `
        SELECT 
            COUNT(*) AS totalReservations, 
            SUM(h.amount) AS totalAmount
        FROM history h
        WHERE h.user_id = ?
    `;

    const userQuery = `
        SELECT first_name, last_name
        FROM user
        WHERE user_id = ?
    `;

    db.query(userQuery, [id], (err, userResult) => {
        if (err) {
            console.error("Error fetching user details:", err);
            res.status(500).json({ error: "Failed to fetch user details." });
            return;
        }

        if (userResult.length === 0) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        const user = userResult[0];

        db.query(historyQuery, [id], (err, reservations) => {
            if (err) {
                console.error("Error fetching history records:", err);
                res.status(500).json({ error: "Failed to fetch history records." });
                return;
            }

            db.query(summaryQuery, [id], (err, summary) => {
                if (err) {
                    console.error("Error fetching history summary:", err);
                    res.status(500).json({ error: "Failed to fetch history summary." });
                    return;
                }

                res.status(200).json({
                    user: {
                        first_name: user.first_name,
                        last_name: user.last_name
                    },
                    reservations,
                    totalReservations: summary[0].totalReservations,
                    totalAmount: summary[0].totalAmount,
                });
            });
        });
    });
});

// Dashboard
router.get("/get-dashboard-data", (req, res) => {
const queries = {
    vehiclesCount: "SELECT COUNT(*) AS count FROM vehicle",
    maintenanceCount: "SELECT COUNT(*) AS count FROM vehicle_maintenance",
    newBookingsCount: "SELECT COUNT(*) AS count FROM reservation WHERE status = 'Pending'",
    confirmedBookingsCount: "SELECT COUNT(*) AS count FROM reservation WHERE status = 'Confirmed'",
    insuranceCount: "SELECT COUNT(*) AS count FROM insurance",
    feedbackCount: "SELECT COUNT(*) AS count FROM feedback",
    customerCount: "SELECT COUNT(*) AS count FROM user WHERE role = 'Customer'",
    adminCount: "SELECT COUNT(*) AS count FROM user WHERE role = 'Admin'"
};

const dashboardData = {};
const keys = Object.keys(queries);

const executeQueries = keys.map((key) => {
    return new Promise((resolve, reject) => {
        db.query(queries[key], (err, results) => {
            if (err) return reject(err);
            dashboardData[key] = results[0].count;
            resolve();
        });
    });
});

Promise.all(executeQueries)
    .then(() => res.json(dashboardData))
    .catch((error) => {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ error: "Failed to fetch dashboard data." });
    });
});


router.get('/get-report-months', (req, res) => {
    const query = `SELECT DISTINCT YEAR(payment_date) AS year, MONTH(payment_date) AS month, 
        MONTHNAME(payment_date) AS monthName
        FROM history
        WHERE payment_date IS NOT NULL
        ORDER BY year DESC, month DESC`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching months:', err);
            return res.status(500).json([]);
        }
        res.json(results);
    });
});

router.get('/get-report-by-dates', (req, res) => {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ reservations: [] });

    const query = `
        SELECT h.history_id, h.reservation_id,
               u.first_name, u.last_name,
               v.brand AS vehicle_brand, v.model AS vehicle_model,
               h.start_date, h.end_date, h.amount,
               h.payment_date, h.payment_status
        FROM history h
        INNER JOIN vehicle v ON h.vehicle_id = v.vehicle_id
        INNER JOIN user u ON h.user_id = u.user_id
        WHERE h.payment_date BETWEEN ? AND ?
    `;

    db.query(query, [start, end], (err, reservations) => {
        if (err) {
            console.error('Error fetching report:', err);
            return res.status(500).json({ reservations: [] });
        }
        res.json({ reservations });
    });
});


router.get('/get-report-by-month', (req, res) => {
    const { month } = req.query;
    if (!month) return res.status(400).json({ reservations: [] });

    const [year, m] = month.split('-');

    const query = `
        SELECT h.history_id, h.reservation_id,
               u.first_name, u.last_name,
               v.brand AS vehicle_brand, v.model AS vehicle_model,
               h.start_date, h.end_date, h.amount,
               h.payment_date, h.payment_status
        FROM history h
        INNER JOIN vehicle v ON h.vehicle_id = v.vehicle_id
        INNER JOIN user u ON h.user_id = u.user_id
        WHERE YEAR(h.payment_date) = ? AND MONTH(h.payment_date) = ?
    `;

    db.query(query, [year, m], (err, reservations) => {
        if (err) {
            console.error('Error fetching report:', err);
            return res.status(500).json({ reservations: [] });
        }
        res.json({ reservations });
    });
});


router.get('/get-pending-refunds', (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const query = `
        SELECT p.payment_id, u.first_name, u.last_name, r.reservation_id, p.amount, p.payment_date, r.status
        FROM reservation r
        JOIN payment p ON r.reservation_id = p.reservation_id
        JOIN user u ON r.user_id = u.user_id
        WHERE r.refund_status = 'In Process' AND r.start_date > ?
    `;
    db.query(query, [today], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch pending refunds.' });
        res.json(results);
    });
});

router.delete('/process-refund/:reservationId', (req, res) => {
    const { reservationId } = req.params;
    const deleteHistoryQuery = 'DELETE FROM history WHERE reservation_id = ?';

    db.query(deleteHistoryQuery, [reservationId], (historyErr) => {
        if (historyErr) {
            console.error("Error deleting from history table:", historyErr);
            return res.status(500).json({ error: 'Failed to delete from history table.' });
        }

        const getVehicleQuery = 'SELECT vehicle_id FROM reservation WHERE reservation_id = ?';
        db.query(getVehicleQuery, [reservationId], (err, results) => {
            if (err || results.length === 0) {
                return res.status(500).json({ error: 'Failed to find reservation for refund.' });
            }
            const vehicleId = results[0].vehicle_id;
            const deletePaymentQuery = 'DELETE FROM payment WHERE reservation_id = ?';
            const deleteReservationQuery = 'DELETE FROM reservation WHERE reservation_id = ?';
            db.query(deletePaymentQuery, [reservationId], (err) => {
                if (err) return res.status(500).json({ error: 'Failed to delete payment record.' });
                db.query(deleteReservationQuery, [reservationId], (err) => {
                    if (err) return res.status(500).json({ error: 'Failed to delete reservation record.' });
                    const updateVehicleQuery = 'UPDATE vehicle SET availability_status = 1 WHERE vehicle_id = ?';
                    db.query(updateVehicleQuery, [vehicleId], (err) => {
                        if (err) return res.status(500).json({ error: 'Failed to update vehicle availability.' });
                        res.json({ success: true, message: 'Refund processed, reservation deleted, and vehicle available.' });
                    });
                });
            });
        });
    });
});

module.exports = router;