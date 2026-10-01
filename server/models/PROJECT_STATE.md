SannrVault — Project State
1. Project Title

AI-Powered Decentralized Academic Credential Ecosystem with Blockchain-Backed Verification and Fraud Detection

Project name: SannrVault

2. Project Context

This is a 7th-semester Computer Science and Engineering major project.

The project is conceptually similar to a digital academic credential vault such as DigiLocker, but designed specifically as an academic credential ecosystem with:

Student credential vault
Institutional/admin certificate issuance
AI-based certificate fraud detection
Cryptographic certificate hashing
Blockchain-backed verification
Employer verification through a shareable link/QR
Tamper detection and verification result visualization
3. Core System Idea

The system has two main user types:

Student

Students can:

Create their own account
Log in
Maintain a personal academic credential vault
View their certificates
Download/share certificates
Generate verification links/QR codes
Allow employers/verifiers to verify credentials
Admin

Admins represent the educational institution/authorized issuer.

Admins can:

Log in
View/manage students
Select a student
Upload/issue academic certificates
Initiate certificate validation
Register verified certificates on the blockchain

There is NO public admin signup.

Students can self-register.

4. Certificate Verification Concept

The intended certificate flow is:

Admin uploads certificate
        ↓
AI checks certificate
        ↓
Certificate considered valid
        ↓
SHA-256 hash generated
        ↓
Hash registered on blockchain
        ↓
Credential associated with student
        ↓
Certificate appears in student's vault


When an employer verifies a certificate:

Employer receives verification link/QR
        ↓
Opens SannrVault verification page
        ↓
Certificate/hash is checked
        ↓
Blockchain record is retrieved
        ↓
Current certificate hash is compared
        ↓
        ┌───────────────────┐
        │                   │
     MATCH              MISMATCH
        │                   │
        ↓                   ↓
 Blockchain OK        AI fraud analysis
                            ↓
                     Tampering analysis


If everything matches:

AUTHENTIC / VERIFIED


If the certificate was modified:

HASH MISMATCH
TAMPERING DETECTED / SUSPICIOUS


The AI layer should provide additional evidence about possible tampering.

5. Planned AI Component

The planned AI fraud detection system will use a Vision Transformer (ViT) based image-processing approach.

Potential supporting technologies:

Python
PyTorch or TensorFlow
OpenCV
OCR/Tesseract
Image preprocessing
Metadata analysis

The AI component is intended to detect certificate manipulation such as:

Image tampering
Copy-move forgery
Text/image manipulation
Logo manipulation
Signature manipulation
Other visual anomalies

Important design principle:

Blockchain determines whether the certificate matches the originally registered credential fingerprint. AI provides probabilistic forensic analysis of the document.

The two results will later be combined through a decision-fusion mechanism.

6. Planned Blockchain Component

Planned technologies:

Ethereum testnet
Solidity
Hardhat and/or Remix
MetaMask

The actual certificate file should NOT be stored directly on the blockchain.

Instead:

Certificate
    ↓
SHA-256
    ↓
Certificate fingerprint/hash
    ↓
Smart contract
    ↓
Blockchain


The blockchain will act as an immutable record of credential registration/integrity.

7. Planned Decision Fusion

The final verification system should combine deterministic blockchain verification with probabilistic AI analysis.

Conceptually:

Blockchain Result
        +
AI Fraud Score
        +
Credential Status
        ↓
Decision Fusion
        ↓
Final Verification Result


Potential outcomes:

Blockchain	AI	Result
Match	Low risk	Authentic
Match	High risk	Suspicious
Mismatch	Low risk	Modified
Mismatch	High risk	Highly suspicious
Revoked	Any	Revoked

The exact scoring/fusion algorithm will be designed later.

8. Current Technology Stack
Frontend
React
Vite
JavaScript
Backend
Node.js
Express.js
CORS
Database
MongoDB
Mongoose
Planned Blockchain
Ethereum testnet
Solidity
Hardhat / Remix
MetaMask
Planned AI
Python
ViT
PyTorch/TensorFlow
OpenCV
Tesseract OCR
9. Current Project Structure

Current structure:

Sannr Vault/
│
├── client/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── vite.config.js
│
├── server/
│   ├── node_modules/
│   ├── models/
│   │   └── User.js
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
└── PROJECT_STATE.md

10. Completed So Far
Project skeleton
Client folder created
Server folder created
React/Vite frontend created
Express backend created
Backend testing

Current backend runs on:

http://localhost:5000


Existing test routes include:

GET /
POST /login
GET /certificates
POST /verify
POST /fraud-check
GET /wallet


These are currently skeletal/mock APIs and will eventually be replaced with real implementations.

Frontend testing

React successfully communicates with the Express backend.

The current frontend calls:

POST /verify


and displays the returned verification information.

MongoDB

MongoDB is installed and working.

Versions:

MongoDB server: 8.2.9
MongoSH: 2.8.3


MongoDB is currently being run with:

mongod --dbpath C:\data\db


MongoDB is accessible on:

mongodb://localhost:27017


MongoSH successfully displays:

admin
config
local

Mongoose

Mongoose has been installed in the server:

npm install mongoose


The Express backend successfully connects to:

mongodb://127.0.0.1:27017/sannrvault


Current successful server output:

Server running on port 5000
MongoDB connected successfully

11. Current User Design

Only students can self-register.

Student fields currently planned:

name
usn
email
password
department
semester
role


The role is automatically:

student


Students cannot select admin during signup.

USN should be unique.

Email should be unique.

Admin accounts will be created separately.

12. User Model Status

File created:

server/models/User.js


Current schema:

name
usn
email
password
department
semester
role
createdAt
updatedAt


The password will later be securely hashed using bcrypt before being stored.

13. Current Phase
Phase 0 — Project Skeleton

COMPLETE

Phase 1 — Database + Authentication

IN PROGRESS

MongoDB connection:

COMPLETE

User model:

CREATED

Student signup API:

NEXT

14. Immediate Next Task

Implement:

POST /signup


The endpoint should accept:

name
usn
email
password
department
semester


The backend should:

Validate the input
Check whether the USN already exists
Check whether the email already exists
Hash the password
Automatically assign role = "student"
Save the student in MongoDB
Return a safe response without exposing the password

After signup, implement:

POST /login


Then:

Password verification
Authentication
JWT/session handling
Protected student routes
Student dashboard
Admin authentication
Role-based authorization
15. Long-Term Development Roadmap
Phase 0 — Skeleton

Complete.

Phase 1 — Database & Authentication

Current phase.

Phase 2 — Student/Admin UI

Build dashboards and navigation.

Phase 3 — Certificate Upload

Admin uploads certificate and associates it with a student.

Phase 4 — Cryptographic Layer

Generate SHA-256 certificate fingerprints.

Phase 5 — Blockchain

Implement Solidity smart contract and blockchain registration.

Phase 6 — Verification

Compare uploaded/current certificate hash against blockchain record.

Phase 7 — AI/ViT

Implement certificate fraud/tampering analysis.

Phase 8 — OCR & Forensic Analysis

Add OCR and supporting image/document analysis.

Phase 9 — Decision Fusion

Combine blockchain and AI results.

Phase 10 — Employer Portal

Implement shareable verification link/QR workflow.

Phase 11 — Security & Polish

Implement:

Authorization
Input validation
File validation
Secure certificate access
Revocation
Error handling
UI polish
Phase 12 — Testing & Evaluation

Measure:

Accuracy
Precision
Recall
F1-score
Verification time
AI inference time
Blockchain transaction time
Overall verification latency
Phase 13 — Final Demonstration

Demonstrate:

Genuine certificate
Tampered certificate
Fake/unregistered certificate
Student vault
Admin issuance
Employer verification
16. Important Development Rule

Build the system incrementally.

Do NOT implement blockchain, AI, authentication, certificate storage, and frontend simultaneously.

Preferred order:

MongoDB
   ↓
User authentication
   ↓
Student/Admin dashboards
   ↓
Certificate management
   ↓
Hashing
   ↓
Blockchain
   ↓
Verification
   ↓
AI/ViT
   ↓
Decision fusion
   ↓
Employer portal
   ↓
Testing


Every major phase should be tested before moving to the next phase.