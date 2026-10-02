
const API = "http://localhost:3000/api";

let students = [];
let companies = [];
let applications = [];

const $ = (id) => document.getElementById(id);

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed.");
    }

    return data;
}

function message(id, text, error = false) {
    $(id).textContent = text;
    $(id).style.color = error ? "red" : "green";
}

function createCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "-";
    row.appendChild(cell);
    return cell;
}

function createButton(text, className, handler) {
    const button = document.createElement("button");
    button.textContent = text;
    button.className = className;
    button.type = "button";
    button.addEventListener("click", handler);
    return button;
}

function addActions(row, buttons) {
    const cell = document.createElement("td");
    buttons.forEach((button) => cell.appendChild(button));
    row.appendChild(cell);
}

// =====================
// STUDENTS
// =====================

function renderStudents() {
    $("studentTableBody").replaceChildren();

    students.forEach((student) => {
        const row = document.createElement("tr");

        [
            student.id,
            student.name,
            student.email,
            student.branch,
            Number(student.cgpa).toFixed(2)
        ].forEach((value) => createCell(row, value));

        addActions(row, [
            createButton("Edit", "edit-btn", () => editStudent(student.id)),
            createButton("Delete", "delete-btn", () => deleteStudent(student.id))
        ]);

        $("studentTableBody").appendChild(row);
    });

    $("studentCount").textContent = students.length;
    renderApplicationOptions();
}

function editStudent(id) {
    const student = students.find((item) => item.id === id);
    if (!student) return;

    $("studentId").value = student.id;
    $("name").value = student.name;
    $("email").value = student.email;
    $("branch").value = student.branch;
    $("cgpa").value = student.cgpa;
    $("submitBtn").textContent = "Update Student";

    message("studentMessage", "Edit the details and submit the form.");
    $("studentForm").scrollIntoView({ behavior: "smooth" });
}

async function deleteStudent(id) {
    if (!confirm("Delete this student?")) return;

    try {
        const result = await apiRequest(`/students/${id}`, {
            method: "DELETE"
        });

        message("studentMessage", result.message);
        await loadStudents();
        await loadApplications();
    } catch (error) {
        message("studentMessage", error.message, true);
    }
}

$("studentForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = $("studentId").value;
    const student = {
        name: $("name").value.trim(),
        email: $("email").value.trim(),
        branch: $("branch").value.trim(),
        cgpa: $("cgpa").value
    };

    try {
        const result = await apiRequest(
            id ? `/students/${id}` : "/students",
            {
                method: id ? "PUT" : "POST",
                body: JSON.stringify(student)
            }
        );

        $("studentForm").reset();
        $("studentId").value = "";
        $("submitBtn").textContent = "Add Student";

        message("studentMessage", result.message);
        await loadStudents();
    } catch (error) {
        message("studentMessage", error.message, true);
    }
});

async function loadStudents() {
    try {
        students = await apiRequest("/students");
        renderStudents();
    } catch (error) {
        message("studentMessage", error.message, true);
    }
}

// =====================
// COMPANIES
// =====================

function renderCompanies() {
    $("companyTableBody").replaceChildren();

    companies.forEach((company) => {
        const row = document.createElement("tr");

        [
            company.id,
            company.name,
            company.role,
            company.package_lpa == null
                ? "-"
                : Number(company.package_lpa).toFixed(2),
            company.location || "-"
        ].forEach((value) => createCell(row, value));

        addActions(row, [
            createButton("Edit", "edit-btn", () => editCompany(company.id)),
            createButton("Delete", "delete-btn", () => deleteCompany(company.id))
        ]);

        $("companyTableBody").appendChild(row);
    });

    $("companyCount").textContent = companies.length;
    renderApplicationOptions();
}

function editCompany(id) {
    const company = companies.find((item) => item.id === id);
    if (!company) return;

    $("companyId").value = company.id;
    $("companyName").value = company.name;
    $("companyRole").value = company.role;
    $("companyPackage").value = company.package_lpa ?? "";
    $("companyLocation").value = company.location ?? "";
    $("companySubmitBtn").textContent = "Update Company";

    message("companyMessage", "Edit the details and submit the form.");
    $("companyForm").scrollIntoView({ behavior: "smooth" });
}

async function deleteCompany(id) {
    if (!confirm("Delete this company?")) return;

    try {
        const result = await apiRequest(`/companies/${id}`, {
            method: "DELETE"
        });

        message("companyMessage", result.message);
        await loadCompanies();
        await loadApplications();
    } catch (error) {
        message("companyMessage", error.message, true);
    }
}

$("companyForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = $("companyId").value;
    const company = {
        name: $("companyName").value.trim(),
        role: $("companyRole").value.trim(),
        package_lpa: $("companyPackage").value,
        location: $("companyLocation").value.trim()
    };

    try {
        const result = await apiRequest(
            id ? `/companies/${id}` : "/companies",
            {
                method: id ? "PUT" : "POST",
                body: JSON.stringify(company)
            }
        );

        $("companyForm").reset();
        $("companyId").value = "";
        $("companySubmitBtn").textContent = "Add Company";

        message("companyMessage", result.message);
        await loadCompanies();
    } catch (error) {
        message("companyMessage", error.message, true);
    }
});

async function loadCompanies() {
    try {
        companies = await apiRequest("/companies");
        renderCompanies();
    } catch (error) {
        message("companyMessage", error.message, true);
    }
}

// =====================
// APPLICATIONS
// =====================

function renderApplicationOptions() {
    const studentSelect = $("applicationStudent");
    const companySelect = $("applicationCompany");

    const selectedStudent = studentSelect.value;
    const selectedCompany = companySelect.value;

    studentSelect.replaceChildren();
    companySelect.replaceChildren();

    const studentPlaceholder = document.createElement("option");
    studentPlaceholder.value = "";
    studentPlaceholder.textContent = "Select Student";
    studentSelect.appendChild(studentPlaceholder);

    students.forEach((student) => {
        const option = document.createElement("option");
        option.value = student.id;
        option.textContent = `${student.name} (${student.branch})`;
        studentSelect.appendChild(option);
    });

    const companyPlaceholder = document.createElement("option");
    companyPlaceholder.value = "";
    companyPlaceholder.textContent = "Select Company";
    companySelect.appendChild(companyPlaceholder);

    companies.forEach((company) => {
        const option = document.createElement("option");
        option.value = company.id;
        option.textContent = `${company.name} — ${company.role}`;
        companySelect.appendChild(option);
    });

    if (students.some((s) => String(s.id) === selectedStudent)) {
        studentSelect.value = selectedStudent;
    }

    if (companies.some((c) => String(c.id) === selectedCompany)) {
        companySelect.value = selectedCompany;
    }
}

function renderApplications() {
    $("applicationTableBody").replaceChildren();

    applications.forEach((application) => {
        const row = document.createElement("tr");

        [
            
    application.id,
    application.student_name,
    application.company_name,
    application.role,
    application.applied_at
        ? new Date(application.applied_at).toLocaleString()
        : "-"

        ].forEach((value) => createCell(row, value));

        const statusCell = document.createElement("td");
        const statusSelect = document.createElement("select");

        ["Applied", "Shortlisted", "Interview", "Selected", "Rejected"]
            .forEach((status) => {
                const option = document.createElement("option");
                option.value = status;
                option.textContent = status;
                statusSelect.appendChild(option);
            });

        statusSelect.value = application.status;

        statusSelect.addEventListener("change", async () => {
            statusSelect.disabled = true;

            try {
                const result = await apiRequest(
                    `/applications/${application.id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify({ status: statusSelect.value })
                    }
                );

                message("applicationMessage", result.message);
                await loadApplications();
            } catch (error) {
                message("applicationMessage", error.message, true);
                statusSelect.value = application.status;
            } finally {
                statusSelect.disabled = false;
            }
        });

        statusCell.appendChild(statusSelect);
        row.appendChild(statusCell);

        addActions(row, [
            createButton("Delete", "delete-btn", () =>
                deleteApplication(application.id)
            )
        ]);

        $("applicationTableBody").appendChild(row);
    });

    $("applicationCount").textContent = applications.length;
}

$("applicationForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const student_id = $("applicationStudent").value;
    const company_id = $("applicationCompany").value;

    if (!student_id || !company_id) {
        message("applicationMessage", "Select both a student and a company.", true);
        return;
    }

    try {
        const result = await apiRequest("/applications", {
            method: "POST",
            body: JSON.stringify({
                student_id: Number(student_id),
                company_id: Number(company_id)
            })
        });

        message("applicationMessage", result.message);
        $("applicationForm").reset();
        renderApplicationOptions();
        await loadApplications();
    } catch (error) {
        message("applicationMessage", error.message, true);
    }
});

async function deleteApplication(id) {
    if (!confirm("Delete this application?")) return;

    try {
        const result = await apiRequest(`/applications/${id}`, {
            method: "DELETE"
        });

        message("applicationMessage", result.message);
        await loadApplications();
    } catch (error) {
        message("applicationMessage", error.message, true);
    }
}

async function loadApplications() {
    try {
        applications = await apiRequest("/applications");
        renderApplications();
    } catch (error) {
        message("applicationMessage", error.message, true);
    }
}

// =====================
// INITIALIZE DASHBOARD
// =====================

async function initializeApp() {
    await Promise.all([
        loadStudents(),
        loadCompanies()
    ]);

    await loadApplications();
}

initializeApp();