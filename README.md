# BikeOmeter

This is a sport tracking app for Android. A companion React Native mobile client records GPS data during a ride and uploads the completed activity to this backend, which computes the ride metrics (distance, speeds, altitudes, calories), persists the route as a polyline with user-placed markers, and handles account management, track sharing between users, and comments on shared tracks.

Its written in :
 - java (Spring Boot) for the backend.
 - javascript , Expo (React Native) for the frontend.
 - Uses Aws Server for the database and the Docker container ( RDS & EC2)


# Backend

## Table of contents

- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Architecture](#architecture)
- [Domain model](#domain-model)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Docker](#docker)
- [Authentication](#authentication)
- [API reference](#api-reference)
- [Metric computation](#metric-computation)
- [Error handling](#error-handling)
- [Documentation & diagrams](#documentation--diagrams)
- [Known limitations](#known-limitations)
- [License](#license)

---

## Tech stack

| Component | Version / Detail |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 2.6.1 |
| Build tool | Maven (wrapper included) |
| Persistence | Spring Data JPA / Hibernate |
| Database | PostgreSQL |
| Security | Spring Security + JWT (jjwt 0.9.1) |
| DTO mapping | MapStruct 1.5.5.Final |
| Boilerplate reduction | Lombok 1.18.26 |
| Utilities | Apache Commons Lang3 3.15.0 |
| Containerization | Docker (multi-stage build) |

Maven coordinates: `Rabaza:TFE:0.0.1-SNAPSHOT`, root package `rabaza.tfe`.

---

## Repository layout

The backend is a Maven module located in `TFE/`. All commands below are run from that directory.

```
BikeOmeter/
└── TFE/
    ├── analysis/              UML sources (PlantUML)
    ├── src/
    │   ├── main/
    │   │   ├── frontend/      React Native client
    │   │   ├── java/rabaza/tfe/
    │   │   └── resources/     application.properties, data.sql
    │   └── test/
    ├── Dockerfile
    ├── mvnw / mvnw.cmd        Maven wrapper
    └── pom.xml
```

---

## Architecture

The project follows a conventional layered Spring Boot architecture. Requests flow through the JWT filter, into a controller, down to a service holding the business logic, and out to the database through a Spring Data repository. Entities never cross the HTTP boundary — MapStruct converts them to DTOs first.

```
rabaza.tfe
├── TfeApplication.java        Application entry point
├── controller/                REST endpoints (@RestController)
├── service/                   Business logic (@Service, @Transactional)
├── repository/                Spring Data JPA interfaces
├── model/                     JPA entities and enums
├── dto/                       Request/response objects exposed by the API
├── mapper/                    MapStruct entity ↔ DTO mappers
├── jwt/                       Token generation, validation, request filter
├── configuration/             Security, password encoding, request logging
├── exception/                 Custom exceptions + @ControllerAdvice handler
└── utils/                     Distance, calorie and validation helpers
```

**Layer responsibilities**

- **Controller** — HTTP mapping and status codes only. No business logic.
- **Service** — orchestration, validation, transaction boundaries.
- **Repository** — data access via `JpaRepository`, with custom JPQL where needed.
- **Mapper** — MapStruct interfaces generating implementations at compile time via annotation processing (`mapstruct-processor` is configured alongside Lombok in the compiler plugin).

---

## Domain model

```
User 1 ──── N Track
User 1 ──── N Comment
Track 1 ──── 1 TrackMap
Track 1 ──── N Comment
TrackMap 1 ──── N Coordinate
TrackMap 1 ──── N Marker
```

| Entity | Description |
|---|---|
| `User` | Account holder. Implements `UserDetails` for Spring Security. Carries the physiological data (height, weight, birth date, gender) required for the calorie calculation. |
| `Track` | A completed ride and all its computed metrics: date, total/active/pause time, distance, calories, average and max speed, min/max/start/finish altitude. Also holds the sharing state and its associated metadata (bike type, route type, location, comment). |
| `TrackMap` | The geographic representation of a track. One-to-one with `Track`, owning the route's coordinates and markers. |
| `Coordinate` | A single GPS point of the route polyline (latitude, longitude, timestamp). |
| `Marker` | A point of interest placed by the user along the route (key, name, comment, coordinates). |
| `Comment` | A comment left by a user on a track. Tracks its own creation and modification timestamps and exposes `isAuthor()` for ownership checks. |
| `UserRole` | Enum: `ADMIN`, `USER`. |
| `UserGender` | Enum: `MALE`, `FEMALE`. Used by the BMR formula. |

All entities use sequence-based ID generation (`GenerationType.SEQUENCE`, allocation size 1), matching PostgreSQL sequences.

---

## Getting started

### Prerequisites

- JDK 17
- A running PostgreSQL instance
- Maven is optional — the repository ships the Maven wrapper

### Setup

```bash
git clone https://github.com/ZakRabaza/BikeOmeter.git
cd BikeOmeter/TFE
```

Create the database:

```sql
CREATE DATABASE bikeometer;
```

Configure the connection in `src/main/resources/application.properties` (see [Configuration](#configuration)), then run:

```bash
./mvnw clean install
./mvnw spring-boot:run
```

On Windows, use `mvnw.cmd` instead.

The API is served on **http://localhost:8081**.

### Seed data

`src/main/resources/data.sql` provides four sample users and seven sample tracks for development. Hibernate's `ddl-auto=update` creates the schema on first start; the seed script can then be executed manually against the database, or enabled via `spring.datasource.initialization-mode=always`.

---

## Configuration

`src/main/resources/application.properties`:

```properties
server.port=8081

# Datasource
spring.datasource.url=jdbc:postgresql://<host>:5432/<database>
spring.datasource.username=<username>
spring.datasource.password=<password>

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Error responses
server.error.include-message=always

# Request logging
logging.level.org.springframework.web.filter.CommonsRequestLoggingFilter=DEBUG
```
---

## Docker

A multi-stage `Dockerfile` builds the application with Maven and runs the resulting JAR on a slim JRE image.

```bash
cd TFE
docker build -t bikeometer .
docker run -p 8081:8081 bikeometer
```

The container exposes port 8081. Database connection settings are read from `application.properties` baked into the image, so the target database must be reachable from the container.

---

## Authentication

Authentication is stateless and based on JWT bearer tokens.

**Flow**

1. `POST /api/v1/users/register` creates an account. The password is hashed with BCrypt before storage.
2. `POST /api/authenticate` exchanges credentials for a signed token.
3. Every subsequent request carries the token in the `Authorization` header.

```http
Authorization: Bearer <token>
```
---

## API reference

Base URL: `http://localhost:8081`

All endpoints require a valid bearer token except the two marked **Public**.

### Authentication

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/api/authenticate` | Public | `UserAuthInfoRequest` | `200` — `{ "token": "<jwt>" }` |

```json
{ "login": "user1@mail.com", "password": "..." }
```

### Users — `/api/v1/users`

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/api/v1/users` | Required | — | `200` — `UserInfo[]` |
| `POST` | `/api/v1/users/register` | Public | `RegistrationRequest` | `201` |
| `PUT` | `/api/v1/users` | Required | `UserInfo` | `200` |
| `DELETE` | `/api/v1/users/{userId}` | Required | — | `204` |

`RegistrationRequest` accepts `name`, `email` and `password`. Remaining profile fields are initialised with defaults at registration and updated afterwards through `PUT`. The update is partial: only non-null fields that differ from the stored value are applied, and `email` is never modified.

```json
{
  "name": "zak",
  "email": "zak@mail.com",
  "birthDay": "1990-01-01",
  "gender": "MALE",
  "height": 175.0,
  "weight": 67.0,
  "age": 36
}
```

### Tracks — `/api/v1/tracks`

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/api/v1/tracks` | Required | — | `200` — `TrackInfo[]` |
| `GET` | `/api/v1/tracks/{trackId}` | Required | — | `200` — `TrackInfo` |
| `POST` | `/api/v1/tracks/owner` | Required | `UserInfo` | `200` — `TrackInfo[]` |
| `POST` | `/api/v1/tracks/location` | Required | `LocationsRequest` | `201` |
| `POST` | `/api/v1/tracks/unshared/user` | Required | `UserInfo` | `200` — `TrackInfo[]` |
| `POST` | `/api/v1/tracks/shared/user` | Required | `UserInfo` | `200` — `TrackInfo[]` |
| `POST` | `/api/v1/tracks/shared/others` | Required | `UserInfo` | `200` — `TrackInfo[]` |
| `PUT` | `/api/v1/tracks/{trackId}/share` | Required | `ShareTrackRequest` | `200` |
| `DELETE` | `/api/v1/tracks/{trackId}` | Required | — | `204` |

The three sharing queries resolve the user by email and return, respectively, their private tracks, their shared tracks, and the tracks shared by everyone else — the last one backing the community feed.

**Uploading a ride** — `POST /api/v1/tracks/location` is the core endpoint. The client submits the raw recording; the server derives every metric from it and persists the resulting `Track`, `TrackMap`, `Coordinate` set and `Marker` set in a single operation.

```json
{
  "locations": [
    {
      "accuracy": 5.0,
      "altitude": 51.0,
      "altitudeAccuracy": 3.0,
      "heading": 180.0,
      "latitude": 50.6789,
      "longitude": 4.2034,
      "speed": 5.3,
      "timestamp": 1682237700000
    }
  ],
  "markers": [
    {
      "key": "1",
      "name": "Water fountain",
      "comment": "Refill point",
      "coordinate": { "latitude": 50.6801, "longitude": 4.2050 }
    }
  ],
  "startTime": "2023-04-23T10:15:00.000Z",
  "stopTime": "2023-04-23T11:28:45.000Z",
  "pauseTime": 393,
  "userEmail": "user1@mail.com"
}
```

**Sharing a track** — a `PUT` to `/{trackId}/share` flips the sharing flag and attaches the metadata shown alongside the track in the community feed.

```json
{
  "shared": true,
  "bikeType": "Road",
  "routeType": "Hilly",
  "location": "Brussels",
  "comment": "Nice morning ride"
}
```

**`TrackInfo` response** — returns the full set of computed metrics plus a nested `trackMap` containing `polyCoordinates` (the route polyline) and `markers`, ready for the client to render on a map.

### Markers — `/api/v1/markers`

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/api/v1/markers` | Required | — | `200` — `MarkerInfo[]` |
| `GET` | `/api/v1/markers/trackMap/{trackMapId}` | Required | — | `200` — `MarkerInfo[]` |
| `GET` | `/api/v1/markers/{markerId}` | Required | — | `200` — `MarkerInfo` |
| `POST` | `/api/v1/markers` | Required | `MarkerInfo` | `201` |
| `PUT` | `/api/v1/markers` | Required | `MarkerInfo` | `200` |
| `DELETE` | `/api/v1/markers/{markerId}` | Required | — | `204` |

Creating a marker requires both a `coordinate` object and a valid `trackMapId`. The update endpoint only modifies `name` and `comment` — a marker's position is fixed once placed.

### Comments — `/api/v1/comments`

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/api/v1/comments/track/{trackId}` | Required | — | `200` — `CommentInfo[]` |
| `GET` | `/api/v1/comments/{commentId}` | Required | — | `200` — `CommentInfo` |
| `POST` | `/api/v1/comments` | Required | `CommentInfo` | `201` |
| `PUT` | `/api/v1/comments` | Required | `CommentInfo` | `200` |
| `DELETE` | `/api/v1/comments/{commentId}` | Required | — | `204` |

```json
{
  "content": "Great route, thanks for sharing.",
  "authorEmail": "user2@mail.com",
  "trackId": 1000
}
```

Editing is restricted to the comment's author: the service rejects the request if the supplied `authorEmail` does not match the stored author, and stamps `modifiedDate` when the content actually changes.

---

## Metric computation

All ride metrics are derived server-side from the raw GPS stream, in `TrackService` with the mathematics isolated in `utils/Formulas`.

**Distance** — the great-circle distance between each consecutive pair of GPS points is computed with the haversine formula and summed. The Earth radius constant is 6366 km.

```
a = sin²(Δφ/2) + cos φ₁ · cos φ₂ · sin²(Δλ/2)
c = 2 · atan2(√a, √(1−a))
d = R · c
```

**Times** — total time is the span between start and stop. Active time subtracts the pause duration reported by the client.

**Speeds** — average speed is total distance over active duration, converted to km/h. Max speed is the highest instantaneous GPS speed reading, converted from m/s (× 3.6).

**Altitudes** — min and max are taken across the recording; start and finish altitudes come from the first and last points.

**Calories** — a two-step estimate:

1. **Basal metabolic rate** via the Mifflin–St Jeor equation, using the user's weight, height, age and gender:
   - Male: `10·weight + 6.25·height − 5·age + 5`
   - Female: `10·weight + 6.25·height − 5·age − 161`
2. **Expenditure** as `(BMR / 24) × MET × hours`, where the MET coefficient is selected from the average speed:

| Average speed (km/h) | MET |
|---|---|
| < 16.1 | 4 |
| 16.1 – 19.2 | 6.8 |
| 19.2 – 22.4 | 8 |
| 22.4 – 25.7 | 10 |
| 25.7 – 32.1 | 12 |
| ≥ 32.2 | 15.8 |

This is an estimate, not a measurement: it ignores terrain, wind, rider weight distribution and equipment.

---

## Error handling

`ControllerExceptionHandler` (`@ControllerAdvice`) centralises exception translation and returns a consistent JSON payload.

```json
{
  "statusCode": 404,
  "timestamp": "2026-07-18T10:15:30.000+00:00",
  "message": "user with email x@y.com not found",
  "description": "uri=/api/v1/users"
}
```

| Exception | Status |
|---|---|
| `ResourceNotFoundException`, `UsernameNotFoundException` | `404 Not Found` |
| `EmailTakenException`, `UserDisabledException`, `InvalidCredentialException`, `DisabledException` | `400 Bad Request` |
| `BadCredentialsException` | `401 Unauthorized` |
| Any other `Exception` | `500 Internal Server Error` |

Registration validates the email format through `EmailValidator` and rejects duplicates with `EmailTakenException`. Failed logins are translated inside `JwtTokenUtil` into `InvalidCredentialException` (`INVALID_CREDENTIALS`) or `UserDisabledException` (`USER_DISABLED`).

---

## Documentation & diagrams

UML sources live in `TFE/analysis/` as PlantUML files.

| Diagram | Source | Description |
|---|---|---|
| Use case | `TFE UseCase.puml` | Application features from the user's perspective |
| Class | `TFE Class.puml` | Domain classes, attributes and relationships |
| Conceptual data model | `TFE MCD.puml` | Entities and cardinalities |
| Activity | `TFE Activity.puml` | Overall navigation and user flow |
| Sequence — Sign up | `SignUp.puml` | Registration exchange |
| Sequence — Log in | `Login.puml` | Authentication exchange |
| Sequence — Activity | `Activity.puml` | Recording a ride and uploading it |
| Sequence — Share | `Share.puml` | Sharing a track from the client |

To render them as images:

```bash
java -jar plantuml.jar "TFE/analysis/*.puml"
```

---

## Known limitations

Documented deliberately — these are consequences of the project's academic scope, not oversights left unnoticed.

- **Hardcoded JWT secret and expiry.** `JwtTokenUtil` holds both as literals; the `@Value` annotations that would externalise them are present but commented out. The signing key is also a short ASCII string used with HS512, an algorithm designed for a 512-bit key.
- **Token lifetime.** `jwtTokenValidity` is set to `300000000` and multiplied by 1000 again during generation, yielding an effective lifetime of roughly 9.5 years.
- **`UserRole` is never enforced.** The enum exists and `User.getAuthorities()` returns the role, but `JwtUserDetailsService` builds its `UserDetails` with an empty authority list, so the `ADMIN` / `USER` distinction has no runtime effect.
- **No meaningful test coverage.** `spring-boot-starter-test` is declared, but the test source tree contains only a scratch class.


The project dates from 2024 and has not been updated since.

---

## License

Released under the MIT License. See [LICENSE](LICENSE) for details.
