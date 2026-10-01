const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const User = require("./models/User");
const Certificate = require("./models/Certificate");
const fs = require("fs");

const JWT_SECRET = "sannrvault_super_secret_key";

const app = express();

app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + file.originalname;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
});

mongoose
  .connect("mongodb://127.0.0.1:27017/sannrvault")
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });

app.use(cors());
app.use(express.json());

// JWT AUTHENTICATION MIDDLEWARE
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = user;
    next();
  });
}

// STUDENT SIGNUP API
app.post("/signup", async (req, res) => {
  try {
    const {
      name,
      usn,
      email,
      password,
      department,
      semester,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !usn ||
      !email ||
      !password ||
      !department ||
      !semester
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if USN already exists
    const existingUSN = await User.findOne({ usn });

    if (existingUSN) {
      return res.status(409).json({
        success: false,
        message: "USN already registered",
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = await User.create({
      name,
      usn,
      email,
      password: hashedPassword,
      department,
      semester,
      role: "student",
    });

    // Return safe response
    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      student: {
        id: student._id,
        name: student.name,
        usn: student.usn,
        email: student.email,
        department: student.department,
        semester: student.semester,
        role: student.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
});


// HOME ROUTE
app.get("/", (req, res) => {
  res.send("SannrVault Backend Running");
});


// LOGIN API
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }


    // Find student by email
    const student = await User.findOne({ email });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password with stored bcrypt hash
    const passwordMatch = await bcrypt.compare(
      password,
      student.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
  {
    id: student._id,
    role: student.role,
  },
  JWT_SECRET,
  {
    expiresIn: "1h",
  }
);

// Login successful
res.status(200).json({
  success: true,
  message: "Login successful",
  token,
  student: {
    id: student._id,
    name: student.name,
    usn: student.usn,
    email: student.email,
    department: student.department,
    semester: student.semester,
    role: student.role,
  },
});
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// PROTECTED PROFILE API
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
});



// ROLE-BASED AUTHORIZATION MIDDLEWARE
function authorizeRole(requiredRole) {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
}

app.get(
  "/students",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const students = await User.find(
        { role: "student" },
        "-password"
      );

      res.json({
        success: true,
        students,
      });
    } catch (error) {
      console.error("Error fetching students:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch students",
      });
    }
  }
);

// CREATE CERTIFICATE API
app.post(
  "/certificates",
  authenticateToken,
  authorizeRole("admin"),
  upload.single("certificate"),
  async (req, res) => {
    try {
      const {
        studentId,
        title,
        certificateType,
        issuingOrganization,
        issueDate,
      } = req.body;

      // Validate required fields
      if (
        !studentId ||
        !title ||
        !certificateType ||
        !issuingOrganization ||
        !issueDate
      ) {
        return res.status(400).json({
          success: false,
          message: "All certificate fields are required",
        });
      }

      // Make sure a certificate file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Certificate file is required",
        });
      }

      // Make sure the selected user is actually a student
      const student = await User.findOne({
        _id: studentId,
        role: "student",
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // Create certificate
      const certificate = await Certificate.create({
        student: studentId,
        title,
        certificateType,
        issuingOrganization,
        issueDate,
        fileName: req.file.originalname,
        filePath: req.file.path,
        status: "pending",
      });

      await certificate.populate("student", "name usn email");

      res.status(201).json({
        success: true,
        message: "Certificate uploaded successfully",
        certificate,
      });
    } catch (error) {
      console.error("Certificate upload error:", error);

      res.status(500).json({
        success: false,
        message: "Server error while uploading certificate",
      });
    }
  }
);

// GET ALL CERTIFICATES - ADMIN
app.get(
  "/certificates",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const certificates = await Certificate.find()
        .populate("student", "name usn email")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        certificates,
      });
    } catch (error) {
      console.error("Error fetching certificates:", error);

      res.status(500).json({
        success: false,
        message: "Server error while fetching certificates",
      });
    }
  }
);

// DELETE CERTIFICATE - ADMIN
app.delete(
  "/certificates/:certificateId",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const { certificateId } = req.params;

      const certificate = await Certificate.findById(certificateId);

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: "Certificate not found",
        });
      }

      await Certificate.findByIdAndDelete(certificateId);

// Delete the physical certificate file
if (certificate.filePath) {
  const filePath = path.resolve(certificate.filePath);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

res.status(200).json({
  success: true,
  message: "Certificate deleted successfully",
});
    } catch (error) {
      console.error("Certificate deletion error:", error);

      res.status(500).json({
        success: false,
        message: "Server error while deleting certificate",
      });
    }
  }
);

// GET CERTIFICATES FOR A STUDENT
app.get(
  "/certificates/student/:studentId",
  authenticateToken,
  async (req, res) => {
    try {
      const { studentId } = req.params;

      // Make sure the student exists
      const student = await User.findOne({
        _id: studentId,
        role: "student",
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // Fetch certificates belonging to this student
      const certificates = await Certificate.find({
        student: studentId,
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        student: {
          id: student._id,
          name: student.name,
          usn: student.usn,
        },
        certificates,
      });
    } catch (error) {
      console.error("Error fetching student certificates:", error);

      res.status(500).json({
        success: false,
        message: "Server error while fetching certificates",
      });
    }
  }
);



// VERIFY API
app.post("/verify", (req, res) => {
  res.json({
    status: "Authentic",
    blockchain: "Verified",
    aiScore: "2%",
  });
});


// FRAUD CHECK API
app.post("/fraud-check", (req, res) => {
  res.json({
    tamperingDetected: false,
    confidence: "98%",
  });
});


// WALLET API
app.get("/wallet", (req, res) => {
  res.json({
    owner: "Dhruv Simha",
    certificates: 5,
  });
});


const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});