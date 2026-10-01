import { useState, useEffect } from "react";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [certificateTitle, setCertificateTitle] = useState("");
  const [certificateType, setCertificateType] = useState("");
  const [issuingOrganization, setIssuingOrganization] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [certificateFile, setCertificateFile] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");

  const fetchStudents = async (token) => {
  try {
    const response = await fetch("http://localhost:5000/students", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    console.log("Students response:", data);

    if (data.success) {
      setStudents(data.students);
    } else {
      console.error(data.message);
    }
  } catch (error) {
    console.error("Error fetching students:", error);
  }
};

const fetchAllCertificates = async (token) => {
  try {
    const response = await fetch(
      "http://localhost:5000/certificates",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("All certificates response:", data);

    if (data.success) {
      setCertificates(data.certificates);
    } else {
      console.error(data.message);
    }
  } catch (error) {
    console.error("Error fetching all certificates:", error);
  }
};

const fetchCertificates = async (studentId, token) => {
  try {
    const response = await fetch(
      `http://localhost:5000/certificates/student/${studentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("Certificates response:", data);

    if (data.success) {
      setCertificates(data.certificates);
    } else {
      console.error(data.message);
    }
  } catch (error) {
    console.error("Error fetching certificates:", error);
  }
};

  useEffect(() => {
  const savedUser = localStorage.getItem("user");
  const savedToken = localStorage.getItem("token");

  if (savedUser && savedToken) {
    const parsedUser = JSON.parse(savedUser);

    setUser(parsedUser);

    if (parsedUser.role === "admin") {
      fetchStudents(savedToken);
    }
  }
}, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      console.log("Login response:", data);

      if (data.success) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.student));

  setUser(data.student);

  if (data.student.role === "admin") {
  setActiveSection("admin-dashboard");
  fetchStudents(data.token);
  fetchAllCertificates(data.token);
} else {
  fetchCertificates(data.student.id, data.token);
}

  alert("Login successful!");
} else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to server");
    }
  };

const handleCertificateUpload = async () => {
  console.log("Upload button clicked");

  const token = localStorage.getItem("token");

  console.log("Token available:", !!token);

  const formData = new FormData();

  formData.append("studentId", selectedStudent?._id || "");
  formData.append("title", certificateTitle);
  formData.append("certificateType", certificateType);
  formData.append("issuingOrganization", issuingOrganization);
  formData.append("issueDate", issueDate);
  formData.append("certificate", certificateFile);

  console.log("FormData created successfully");

  const response = await fetch(
    "http://localhost:5000/certificates",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await response.json();

  console.log("Upload response:", data);

  if (data.success) {
    setCertificates((prevCertificates) => [
      data.certificate,
      ...prevCertificates,
    ]);
  }
};
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f4f6f8",
        fontFamily: "Arial",
      }}
    >
      {user ? (
        user.role === "student" ? (
          // =========================
          // STUDENT DASHBOARD
          // =========================
          <div
            style={{
              width: "500px",
              padding: "30px",
              backgroundColor: "white",
              borderRadius: "10px",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h1>SannrVault</h1>

            <h2>Student Dashboard</h2>

            <div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    marginBottom: "20px",
  }}
>
  <button
    onClick={() => setActiveSection("dashboard")}
    style={{
      flex: 1,
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      backgroundColor:
        activeSection === "dashboard" ? "#222" : "#ddd",
      color: activeSection === "dashboard" ? "white" : "#222",
    }}
  >
    Dashboard
  </button>

  <button
    onClick={() => setActiveSection("profile")}
    style={{
      flex: 1,
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      backgroundColor:
        activeSection === "profile" ? "#222" : "#ddd",
      color: activeSection === "profile" ? "white" : "#222",
    }}
  >
    Profile
  </button>

  <button
    onClick={() => setActiveSection("vault")}
    style={{
      flex: 1,
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      backgroundColor:
        activeSection === "vault" ? "#222" : "#ddd",
      color: activeSection === "vault" ? "white" : "#222",
    }}
  >
    Vault
  </button>
</div>

            {activeSection === "dashboard" && (
  <div>
    <p>
      Welcome, <strong>{user.name}</strong>
    </p>

    <hr />

    <h3>Student Information</h3>

    <p>
      <strong>Name:</strong> {user.name}
    </p>

    <p>
      <strong>USN:</strong> {user.usn}
    </p>

    <p>
      <strong>Email:</strong> {user.email}
    </p>

    <p>
      <strong>Department:</strong> {user.department}
    </p>

    <p>
      <strong>Semester:</strong> {user.semester}
    </p>

    <p>
      <strong>Role:</strong> {user.role}
    </p>
  </div>
)}

{activeSection === "profile" && (
  <div>
    <h3>My Profile</h3>

    <p>
      <strong>Name:</strong> {user.name}
    </p>

    <p>
      <strong>USN:</strong> {user.usn}
    </p>

    <p>
      <strong>Email:</strong> {user.email}
    </p>

    <p>
      <strong>Department:</strong> {user.department}
    </p>

    <p>
      <strong>Semester:</strong> {user.semester}
    </p>
  </div>
)}

{activeSection === "vault" && (
  <div>
    <h3>Credential Vault</h3>

    <div
      style={{
        marginTop: "15px",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fafafa",
      }}
    >
      <h4 style={{ marginTop: "0" }}>My Certificates</h4>

      {certificates.length === 0 ? (
  <>
    <p style={{ color: "#666" }}>
      You don't have any academic certificates yet.
    </p>

    <p style={{ color: "#888", fontSize: "14px" }}>
      Certificates issued by your institution will appear here.
    </p>
  </>
) : (
  certificates.map((certificate) => (
    <div
      key={certificate._id}
      style={{
        marginTop: "15px",
        padding: "15px",
        backgroundColor: "white",
        border: "1px solid #ddd",
        borderRadius: "6px",
      }}
    >
      <h4>{certificate.title}</h4>

      <p>
        <strong>Type:</strong> {certificate.certificateType}
      </p>

      <p>
        <strong>Issued By:</strong> {certificate.issuingOrganization}
      </p>

      <p>
        <strong>Issue Date:</strong>{" "}
        {new Date(certificate.issueDate).toLocaleDateString()}
      </p>

      <p>
        <strong>Status:</strong> {certificate.status}
      </p>

      <a
  href={`http://localhost:5000/${certificate.filePath.replace(/\\/g, "/")}`}
  target="_blank"
  rel="noopener noreferrer"
>
  View Certificate
</a>

    </div>
  ))
)}
    </div>
  </div>
)}
            <button
  onClick={() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }}
  style={{
    marginTop: "20px",
    width: "100%",
    padding: "12px",
    backgroundColor: "#c62828",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  }}
>
  Logout
</button>
          </div>
        ) : (
          // =========================
          // ADMIN DASHBOARD
          // =========================
          <div
            style={{
              width: "500px",
              padding: "30px",
              backgroundColor: "white",
              borderRadius: "10px",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h1>SannrVault</h1>

            <h2>Admin Dashboard</h2>

            <div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    marginBottom: "20px",
  }}
>
  <button
    onClick={() => setActiveSection("admin-dashboard")}
    style={{
      flex: 1,
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      backgroundColor:
        activeSection === "admin-dashboard" ? "#222" : "#ddd",
      color:
        activeSection === "admin-dashboard" ? "white" : "#222",
    }}
  >
    Dashboard
  </button>

  <button
    onClick={() => setActiveSection("students")}
    style={{
      flex: 1,
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      backgroundColor:
        activeSection === "students" ? "#222" : "#ddd",
      color:
        activeSection === "students" ? "white" : "#222",
    }}
  >
    Students
  </button>

  <button
    onClick={() => setActiveSection("admin-certificates")}
    style={{
      flex: 1,
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      backgroundColor:
        activeSection === "admin-certificates" ? "#222" : "#ddd",
      color:
        activeSection === "admin-certificates" ? "white" : "#222",
    }}
  >
    Certificates
  </button>
</div>

            {activeSection === "admin-dashboard" && (
  <div>
    <p>
      Welcome, <strong>{user.name}</strong>
    </p>

    <hr />

    <h3>Students</h3>

<h3>Certificate Upload</h3>

<label>Select Student:</label>

<select
  value={selectedStudent?._id || ""}
  onChange={(e) => {
    const student = students.find(
      (student) => student._id === e.target.value
    );

    setSelectedStudent(student || null);
  }}
>
  <option value="">-- Select Student --</option>

  {students.map((student) => (
    <option key={student._id} value={student._id}>
      {student.name} — {student.usn}
    </option>
  ))}
</select>

<br />

<label>Certificate Title:</label>

<input
  type="text"
  placeholder="Enter certificate title"
  value={certificateTitle}
  onChange={(e) => setCertificateTitle(e.target.value)}
/>

<br />

<label>Certificate Type:</label>

<input
  type="text"
  placeholder="Enter certificate type"
  value={certificateType}
  onChange={(e) => setCertificateType(e.target.value)}
/>

<br />

<label>Issuing Organization:</label>

<input
  type="text"
  placeholder="Enter issuing organization"
  value={issuingOrganization}
  onChange={(e) => setIssuingOrganization(e.target.value)}
/>

<br />

<label>Issue Date:</label>

<input
  type="date"
  value={issueDate}
  onChange={(e) => setIssueDate(e.target.value)}
/>

<br />

<label>Certificate File:</label>

<input
  type="file"
  accept=".pdf"
  onChange={(e) => setCertificateFile(e.target.files[0])}
/>

<br />

<button onClick={handleCertificateUpload}>
  Upload Certificate
</button>

<h3>Certificate Management</h3>

{certificates.length === 0 ? (
  <p>No certificates found.</p>
) : (
  <div>
    {certificates.map((certificate) => (
      <div key={certificate._id}>
        <p>
          <strong>Student:</strong>{" "}
          {certificate.student?.name} ({certificate.student?.usn})
        </p>

        <p>
          <strong>Certificate:</strong> {certificate.title}
        </p>

        <p>
          <strong>Type:</strong> {certificate.certificateType}
        </p>

        <p>
          <strong>Issued By:</strong> {certificate.issuingOrganization}
        </p>

        <p>
          <strong>Issue Date:</strong>{" "}
          {new Date(certificate.issueDate).toLocaleDateString()}
        </p>

        <p>
          <strong>Status:</strong> {certificate.status}
        </p>

        <a
          href={`http://localhost:5000/${certificate.filePath.replace(/\\/g, "/")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Certificate
        </a>

        <hr />
      </div>
    ))}
  </div>
)}

    <h3>Administrator Information</h3>

    <p>
      <strong>Name:</strong> {user.name}
    </p>

    <p>
      <strong>Email:</strong> {user.email}
    </p>

    <p>
      <strong>Department:</strong> {user.department}
    </p>

    <p>
      <strong>Role:</strong> {user.role}
    </p>
  </div>
)}

{activeSection === "students" && (
  <div>
    <h3>Student Management</h3>

    <div
      style={{
        marginTop: "15px",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fafafa",
      }}
    >
      <h4 style={{ marginTop: "0" }}>Registered Students</h4>

      {students.length === 0 ? (
        <p style={{ color: "#666" }}>
          No students registered yet.
        </p>
      ) : (
        students.map((student) => (
          <div
            key={student._id}
            style={{
              marginTop: "15px",
              padding: "15px",
              backgroundColor: "white",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
          >
            <p>
              <strong>Name:</strong> {student.name}
            </p>

            <p>
              <strong>USN:</strong> {student.usn}
            </p>

            <p>
              <strong>Email:</strong> {student.email}
            </p>

            <p>
              <strong>Department:</strong> {student.department}
            </p>

            <p>
              <strong>Semester:</strong> {student.semester}
            </p>

            <button
              onClick={() => {
                setSelectedStudent(student);
              }}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "10px",
                backgroundColor: "#222",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Manage Credentials
            </button>
          </div>
        ))
      )}

      {selectedStudent && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#e8f5e9",
            border: "1px solid #c8e6c9",
            borderRadius: "6px",
          }}
        >
          <h4>Selected Student</h4>

          <p>
            <strong>Name:</strong> {selectedStudent.name}
          </p>

          <p>
            <strong>USN:</strong> {selectedStudent.usn}
          </p>

          <p>
            <strong>Email:</strong> {selectedStudent.email}
          </p>

          <p>
            You can now manage this student's academic credentials.
          </p>
        </div>
      )}
    </div>
  </div>
)}

{activeSection === "admin-certificates" && (
  <div>
    <h3>Certificate Management</h3>

    <div
      style={{
        marginTop: "15px",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fafafa",
      }}
    >
      <h4 style={{ marginTop: "0" }}>
        Academic Certificates
      </h4>

      <p style={{ color: "#666" }}>
        Certificate management will be available here.
      </p>

      <p style={{ color: "#888", fontSize: "14px" }}>
        Administrators will be able to issue and manage
        academic credentials for students.
      </p>
    </div>
  </div>
)}
            <button
  onClick={() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }}
  style={{
    marginTop: "20px",
    width: "100%",
    padding: "12px",
    backgroundColor: "#c62828",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  }}
>
  Logout
</button>
          </div>
        )
      ) : (
        // =========================
        // LOGIN PAGE
        // =========================
        <div
          style={{
            width: "380px",
            padding: "30px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h1 style={{ textAlign: "center" }}>SannrVault</h1>

          <p
            style={{
              textAlign: "center",
              color: "#666",
            }}
          >
            Academic Credential Verification System
          </p>

          <hr />

          <h2>Login</h2>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "15px" }}>
              <label>Email</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label>Password</label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#222",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;