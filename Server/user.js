const express = require('express');
const router = express.Router();
const db = require('./db');

router.get("/get-vehicles", (req, res) => {
    const query = "SELECT * FROM vehicle WHERE availability_status = '1'";

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            res.status(500).send("Failed to fetch vehicles.");
        } else {
            res.status(200).json(results);
        }
    });
});

router.get('/get-vehicle/:id', (req, res) => {
    const vehicleId = req.params.id;
    const sql = 'SELECT * FROM vehicle WHERE vehicle_id = ?';

    db.query(sql, [vehicleId], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Error fetching vehicle details.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Vehicle not found.' });
        }
        res.json(results[0]);
    });
});

// Update history table when a reservation is created
router.post('/book', (req, res) => {
    const { user_id, vehicle_id, start_date, end_date, message } = req.body;

    const vehicleCheckQuery = 'SELECT availability_status, price_per_day FROM vehicle WHERE vehicle_id = ?';
    db.query(vehicleCheckQuery, [vehicle_id], (err, vehicleResult) => {
        if (err) {
            console.error('Error checking vehicle:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        if (!vehicleResult.length || vehicleResult[0].availability_status === 0) {
            return res.status(400).json({ success: false, message: 'Vehicle is not available.' });
        }

        const pricePerDay = vehicleResult[0].price_per_day;

        const start = new Date(start_date);
        const end = new Date(end_date);
        let days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        days++;
        const totalAmount = days * pricePerDay;

        db.beginTransaction((transactionErr) => {
            if (transactionErr) {
                console.error('Transaction error:', transactionErr);
                return res.status(500).json({ success: false, message: 'Transaction error.' });
            }

            const updateVehicleQuery = 'UPDATE vehicle SET availability_status = 0 WHERE vehicle_id = ?';
            db.query(updateVehicleQuery, [vehicle_id], (updateErr) => {
                if (updateErr) {
                    console.error('Error updating vehicle availability:', updateErr);
                    return db.rollback(() => {
                        res.status(500).json({ success: false, message: 'Error updating vehicle availability.' });
                    });
                }

                const reservationQuery = `
                    INSERT INTO reservation (vehicle_id, user_id, start_date, end_date, status, Message)
                    VALUES (?, ?, ?, ?, 'Pending', ?)
                `;
                db.query(reservationQuery, [vehicle_id, user_id, start_date, end_date, message], (reservationErr, reservationResult) => {
                    if (reservationErr) {
                        console.error('Error inserting reservation:', reservationErr);
                        return db.rollback(() => {
                            res.status(500).json({ success: false, message: 'Error inserting reservation.' });
                        });
                    }

                    const reservationId = reservationResult.insertId;
                    const paymentQuery = `
                        INSERT INTO payment (reservation_id, amount, payment_date, payment_status)
                        VALUES (?, ?, NULL, 'Pending')
                    `;
                    db.query(paymentQuery, [reservationId, totalAmount], (paymentErr) => {
                        if (paymentErr) {
                            console.error('Error inserting payment:', paymentErr);
                            return db.rollback(() => {
                                res.status(500).json({ success: false, message: 'Error inserting payment.' });
                            });
                        }

                        const historyQuery = `INSERT INTO history (reservation_id, vehicle_id, user_id, start_date, end_date, status, message, reservation_date, refund_status, payment_id, amount, payment_date, payment_status)
                                              SELECT r.reservation_id, r.vehicle_id, r.user_id, r.start_date, r.end_date, r.status, r.message, r.reservation_date, r.refund_status, p.payment_id, p.amount, p.payment_date, p.payment_status
                                              FROM reservation r
                                              LEFT JOIN payment p ON r.reservation_id = p.reservation_id
                                              WHERE r.reservation_id = ?`;

                        db.query(historyQuery, [reservationId], (historyErr) => {
                            if (historyErr) {
                                console.error('Error updating history table:', historyErr);
                                return db.rollback(() => {
                                    res.status(500).json({ success: false, message: 'Error updating history table.' });
                                });
                            }

                            db.commit((commitErr) => {
                                if (commitErr) {
                                    console.error('Error committing transaction:', commitErr);
                                    return db.rollback(() => {
                                        res.status(500).json({ success: false, message: 'Error committing transaction.' });
                                    });
                                }

                                res.json({ success: true, message: 'Booking successful.' });
                            });
                        });
                    });
                });
            });
        });
    });
});

router.get('/vehicles', (req, res) => {
    const { sort = 'brandModelAsc', available = false, search = '' } = req.query;

    let sortColumn, sortOrder;
    switch (sort) {
        case 'brandModelAsc':
            sortColumn = 'CONCAT(brand, model)';
            sortOrder = 'ASC';
            break;
        case 'brandModelDesc':
            sortColumn = 'CONCAT(brand, model)';
            sortOrder = 'DESC';
            break;
        case 'yearAsc':
            sortColumn = 'year';
            sortOrder = 'ASC';
            break;
        case 'yearDesc':
            sortColumn = 'year';
            sortOrder = 'DESC';
            break;
        case 'capacityAsc':
            sortColumn = 'capacity';
            sortOrder = 'ASC';
            break;
        case 'capacityDesc':
            sortColumn = 'capacity';
            sortOrder = 'DESC';
            break;
        case 'priceAsc':
            sortColumn = 'price_per_day';
            sortOrder = 'ASC';
            break;
        case 'priceDesc':
            sortColumn = 'price_per_day';
            sortOrder = 'DESC';
            break;
        case 'comfortAsc':
            sortColumn = 'comfort_quality';
            sortOrder = 'ASC';
            break;
        case 'comfortDesc':
            sortColumn = 'comfort_quality';
            sortOrder = 'DESC';
            break;
        case 'mileageAsc':
            sortColumn = 'mileage';
            sortOrder = 'ASC';
            break;
        case 'mileageDesc':
            sortColumn = 'mileage';
            sortOrder = 'DESC';
            break;
        default:
            sortColumn = 'CONCAT(brand, model)';
            sortOrder = 'ASC';
    }
    
    let whereClauses = [];
    if (available === 'true') {
        whereClauses.push("availability_status = '1'");
    }
    if (search && search.trim() !== '') {
        whereClauses.push(`(LOWER(brand) LIKE '%${search.toLowerCase()}%' OR LOWER(model) LIKE '%${search.toLowerCase()}%' OR LOWER(CONCAT(brand, ' ', model)) LIKE '%${search.toLowerCase()}%')`);
    }
    let whereSQL = '';
    if (whereClauses.length > 0) {
        whereSQL = 'WHERE ' + whereClauses.join(' AND ');
    }
    const query = `
        SELECT vehicle_id, brand, model, year, capacity, price_per_day, comfort_quality, mileage, availability_status 
        FROM vehicle 
        ${whereSQL}
        ORDER BY ${sortColumn} ${sortOrder}
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json(results);
    });
});

router.get("/get-user-reservations/:userId", (req, res) => {
    const { userId } = req.params;

    const pendingQuery = `
        SELECT r.reservation_id, CONCAT(v.brand, ' ', v.model) AS vehicle, r.start_date, r.end_date, r.Message, r.refund_status
        FROM reservation r
        INNER JOIN vehicle v ON r.vehicle_id = v.vehicle_id
        WHERE r.user_id = ? AND r.status = 'Pending'
    `;

    const confirmedQuery = `
        SELECT r.reservation_id, CONCAT(v.brand, ' ', v.model) AS vehicle, r.start_date, r.end_date, r.Message, p.amount, p.payment_status
        FROM reservation r
        INNER JOIN vehicle v ON r.vehicle_id = v.vehicle_id
        INNER JOIN payment p ON r.reservation_id = p.reservation_id
        WHERE r.user_id = ? AND r.status = 'Confirmed'
    `;

    const summaryQuery = `
        SELECT 
            COUNT(*) AS totalReservations,
            SUM(CASE WHEN r.status = 'Pending' THEN 1 ELSE 0 END) AS pendingReservations,
            SUM(CASE WHEN r.status = 'Confirmed' THEN 1 ELSE 0 END) AS confirmedReservations,
            SUM(p.amount) AS totalAmount
        FROM reservation r
        LEFT JOIN payment p ON r.reservation_id = p.reservation_id
        WHERE r.user_id = ?
    `;

    db.query(pendingQuery, [userId], (err, pending) => {
        if (err) return res.status(500).json({ error: "Failed to fetch pending reservations" });

        db.query(confirmedQuery, [userId], (err, confirmed) => {
            if (err) return res.status(500).json({ error: "Failed to fetch confirmed reservations" });

            db.query(summaryQuery, [userId], (err, summary) => {
                if (err) return res.status(500).json({ error: "Failed to fetch summary" });

                res.status(200).json({
                    pending,
                    confirmed,
                    summary: summary[0],
                });
            });
        });
    });
});

router.post("/update-payment-status/:reservationId", (req, res) => {
    const { reservationId } = req.params;

    const query1 = `UPDATE payment SET payment_status = 'Completed', payment_date = CURDATE() WHERE reservation_id = ?`;
    const query2 = `UPDATE history SET payment_status = 'Completed', payment_date = CURDATE() WHERE reservation_id = ?`;

    db.query(query1, [reservationId], (err1) => {
        if (err1) return res.status(500).json({ error: "Failed to update payment table" });

        db.query(query2, [reservationId], (err2) => {
            if (err2) return res.status(500).json({ error: "Failed to update history table" });

            res.status(200).send("Payment status updated successfully in both tables");
        });
    });
});


router.get("/getReservations", (req, res) => {
    const userID = req.query.user_id;
    const query = `
        SELECT v.vehicle_id, v.brand, v.model 
        FROM reservation r 
        JOIN vehicle v ON r.vehicle_id = v.vehicle_id 
        WHERE r.user_id = ? AND r.status = 'Confirmed'
    `;

    db.query(query, [userID], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

router.post("/submitFeedback", (req, res) => {
    const { user_id, vehicle_id, rating, comments } = req.body;

    const validateQuery = "SELECT 1 FROM vehicle WHERE vehicle_id = ?";
    db.query(validateQuery, [vehicle_id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.json({ success: false, message: "Invalid vehicle." });

        const insertQuery = `
            INSERT INTO feedback (vehicle_id, user_id, rating, comments, feedback_date, read_status) 
            VALUES (?, ?, ?, ?, CURDATE(), 'Unread')
        `;
        db.query(insertQuery, [vehicle_id, user_id, rating, comments], err => {
            if (err) return res.status(500).send(err);
            res.json({ success: true });
        });
    });
});

// Refund request by user
router.post('/request-refund/:reservationId', (req, res) => {
    const { reservationId } = req.params;
    // Only allow refund if not already requested
    const updateQuery = `UPDATE reservation SET refund_status = 'In Process' WHERE reservation_id = ? AND (refund_status IS NULL OR refund_status = '')`;
    db.query(updateQuery, [reservationId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error.' });
        if (result.affectedRows === 0) {
            return res.json({ success: false, message: 'Refund already requested or reservation not found.' });
        }
        res.json({ success: true, message: 'Refund request submitted.' });
    });
});

module.exports = router;
