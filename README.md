# 📸 AWS Photo Vault

A secure full-stack photo management application built with **React**,
**Node.js**, **Express**, and multiple **AWS services**.

Users can securely authenticate with **Amazon Cognito**, upload images,
encrypt them using **AWS KMS envelope encryption + AES-256-GCM**, store
encrypted images in **Amazon S3**, store image metadata and encrypted
data keys in **Amazon RDS (MySQL)**, and manage their personal gallery.

------------------------------------------------------------------------

## 🚀 Features

### Authentication

-   ✅ User Registration
-   ✅ Email Verification (OTP)
-   ✅ Secure Login
-   ✅ Forgot Password
-   ✅ Reset Password
-   ✅ JWT Authentication
-   ✅ Protected Routes
-   ✅ Session Restoration

### Image Management

-   ✅ Upload Images
-   ✅ View Personal Gallery
-   ✅ Delete Images
-   ✅ Secure Image Access
-   ✅ Original Filename Preservation
-   ✅ User-specific S3 Folder Organization
-   ✅ Encrypted Image Storage
-   ✅ Decryption only when an authorized user requests an image

### Security

-   ✅ Amazon Cognito Authentication
-   ✅ JWT Verification Middleware
-   ✅ Private Amazon S3 Bucket
-   ✅ User Authorization
-   ✅ AWS KMS Envelope Encryption
-   ✅ AES-256-GCM Image Encryption
-   ✅ Encrypted Data Key stored in RDS
-   ✅ Per-image Initialization Vector (IV)
-   ✅ Users can access only their own images

------------------------------------------------------------------------

# 🏗️ Architecture

``` text
                         +----------------------+
                         |      React App       |
                         |      Frontend        |
                         +----------+-----------+
                                    |
                                    | REST APIs
                                    | JWT Access Token
                                    v
                         +----------------------+
                         |   Node.js + Express  |
                         |      Backend         |
                         +----+------------+----+
                              |            |
                  Authentication          |
                              |            | Image Processing
                              v            |
                     +----------------+   |
                     | Amazon Cognito |   |
                     | Authentication |   |
                     +----------------+   |
                                          |
                           +--------------+---------------+
                           |                              |
                           v                              v
                  +----------------+              +----------------+
                  |    AWS KMS     |              |   Amazon S3    |
                  |                |              |                |
                  | Protects the   |              | Encrypted      |
                  | Data Key       |              | Image Data     |
                  +-------+--------+              +----------------+
                          |
                          | Encrypted Data Key
                          v
                  +----------------------+
                  | Amazon RDS (MySQL)   |
                  |                      |
                  | Image Metadata       |
                  | Encrypted Data Key   |
                  | IV                   |
                  +----------------------+
```

------------------------------------------------------------------------

# ☁️ AWS Services Used

  -----------------------------------------------------------------------
  Service                             Purpose
  ----------------------------------- -----------------------------------
  **Amazon Cognito**                  User authentication, registration,
                                      email verification and JWT tokens

  **Amazon S3**                       Store encrypted image objects

  **AWS KMS**                         Generate and decrypt per-image data
                                      encryption keys

  **Amazon RDS (MySQL)**              Store image metadata, encrypted
                                      data keys and IVs

  **Amazon EC2**                      Backend deployment (ready)

  **IAM**                             Manage AWS permissions and access
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 🛠️ Tech Stack

## Frontend

-   React.js
-   React Router
-   Axios
-   Context API
-   Tailwind CSS
-   React Hot Toast

## Backend

-   Node.js
-   Express.js
-   Multer
-   MySQL2
-   AWS SDK for JavaScript v3
-   UUID

## AWS

-   Amazon Cognito
-   Amazon S3
-   AWS KMS
-   Amazon RDS
-   IAM
-   Amazon EC2

## Encryption

-   AES-256-GCM
-   AWS KMS Envelope Encryption

------------------------------------------------------------------------

# 🔐 Encryption Architecture

Photo Vault uses **envelope encryption**.

The actual image is encrypted using a temporary **AES-256 data
encryption key**. AWS KMS protects that data key.

``` text
                         AWS KMS
                            |
                            | GenerateDataKey
                            v
                 +-----------------------+
                 |    Data Encryption    |
                 |         Key           |
                 +-----------+-----------+
                             |
                 +-----------+-----------+
                 |                       |
                 v                       v
          Plaintext Key            Encrypted Key
             32 bytes              KMS Ciphertext
                 |                       |
                 |                       |
                 v                       v
          AES-256-GCM                Amazon RDS
          Image Encryption          encrypted_key
                 |
                 v
          Encrypted Image
                 |
                 v
              Amazon S3
```

### Important

**AWS KMS does not directly encrypt the image.**

Instead:

``` text
AWS KMS
   |
   | Protects
   v
AES Data Encryption Key
   |
   | Encrypts
   v
Image
```

This is the envelope encryption model.

------------------------------------------------------------------------

# 🔑 Data Key Generation

During image upload, the backend asks AWS KMS to generate a data key:

``` javascript
const command = new GenerateDataKeyCommand({
    KeyId: KEY_ID,
    KeySpec: "AES_256",
});

const response = await kms.send(command);
```

KMS returns two values:

``` text
Plaintext
    |
    +--> 32-byte AES key
          Used temporarily to encrypt the image

CiphertextBlob
    |
    +--> Encrypted version of the data key
          Stored in MySQL/RDS
```

The plaintext data key is **not stored in the database**.

------------------------------------------------------------------------

# 🔒 AES-256-GCM Image Encryption

The original image is received by the backend as a Node.js `Buffer`.

``` text
Original Image Buffer
        |
        v
AES-256-GCM
        |
        +---- Data Encryption Key
        |
        +---- IV
        |
        v
Encrypted Image Buffer
        |
        v
Amazon S3
```

Each image receives its own data key and IV.

The IV is stored in RDS together with the encrypted data key.

------------------------------------------------------------------------

# 📸 Image Upload Flow

``` text
User
 |
 | Select Image
 v
React
 |
 | multipart/form-data
 v
Node.js / Express
 |
 | Verify JWT
 v
Amazon Cognito
 |
 | Authenticated User
 v
GenerateDataKey()
 |
 v
AWS KMS
 |
 +-----------------------------+
 |                             |
 v                             v
Plaintext Data Key        Encrypted Data Key
 |                             |
 |                             +-------> RDS
 |
 v
AES-256-GCM
 |
 v
Encrypted Image
 |
 v
Amazon S3
 |
 v
Store Metadata in RDS
 |
 v
Gallery Refresh
```

------------------------------------------------------------------------

# ☁️ Image Storage Structure

Images are organized by the Cognito User ID.

``` text
photo-vault-bucket/

    user-id-1/
        uuid-golf.jpg
        uuid-yoga.jpg
        uuid-spa.jpg

    user-id-2/
        uuid-beach.jpg
        uuid-cat.jpg
```

Example:

``` text
61537d5a-20d1-70ad-f8be-e6148d1f9cfa/
    10017bd7-50be-4b7f-af9f-083eb3d03444-golf.jpg
```

This structure:

-   Prevents filename collisions
-   Organizes objects per user
-   Makes authorization easier
-   Scales to many users

The object stored in S3 is the **encrypted image**, not the original
plaintext image.

------------------------------------------------------------------------

# 🔓 Image Retrieval and Decryption Flow

When an authenticated user requests an image:

``` text
React
  |
  | GET /images/:id
  | Authorization: Bearer <access-token>
  v
Express Backend
  |
  | Verify JWT
  v
Cognito Authentication
  |
  v
MySQL / RDS
  |
  | file_name
  | encrypted_key
  | iv
  v
+-------------------------+
|                         |
v                         v
Amazon S3              AWS KMS
|                         |
| Encrypted Image         | Decrypt encrypted_key
|                         |
v                         v
Encrypted Image       Plaintext AES Key
Buffer                     |
|                          |
+------------+-------------+
             |
             v
       AES-256-GCM
          Decrypt
             |
             v
       Original Image
             |
             v
          Express
             |
             v
           React
             |
             v
        Display Image
```

------------------------------------------------------------------------

# 📦 What Is a Buffer?

Node.js uses a `Buffer` to handle binary data such as images and
encryption keys.

For example:

``` javascript
req.file.buffer
```

contains the original image bytes.

After encryption:

``` javascript
encryptedData
```

contains encrypted binary data.

When the encrypted image is downloaded from S3, the S3 response is a
stream. It is converted into a Buffer:

``` javascript
const streamToBuffer = async (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];

        stream.on("data", (chunk) => {
            chunks.push(chunk);
        });

        stream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });

        stream.on("error", reject);
    });
};
```

The flow is:

``` text
S3 Response Stream
       |
       +-- Chunk 1
       +-- Chunk 2
       +-- Chunk 3
       +-- ...
       |
       v
Buffer.concat()
       |
       v
Encrypted Image Buffer
       |
       v
AES Decryption
       |
       v
Original Image Buffer
```

------------------------------------------------------------------------

# 🔑 KMS Data Key Decryption

The encrypted data key is stored in RDS as Base64.

During image retrieval:

``` javascript
const encryptedKey = Buffer.from(
    image.encrypted_key,
    "base64"
);
```

The backend sends this encrypted key to KMS:

``` javascript
const command = new DecryptCommand({
    CiphertextBlob: encryptedKey,
});

const response = await kms.send(command);

const plaintextKey = response.Plaintext;
```

KMS returns the original 32-byte AES data key.

``` text
RDS
 |
 | Base64 encrypted_key
 v
Base64 Decode
 |
 v
Buffer
 |
 v
AWS KMS Decrypt
 |
 v
32-byte AES Data Key
```

------------------------------------------------------------------------

# 🗄️ Database Schema

The `images` table stores metadata and encryption information.

``` sql
CREATE TABLE images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    image_url VARCHAR(500),
    file_name VARCHAR(500) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    encrypted_key TEXT,
    iv TEXT
);
```

Important fields:

  Column            Purpose
  ----------------- ------------------------------------------
  `id`              Unique image ID
  `file_name`       S3 object key
  `original_name`   Original uploaded filename
  `uploaded_by`     Cognito user ID
  `uploaded_at`     Upload timestamp
  `encrypted_key`   Base64 encoded KMS-encrypted data key
  `iv`              Base64 encoded AES initialization vector

The plaintext AES data key is **never stored in MySQL**.

------------------------------------------------------------------------

# 🛡️ Authentication and Authorization

Amazon Cognito handles user authentication.

After login, the frontend receives an access token:

``` http
Authorization: Bearer <access-token>
```

The backend verifies the token.

The authenticated user's Cognito `sub` identifies the user:

``` javascript
const userId = req.user.sub;
```

Image queries are restricted by the authenticated user:

``` sql
SELECT *
FROM images
WHERE id = ?
AND uploaded_by = ?;
```

Therefore, a user cannot simply change an image ID and access another
user's image.

------------------------------------------------------------------------

# 🔐 Security Model

The security architecture is:

``` text
                 Amazon Cognito
                       |
                 JWT Authentication
                       |
                       v
                 Express Backend
                       |
          +------------+------------+
          |                         |
          v                         v
      AWS KMS                    Amazon S3
          |                         |
          |                         |
          v                         v
   Encrypted Data Key        Encrypted Image
          |
          v
      Amazon RDS
```

### Separation of responsibilities

``` text
Cognito
  -> Authentication

Express
  -> Authorization + Application Logic

AWS KMS
  -> Protects encryption keys

AES-256-GCM
  -> Encrypts/decrypts image data

Amazon S3
  -> Stores encrypted image objects

Amazon RDS
  -> Stores metadata + encrypted data key + IV
```

------------------------------------------------------------------------

# 📡 API Endpoints

## Authentication

  Method   Endpoint                  Purpose
  -------- ------------------------- ------------------------
  POST     `/auth/signup`            Register user
  POST     `/auth/confirm`           Confirm email OTP
  POST     `/auth/login`             Login
  POST     `/auth/forgot-password`   Request password reset
  POST     `/auth/reset-password`    Reset password
  GET      `/auth/me`                Get authenticated user

## Images

  Method   Endpoint        Purpose
  -------- --------------- -----------------------------------------
  POST     `/upload`       Upload and encrypt image
  GET      `/images`       Get authenticated user's image metadata
  GET      `/images/:id`   Decrypt and return an image
  DELETE   `/images/:id`   Delete image from S3 and RDS

------------------------------------------------------------------------

# 📂 Project Structure

``` text
aws-photo-vault/
│
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── s3.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── imageController.js
│   │   └── uploadController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── imageRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── s3TestRoutes.js
│   │
│   ├── services/
│   │   └── kmsService.js
│   │
│   ├── utils/
│   │   └── encryption.js
│   │
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   └── imageApi.js
│   │   │
│   │   ├── components/
│   │   │   ├── Gallery.jsx
│   │   │   ├── ImageCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── UploadCard.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       └── Login.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── .env.example
│
└── README.md
```

------------------------------------------------------------------------

# ⚙️ Installation

## Clone Repository

``` bash
git clone https://github.com/rajapvr007/aws-photo-vault.git

cd aws-photo-vault
```

------------------------------------------------------------------------

## Backend

``` bash
cd backend

npm install
```

Create `.env`:

``` env
PORT=5000

AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=

KMS_KEY_ID=

DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=3306

COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
```

Start backend:

``` bash
npm start
```

------------------------------------------------------------------------

## Frontend

``` bash
cd frontend

npm install
```

Create `.env`:

``` env
VITE_API_URL=http://localhost:5000
```

Start frontend:

``` bash
npm run dev
```

------------------------------------------------------------------------

# 🔑 AWS KMS Configuration

Photo Vault requires an AWS KMS symmetric key.

The backend uses the KMS key to generate per-image data keys:

``` text
KMS Customer Managed Key
          |
          v
GenerateDataKey
          |
          v
Per-image AES-256 Data Key
```

The application requires permission to use the KMS key, including
operations such as:

``` text
kms:GenerateDataKey
kms:Decrypt
```

The application should also have the appropriate S3 permissions:

``` text
s3:PutObject
s3:GetObject
s3:DeleteObject
```

For production deployment, prefer **IAM roles** over long-term AWS
access keys.

------------------------------------------------------------------------

# 🔒 Environment and Secrets

Never commit secrets to GitHub.

Add the following to `.gitignore`:

``` gitignore
.env
node_modules/
dist/
build/
```

Use `.env.example` to document required variables without exposing
credentials.

------------------------------------------------------------------------

# 🧪 Encryption Verification

A successful upload follows this sequence:

``` text
STEP 1: FILE RECEIVED
        |
STEP 2: S3 KEY CREATED
        |
STEP 3: GENERATING KMS DATA KEY
        |
STEP 4: ENCRYPTING IMAGE
        |
STEP 5: CONVERTING KMS KEY
        |
STEP 6: UPLOADING TO S3
        |
        v
   S3 UPLOAD SUCCESS
```

A successful image retrieval follows:

``` text
STEP 1: Convert encrypted key
        |
STEP 2: Fetch encrypted image from S3
        |
STEP 3: KMS decrypt
        |
STEP 4: AES decrypt
        |
STEP 5: Send image to browser
```

Expected result:

``` text
KMS decrypt SUCCESS
AES DECRYPT SUCCESS
SENDING IMAGE TO BROWSER
```

------------------------------------------------------------------------

# 📸 Screenshots

### Login

*Add screenshot here.*

### Dashboard

*Add screenshot here.*

### Gallery

*Add screenshot here.*

------------------------------------------------------------------------

# 🚀 Future Enhancements

-   Image Preview Before Upload
-   Drag & Drop Upload
-   Upload Progress Bar
-   Image Download
-   Image Rename
-   Image Search
-   Full-screen Image Viewer
-   User Profile Dashboard
-   Storage Usage Statistics
-   Multi-image Upload
-   Album Management
-   CloudFront CDN Integration
-   Docker Support
-   CI/CD using GitHub Actions
-   KMS Key Rotation
-   IAM Role-based AWS authentication
-   Image pagination
-   File size validation
-   Malware scanning

------------------------------------------------------------------------

# 📊 Current Project Status

  Component                 Status
  ------------------------- -------------------------
  React Frontend            ✅ Complete
  Node.js Backend           ✅ Complete
  Express REST API          ✅ Complete
  Cognito Authentication    ✅ Complete
  JWT Authorization         ✅ Complete
  Amazon S3                 ✅ Complete
  Amazon RDS / MySQL        ✅ Complete
  Image Upload              ✅ Complete
  Image Gallery             ✅ Complete
  Image Delete              ✅ Complete
  AWS KMS                   ✅ Integrated
  Envelope Encryption       ✅ Implemented
  AES-256-GCM               ✅ Implemented
  Secure Image Decryption   ✅ Implemented
  EC2 Deployment            🚧 Ready for deployment

------------------------------------------------------------------------

# 🎯 Learning Objectives

This project demonstrates practical implementation of:

-   Full-stack web development
-   REST API design
-   JWT authentication
-   Amazon Cognito
-   Amazon S3
-   Amazon RDS
-   AWS KMS
-   Envelope encryption
-   AES-256-GCM
-   Secure key management
-   User authorization
-   Cloud storage security
-   AWS IAM
-   Node.js binary data handling using Buffers

------------------------------------------------------------------------

# 👨‍💻 Author

**Raja Nayak**

M.Tech Computer Science Engineering\
University of Hyderabad
