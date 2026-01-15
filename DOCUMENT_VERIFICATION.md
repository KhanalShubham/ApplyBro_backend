# Document Verification System Documentation

## Overview

The document verification system enables users to upload academic documents (transcripts, certificates, IELTS scores, etc.) and allows administrators to verify or reject them. The system maintains documents in two storage locations for backward compatibility and advanced features.

## Architecture

### Dual Storage System

Documents are stored in two locations:

1. **UserDocument Collection** (Primary)
   - Advanced features: parsing status, parsed data, file metadata
   - Better for document management and matching
   - Located in: `applybro-backend/src/models/userDocument.model.js`

2. **User.documents Array** (Legacy)
   - Simple document references
   - Maintained for backward compatibility
   - Located in: `applybro-backend/src/models/user.model.js`

### Status Synchronization

When a document is verified or rejected, the status is automatically synced between both storage systems to ensure consistency.

## API Endpoints

### User Endpoints

#### POST `/api/v1/documents/upload`

Upload a document with automatic parsing.

**Authentication:** Required (Student/Admin)

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file` (File): Document file (PDF, DOC, DOCX)
  - `type` (String): Education level type (e.g., "+2", "bachelor", "ielts", "master")
  - `documentType` (String): Document type (e.g., "transcript", "certificate", "ielts")

**Response:**
```json
{
  "status": "success",
  "message": "Document uploaded successfully. Parsing in progress. Document is pending admin verification.",
  "data": {
    "document": {
      "id": "507f1f77bcf86cd799439011",
      "type": "bachelor",
      "documentType": "transcript",
      "originalFilename": "transcript.pdf",
      "fileUrl": "/uploads/document/userId/transcript.pdf",
      "parsingStatus": "processing",
      "verificationStatus": "pending",
      "uploadedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Notes:**
- Document is automatically set to `status: 'pending'` upon upload
- Document parsing happens asynchronously
- Document is immediately visible to admins

#### GET `/api/v1/documents/my-documents`

Get all documents uploaded by the current user.

**Authentication:** Required (Student/Admin)

**Response:**
```json
{
  "status": "success",
  "data": {
    "documents": [
      {
        "id": "507f1f77bcf86cd799439011",
        "type": "bachelor",
        "documentType": "transcript",
        "originalFilename": "transcript.pdf",
        "fileUrl": "/uploads/document/userId/transcript.pdf",
        "fileSize": 1024000,
        "mimeType": "application/pdf",
        "parsingStatus": "completed",
        "status": "verified",
        "verifiedAt": "2024-01-16T09:00:00Z",
        "uploadedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Admin Endpoints

#### GET `/api/v1/admin/documents/pending`

Get all pending documents from both storage systems.

**Authentication:** Required (Admin only)

**Query Parameters:**
- `page` (Number, optional): Page number (default: 1)
- `pageSize` (Number, optional): Items per page (default: 20)

**Response:**
```json
{
  "status": "success",
  "data": {
    "documents": [
      {
        "docId": "507f1f77bcf86cd799439011",
        "userId": "507f191e810c19729de860ea",
        "userName": "John Doe",
        "userEmail": "john@example.com",
        "type": "transcript",
        "name": "transcript.pdf",
        "url": "/uploads/document/userId/transcript.pdf",
        "uploadedAt": "2024-01-15T10:30:00Z",
        "source": "UserDocument",
        "documentType": "transcript",
        "educationType": "bachelor",
        "fileSize": 1024000,
        "mimeType": "application/pdf",
        "parsingStatus": "completed"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

**Notes:**
- Returns documents from both `UserDocument` collection and `User.documents` array
- `source` field indicates which storage system the document comes from
- Includes comprehensive metadata for admin review

#### GET `/api/v1/admin/documents/all`

Get all documents with optional status filter.

**Authentication:** Required (Admin only)

**Query Parameters:**
- `page` (Number, optional): Page number (default: 1)
- `pageSize` (Number, optional): Items per page (default: 20)
- `status` (String, optional): Filter by status (`pending`, `verified`, `rejected`)

**Response:**
```json
{
  "status": "success",
  "data": {
    "documents": [
      {
        "docId": "507f1f77bcf86cd799439011",
        "userId": "507f191e810c19729de860ea",
        "userName": "John Doe",
        "userEmail": "john@example.com",
        "type": "transcript",
        "name": "transcript.pdf",
        "url": "/uploads/document/userId/transcript.pdf",
        "status": "verified",
        "uploadedAt": "2024-01-15T10:30:00Z",
        "verifiedAt": "2024-01-16T09:00:00Z",
        "verifiedBy": "507f191e810c19729de860eb",
        "adminNote": "Document verified successfully",
        "source": "UserDocument",
        "documentType": "transcript",
        "educationType": "bachelor",
        "fileSize": 1024000,
        "mimeType": "application/pdf",
        "parsingStatus": "completed"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

#### PUT `/api/v1/admin/documents/:docId/verify`

Verify or reject a document from the `UserDocument` collection.

**Authentication:** Required (Admin only)

**URL Parameters:**
- `docId` (String): Document ID

**Request Body:**
```json
{
  "status": "verified",  // or "rejected"
  "adminNote": "Document verified successfully",  // optional
  "userId": "507f191e810c19729de860ea"  // optional, for UserDocument lookup
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Document verified successfully",
  "data": {
    "document": {
      "id": "507f1f77bcf86cd799439011",
      "status": "verified",
      "verifiedAt": "2024-01-16T09:00:00Z",
      "verifiedBy": "507f191e810c19729de860eb",
      "adminNote": "Document verified successfully"
    }
  }
}
```

#### PUT `/api/v1/admin/documents/:userId/:docId/verify`

Verify or reject a document from the `User.documents` array.

**Authentication:** Required (Admin only)

**URL Parameters:**
- `userId` (String): User ID
- `docId` (String): Document ID

**Request Body:**
```json
{
  "status": "verified",  // or "rejected"
  "adminNote": "Document verified successfully"  // optional
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Document verified successfully",
  "data": {
    "document": {
      "id": "507f1f77bcf86cd799439011",
      "status": "verified",
      "verifiedAt": "2024-01-16T09:00:00Z",
      "verifiedBy": "507f191e810c19729de860eb",
      "adminNote": "Document verified successfully"
    }
  }
}
```

**Notes:**
- Both verification endpoints automatically sync status between storage systems
- Admin actions are logged in the audit trail
- The endpoint intelligently handles both storage systems

## Document File Access

Document files are stored at: `/uploads/document/userId/filename.pdf`

### Access Methods

1. **Direct Static Serving**
   - URL: `/uploads/document/userId/filename.pdf`
   - CORS headers are automatically included
   - Configured in: `applybro-backend/src/app.js`

2. **API Route**
   - URL: `/api/v1/uploads/file/document/userId/filename.pdf`
   - CORS headers are explicitly set
   - Configured in: `applybro-backend/src/api/v1/uploads.controller.js`

Both routes include:
- `Access-Control-Allow-Origin`: Frontend URL
- `Access-Control-Allow-Credentials`: true
- `Cross-Origin-Resource-Policy`: cross-origin
- Proper content-type headers based on file extension

## Document Status Flow

```
Upload → pending → [Admin Review] → verified/rejected
```

### Status Values

- **pending**: Document uploaded, awaiting admin verification
- **verified**: Document verified by admin
- **rejected**: Document rejected by admin

### Parsing Status

- **pending**: Parsing not started
- **processing**: Parsing in progress
- **completed**: Parsing completed successfully
- **failed**: Parsing failed

## Data Models

### UserDocument Model

```javascript
{
  userId: ObjectId,
  type: String,              // Education level: "+2", "bachelor", "ielts", etc.
  documentType: String,       // Document type: "transcript", "certificate", etc.
  originalFilename: String,
  filePath: String,
  fileUrl: String,
  fileSize: Number,
  mimeType: String,
  parsingStatus: String,      // "pending", "processing", "completed", "failed"
  parsedData: Object,         // Extracted data from document
  status: String,             // "pending", "verified", "rejected"
  verifiedAt: Date,
  verifiedBy: ObjectId,
  adminNote: String,
  uploadedAt: Date,
  parsedAt: Date
}
```

### User.documents Array Item

```javascript
{
  type: String,               // Document type
  name: String,               // Filename
  url: String,                // File URL
  status: String,             // "pending", "verified", "rejected"
  uploadedAt: Date,
  verifiedAt: Date,
  adminNote: String
}
```

## Implementation Details

### File Storage

Documents are stored locally in the `uploads/document/userId/` directory structure. The file path is generated using:
- Base directory: `uploads/document/`
- User ID subdirectory: `userId/`
- Original filename: `originalFilename`

### CORS Configuration

CORS headers are configured in two places:

1. **Static File Serving** (`app.js`):
   ```javascript
   app.use('/uploads', (req, res, next) => {
     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
     res.setHeader('Access-Control-Allow-Origin', frontendUrl);
     res.setHeader('Access-Control-Allow-Credentials', 'true');
     res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
     next();
   }, express.static(uploadsPath));
   ```

2. **API File Serving** (`uploads.controller.js`):
   - Handles OPTIONS preflight requests
   - Sets comprehensive CORS headers
   - Includes security headers

### Status Synchronization

When a document is verified/rejected:

1. If found in `UserDocument` collection:
   - Update `UserDocument.status`
   - Sync to `User.documents` array if matching document exists

2. If found in `User.documents` array:
   - Update `User.documents[].status`
   - Sync to `UserDocument` collection if matching document exists

This ensures both storage systems remain consistent.

## Error Handling

Common error scenarios:

- **400 Bad Request**: Missing required fields, invalid file type
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't have admin role
- **404 Not Found**: Document or user not found
- **500 Internal Server Error**: Server-side error

All errors follow the standard response format:
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Testing

### Test Document Upload

```bash
curl -X POST http://localhost:4000/api/v1/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@transcript.pdf" \
  -F "type=bachelor" \
  -F "documentType=transcript"
```

### Test Get Pending Documents

```bash
curl -X GET "http://localhost:4000/api/v1/admin/documents/pending?page=1&pageSize=20" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Test Verify Document

```bash
curl -X PUT http://localhost:4000/api/v1/admin/documents/DOC_ID/verify \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "verified",
    "adminNote": "Document verified successfully"
  }'
```

## Frontend Integration

The frontend service (`frontend/src/services/adminService.ts`) provides methods for:

- `getDocuments()`: Get all documents with optional status filter
- `verifyDocument()`: Verify or reject a document

Example usage:
```typescript
// Get pending documents
const response = await adminService.getDocuments(1, 20, "", "pending");

// Verify a document
await adminService.verifyDocument(docId, {
  status: "verified",
  adminNote: "Document verified successfully"
});
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Admin endpoints require admin role
3. **File Validation**: File types are validated before upload
4. **Path Traversal Protection**: File paths are validated to prevent directory traversal
5. **CORS**: CORS headers are configured to allow only the frontend URL
6. **Audit Trail**: All admin actions are logged

## Future Enhancements

Potential improvements:

- [ ] Bulk document verification
- [ ] Document versioning
- [ ] Automated verification using AI/ML
- [ ] Document expiration dates
- [ ] Email notifications for status changes
- [ ] Document preview in admin panel
- [ ] Advanced filtering and search




