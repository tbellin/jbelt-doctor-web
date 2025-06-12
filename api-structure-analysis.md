# Backend API Structure Analysis

## Summary

Testing conducted with admin/admin authentication on the JBelt Doctor API to understand exact JSON structures returned when fetching sheets and models with their associations.

## Authentication
- Endpoint: `POST /api/authenticate`
- Credentials: `{"username": "admin", "password": "admin"}`
- Response: `{"id_token": "..."}`
- Token length: 228 characters

## API Response Structures

### 1. GET /api/sheets/{id} - Complete Sheet Object

**Example: GET /api/sheets/1151**

```json
{
  "id": 1151,
  "creoId": "CA30",
  "code": "D30",
  "name": "Foglio D30",
  "formatType": "A3O",
  "format": null,
  "drawing": null,
  "models": [
    {
      "id": 1004,
      "code": null,
      "name": "Assembly 001",
      "modelType": null,
      "instanceType": null,
      "file": null,
      "version": null,
      "item": null,
      "generic": null,
      "parent": null,
      "sheets": []
    }
  ]
}
```

**Key Observations:**
- Sheet has complete main properties (id, creoId, code, name, formatType)
- `format` and `drawing` are null
- `models` array contains **partial model objects**:
  - Has `id` and `name`
  - `code`, `modelType`, `instanceType` are **null** (even though they have values when fetched individually)
  - `sheets` array is **empty** (avoids circular reference)

### 2. GET /api/models/{id} - Complete Model Object

**Example: GET /api/models/1004**

```json
{
  "id": 1004,
  "code": "A001",
  "name": "Assembly 001",
  "modelType": "ASSEMBLY",
  "instanceType": "PARAMETRIC",
  "file": null,
  "version": null,
  "item": null,
  "generic": null,
  "parent": null,
  "sheets": [
    {
      "id": 1157,
      "creoId": null,
      "code": null,
      "name": "X0X",
      "formatType": null,
      "format": null,
      "drawing": null,
      "models": []
    },
    {
      "id": 1151,
      "creoId": null,
      "code": null,
      "name": "Foglio D30",
      "formatType": null,
      "format": null,
      "drawing": null,
      "models": []
    },
    {
      "id": 1152,
      "creoId": null,
      "code": null,
      "name": "F003",
      "formatType": null,
      "format": null,
      "drawing": null,
      "models": []
    }
  ]
}
```

**Key Observations:**
- Model has complete main properties (id, code, name, modelType, instanceType)
- `sheets` array contains **partial sheet objects**:
  - Has `id` and `name`
  - `creoId`, `code`, `formatType` are **null** (even though they have values when fetched individually)
  - `models` array is **empty** (avoids circular reference)

## Critical Differences Between Individual vs. Associated Objects

### Complete Sheet Object (GET /api/sheets/{id})
```json
{
  "id": 1151,
  "creoId": "CA30",      // ✅ Present
  "code": "D30",         // ✅ Present
  "name": "Foglio D30",  // ✅ Present
  "formatType": "A3O"    // ✅ Present
}
```

### Partial Sheet Object (in Model's sheets array)
```json
{
  "id": 1151,
  "creoId": null,        // ❌ NULL
  "code": null,          // ❌ NULL
  "name": "Foglio D30",  // ✅ Present
  "formatType": null     // ❌ NULL
}
```

### Complete Model Object (GET /api/models/{id})
```json
{
  "id": 1004,
  "code": "A001",           // ✅ Present
  "name": "Assembly 001",   // ✅ Present
  "modelType": "ASSEMBLY",  // ✅ Present
  "instanceType": "PARAMETRIC" // ✅ Present
}
```

### Partial Model Object (in Sheet's models array)
```json
{
  "id": 1004,
  "code": null,             // ❌ NULL
  "name": "Assembly 001",   // ✅ Present
  "modelType": null,        // ❌ NULL
  "instanceType": null      // ❌ NULL
}
```

## Backend Data Relationships

### Available Test Data:
- **7 models** total (IDs: 1001, 1002, 1003, 1004, 1005, 1201, 1202)
- **3 sheets** total (IDs: 1151, 1152, 1157)

### Association Patterns:
- **Model 1004** (Assembly 001) → associated with **3 sheets** (1151, 1152, 1157)
- **Sheet 1151** (Foglio D30) → associated with **1 model** (1004)
- **Sheet 1152** (F003) → associated with **2 models**
- **Sheet 1157** (X0X) → associated with **4 models**

## Frontend Code Implications

### Problem Identified:
The frontend code likely expects complete objects when sending data back to the backend, but receives partial objects in associations. This can cause issues when:

1. **Editing associated models/sheets** - Missing required fields like `code`, `modelType`, `instanceType`, `creoId`, `formatType`
2. **Validation** - Frontend validation may fail on null values that should have real data
3. **Display** - UI components may not display complete information for associated objects

### Recommended Solutions:

1. **Fetch complete objects separately** when editing associations
2. **Merge partial and complete data** when updating
3. **Handle null values** gracefully in forms and validation
4. **Use proper DTOs** that differentiate between complete and partial object structures

## API Endpoints Tested

- ✅ `POST /api/authenticate` - Authentication working
- ✅ `GET /api/sheets` - Returns array of complete sheet objects
- ✅ `GET /api/sheets/{id}` - Returns complete sheet with partial model associations
- ✅ `GET /api/models` - Returns array of complete model objects  
- ✅ `GET /api/models/{id}` - Returns complete model with partial sheet associations

All endpoints require Bearer token authentication.