# Comandi API di Spring Bootstrap

````
POST /api/public/newsletter/register
````

````
  "email": "string",
  "language": "ITALIAN",
  "registerDate": "2025-01-04"
````


````
GET /api/admin/users/{login}
curl -X 'GET' \
  'http://localhost:8080/api/admin/users/admin' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzU ... nqg'
```
risultato :
````
{
  "id": 1,
  "login": "admin",
  "firstName": "Administrator",
  "lastName": "Administrator",
  "email": "admin@localhost",
  "imageUrl": "",
  "activated": true,
  "langKey": "it",
  "createdBy": "system",
  "createdDate": null,
  "lastModifiedBy": "system",
  "lastModifiedDate": null,
  "authorities": [
    "ROLE_USER",
    "ROLE_ADMIN"
  ]
}
`````

````
GET /api/admin/users
curl -X 'GET' \
  'http://localhost:8080/api/admin/users?page=0&size=20' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIiIsImV ... DJs1_p_jhbhSUYDRVjVnqg'

[
  {
    "id": 1,
    "login": "admin",
    ...
    "authorities": [
      "ROLE_USER",
      "ROLE_ADMIN"
    ]
  },
  {
    "id": 2,
    "login": "user",
    ...
    "authorities": [
      "ROLE_USER"
    ]
  }
]
`````

````
POST /api/register
curl -X 'POST' \
  'http://localhost:8080/api/register' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJh ... RVjVnqg' \
  -d '{
  "id": 0,
  "login": "test",
  "firstName": "tizio",
  "lastName": "Caio",
  "email": "info@ivytech.it",
  "imageUrl": "string",
  "activated": true,
  "langKey": "ITALIAN",
  "createdBy": "string",
  "createdDate": "2024-11-19T04:24:03.575Z",
  "lastModifiedBy": "string",
  "lastModifiedDate": "2024-11-19T04:24:03.575Z",
  "authorities": [
    "string"
  ],
  "password": "passami"
}'
`````

````
POST /api/authenticate
curl -X 'POST' \
  'http://localhost:8080/api/authenticate' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJh ... DRVjVnqg' \
  -d '{
  "username": "tizio",
  "password": "passami",
  "rememberMe": true
}'

{
  "id_token": "eyJhbGciOiJI ... P0VaVg"
}
`````

`````
GET /api/admin/users/{login}
`````

`````
curl -X 'GET' \
  'http://localhost:8080/api/admin/users/user' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzU ... T9A'
`````

risponde :
`````
{
  "id": 2,
  "login": "user",
  "firstName": "User",
  "lastName": "User",
  "email": "user@localhost",
  "imageUrl": "",
  "activated": true,
  "langKey": "it",
  "createdBy": "system",
  "createdDate": null,
  "lastModifiedBy": "system",
  "lastModifiedDate": null,
  "authorities": [
    "ROLE_USER"
  ]
}
`````

`````
PUT /api/admin/users/{login}
`````

`````
{
  "id": 0,
  "login": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "imageUrl": "string",
  "activated": true,
  "langKey": "string",
  "createdBy": "string",
  "createdDate": "2024-11-27T06:46:44.127Z",
  "lastModifiedBy": "string",
  "lastModifiedDate": "2024-11-27T06:46:44.127Z",
  "authorities": [
    "string"
  ]
}
`````

`````
GET /api/admin/users
`````

`````
POST /api/admin/users
`````

`````
PUT /api/admin/users
`````

`````
{
  "id": 0,
  "login": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "imageUrl": "string",
  "activated": true,
  "langKey": "string",
  "createdBy": "string",
  "createdDate": "2024-11-27T06:46:44.127Z",
  "lastModifiedBy": "string",
  "lastModifiedDate": "2024-11-27T06:46:44.127Z",
  "authorities": [
    "string"
  ]
}
`````

`````
DELETE /api/admin/users/{login}
`````


`````
GET /api/account
`````

`````
curl -X 'GET' \
  'http://localhost:8080/api/account' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTczMjcxNzYwNywiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzMyNjMxMjA3fQ.GUuoFndwcpEMnRillCmzBgJ4a_HOx3WEMG5J96dajs2M31SyGdpwW1aQhrKjaVnFTtmx2rCPfk2YjJ8Lt06T9A'
`````

risponde 
`````
{
  "id": 1,
  "login": "admin",
  "firstName": "Administrator",
  "lastName": "Administrator",
  "email": "admin@localhost",
  "imageUrl": "",
  "activated": true,
  "langKey": "it",
  "createdBy": "system",
  "createdDate": null,
  "lastModifiedBy": "system",
  "lastModifiedDate": null,
  "authorities": [
    "ROLE_USER",
    "ROLE_ADMIN"
  ]
}
`````

## Change password

````
POST /api/account/change-password
````

````
{
  "currentPassword": "string",
  "newPassword": "string"
}
````