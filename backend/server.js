const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,

  ssl: {
    ca: fs.readFileSync(path.join(__dirname, "ca.pem")),
    rejectUnauthorized: true
  },

  waitForConnections: true,
  connectionLimit: 10
});

// Test route
app.get("/", (req, res) => {
    res.send("Student Placement Management System API is running!");
});

// Get all students
app.get("/api/students", async (req, res) => {
    try {
        const [students] = await pool.query(
            "SELECT * FROM students ORDER BY id DESC"
        );
        res.json(students);
    } catch (err) {
  console.error("Fetch students error:", err);
  res.status(500).json({
    message: "Failed to fetch students."
  });
}
});

// Add a student
app.post("/api/students", async (req, res) => {
    try {
        const { name, email, branch, cgpa } = req.body;
        const score = Number(cgpa);

        if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof branch !== "string" || !branch.trim() ||
            cgpa === undefined || cgpa === null || cgpa === "" ||
            !Number.isFinite(score) || score < 0 || score > 10
        ) {
            return res.status(400).json({
                message: "Enter valid name, email, branch and CGPA (0–10)."
            });
        }

        const [result] = await pool.execute(
            "INSERT INTO students (name, email, branch, cgpa) VALUES (?, ?, ?, ?)",
            [name.trim(), email.trim(), branch.trim(), score]
        );

        res.status(201).json({
            message: "Student added successfully.",
            id: result.insertId
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }
        console.error(error.message);
        res.status(500).json({ message: "Failed to add student." });
    }
});

// Update a student
app.put("/api/students/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, email, branch, cgpa } = req.body;
        const score = Number(cgpa);

        if (
            !Number.isInteger(id) || id < 1 ||
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof branch !== "string" || !branch.trim() ||
            cgpa === undefined || cgpa === null || cgpa === "" ||
            !Number.isFinite(score) || score < 0 || score > 10
        ) {
            return res.status(400).json({
                message: "Enter valid student details."
            });
        }

        const [result] = await pool.execute(
            "UPDATE students SET name = ?, email = ?, branch = ?, cgpa = ? WHERE id = ?",
            [name.trim(), email.trim(), branch.trim(), score, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Student not found." });
        }

        res.json({ message: "Student updated successfully." });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }
        console.error(error.message);
        res.status(500).json({ message: "Failed to update student." });
    }
});

// Delete a student
app.delete("/api/students/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ message: "Invalid student ID." });
        }

        const [result] = await pool.execute(
            "DELETE FROM students WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Student not found." });
        }

        res.json({ message: "Student deleted successfully." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to delete student. Check whether applications reference this student."
        });
    }
});

// Database connection test
app.get("/api/db-test", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ message: "MySQL connected successfully!" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Database connection failed." });
    }
});

/* =========================
   COMPANY MANAGEMENT APIs
========================= */

// Get all companies
app.get("/api/companies", async (req, res) => {
    try {
        const [companies] = await pool.query(
            "SELECT * FROM companies ORDER BY id DESC"
        );
        res.json(companies);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Failed to fetch companies." });
    }
});

// Add a company
app.post("/api/companies", async (req, res) => {
    try {
        const { name, role, package_lpa, location } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof role !== "string" || !role.trim()
        ) {
            return res.status(400).json({
                message: "Company name and job role are required."
            });
        }

        let salary = null;

        if (package_lpa !== undefined && package_lpa !== null && package_lpa !== "") {
            salary = Number(package_lpa);

            if (!Number.isFinite(salary) || salary < 0) {
                return res.status(400).json({
                    message: "Enter a valid package in LPA."
                });
            }
        }

        if (location != null && typeof location !== "string") {
            return res.status(400).json({ message: "Invalid location." });
        }

        const [result] = await pool.execute(
            `INSERT INTO companies (name, role, package_lpa, location)
             VALUES (?, ?, ?, ?)`,
            [name.trim(), role.trim(), salary, location?.trim() || null]
        );

        res.status(201).json({
            message: "Company added successfully.",
            id: result.insertId
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Failed to add company." });
    }
});

// Update a company
app.put("/api/companies/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, role, package_lpa, location } = req.body;

        if (
            !Number.isInteger(id) || id < 1 ||
            typeof name !== "string" || !name.trim() ||
            typeof role !== "string" || !role.trim()
        ) {
            return res.status(400).json({
                message: "Enter a valid company ID, name and role."
            });
        }

        let salary = null;

        if (package_lpa !== undefined && package_lpa !== null && package_lpa !== "") {
            salary = Number(package_lpa);

            if (!Number.isFinite(salary) || salary < 0) {
                return res.status(400).json({
                    message: "Enter a valid package in LPA."
                });
            }
        }

        if (location != null && typeof location !== "string") {
            return res.status(400).json({ message: "Invalid location." });
        }

        const [result] = await pool.execute(
            `UPDATE companies
             SET name = ?, role = ?, package_lpa = ?, location = ?
             WHERE id = ?`,
            [name.trim(), role.trim(), salary, location?.trim() || null, id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ message: "Company not found." });
        }

        res.json({ message: "Company updated successfully." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Failed to update company." });
    }
});

// Delete a company
app.delete("/api/companies/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ message: "Invalid company ID." });
        }

        const [result] = await pool.execute(
            "DELETE FROM companies WHERE id = ?",
            [id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ message: "Company not found." });
        }

        res.json({ message: "Company deleted successfully." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Could not delete company. It may have existing applications."
        });
    }
});


/* =========================
   PLACEMENT APPLICATION APIs
========================= */

// Get applications with student and company details
app.get("/api/applications", async (req, res) => {
    try {
        const [applications] = await pool.query(`
            SELECT
                a.id,
                a.student_id,
                a.company_id,
                s.name AS student_name,
                c.name AS company_name,
                c.role,
                a.status,
                a.applied_at
            FROM applications a
            JOIN students s ON a.student_id = s.id
            JOIN companies c ON a.company_id = c.id
            ORDER BY a.id DESC
        `);

        res.json(applications);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to fetch applications."
        });
    }
});

// Add an application
app.post("/api/applications", async (req, res) => {
    try {
        const studentId = Number(req.body.student_id);
        const companyId = Number(req.body.company_id);

        if (
            !Number.isInteger(studentId) || studentId < 1 ||
            !Number.isInteger(companyId) || companyId < 1
        ) {
            return res.status(400).json({
                message: "Select a valid student and company."
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO applications (student_id, company_id)
             VALUES (?, ?)`,
            [studentId, companyId]
        );

        res.status(201).json({
            message: "Application created successfully.",
            id: result.insertId
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This student has already applied to this company."
            });
        }

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                message: "The selected student or company does not exist."
            });
        }

        console.error(error.message);
        res.status(500).json({
            message: "Failed to create application."
        });
    }
});

// Update application status
app.put("/api/applications/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;

        const allowedStatuses = [
            "Applied",
            "Shortlisted",
            "Interview",
            "Selected",
            "Rejected"
        ];

        if (
            !Number.isInteger(id) || id < 1 ||
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                message: "Enter a valid application ID and status."
            });
        }

        const [result] = await pool.execute(
            "UPDATE applications SET status = ? WHERE id = ?",
            [status, id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({
                message: "Application not found."
            });
        }

        res.json({ message: "Application status updated successfully." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to update application status."
        });
    }
});

// Delete an application
app.delete("/api/applications/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                message: "Invalid application ID."
            });
        }

        const [result] = await pool.execute(
            "DELETE FROM applications WHERE id = ?",
            [id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({
                message: "Application not found."
            });
        }

        res.json({ message: "Application deleted successfully." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to delete application."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});