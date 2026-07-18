# BikeOmeter

This is a sport tracking app for Android. A companion React Native mobile client records GPS data during a ride and uploads the completed activity to this backend, which computes the ride metrics (distance, speeds, altitudes, calories), persists the route as a polyline with user-placed markers, and handles account management, track sharing between users, and comments on shared tracks.

---

# Backend

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

The project follows a conventional layered Spring Boot architecture. Requests flow through the JWT filter, into a controller, down to a service holding the business logic, and out to the database through a Spring Data repository. Entities never cross the HTTP boundary, MapStruct converts them to DTOs first.

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

- **Controller** : HTTP mapping and status codes only. No business logic.
- **Service** : orchestration, validation, transaction boundaries.
- **Repository** : data access via `JpaRepository`, with custom JPQL where needed.
- **Mapper** : MapStruct interfaces generating implementations at compile time via annotation processing (`mapstruct-processor` is configured alongside Lombok in the compiler plugin).

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

### Users : `/api/v1/users`

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

### Tracks : `/api/v1/tracks`

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

The three sharing queries resolve the user by email and return, respectively, their private tracks, their shared tracks, and the tracks shared by everyone else, the last one backing the community feed.

**Uploading a ride** : `POST /api/v1/tracks/location` is the core endpoint. The client submits the raw recording; the server derives every metric from it and persists the resulting `Track`, `TrackMap`, `Coordinate` set and `Marker` set in a single operation.

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

**Sharing a track** : a `PUT` to `/{trackId}/share` flips the sharing flag and attaches the metadata shown alongside the track in the community feed.

```json
{
  "shared": true,
  "bikeType": "Road",
  "routeType": "Hilly",
  "location": "Brussels",
  "comment": "Nice morning ride"
}
```

**`TrackInfo` response** : returns the full set of computed metrics plus a nested `trackMap` containing `polyCoordinates` (the route polyline) and `markers`, ready for the client to render on a map.

### Markers : `/api/v1/markers`

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/api/v1/markers` | Required | — | `200` — `MarkerInfo[]` |
| `GET` | `/api/v1/markers/trackMap/{trackMapId}` | Required | — | `200` — `MarkerInfo[]` |
| `GET` | `/api/v1/markers/{markerId}` | Required | — | `200` — `MarkerInfo` |
| `POST` | `/api/v1/markers` | Required | `MarkerInfo` | `201` |
| `PUT` | `/api/v1/markers` | Required | `MarkerInfo` | `200` |
| `DELETE` | `/api/v1/markers/{markerId}` | Required | — | `204` |

Creating a marker requires both a `coordinate` object and a valid `trackMapId`. The update endpoint only modifies `name` and `comment` — a marker's position is fixed once placed.

### Comments : `/api/v1/comments`

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

**Distance** : the great-circle distance between each consecutive pair of GPS points is computed with the haversine formula and summed. The Earth radius constant is 6366 km.

```
a = sin²(Δφ/2) + cos φ₁ · cos φ₂ · sin²(Δλ/2)
c = 2 · atan2(√a, √(1−a))
d = R · c
```

**Times** : total time is the span between start and stop. Active time subtracts the pause duration reported by the client.

**Speeds** : average speed is total distance over active duration, converted to km/h. Max speed is the highest instantaneous GPS speed reading, converted from m/s (× 3.6).

**Altitudes** : min and max are taken across the recording; start and finish altitudes come from the first and last points.

**Calories** : a two-step estimate:

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

Documented deliberately, these are consequences of the project's academic scope, not oversights left unnoticed.

- **Hardcoded JWT secret and expiry.** `JwtTokenUtil` holds both as literals; the `@Value` annotations that would externalise them are present but commented out. The signing key is also a short ASCII string used with HS512, an algorithm designed for a 512-bit key.
- **Token lifetime.** `jwtTokenValidity` is set to `300000000` and multiplied by 1000 again during generation, yielding an effective lifetime of roughly 9.5 years.
- **`UserRole` is never enforced.** The enum exists and `User.getAuthorities()` returns the role, but `JwtUserDetailsService` builds its `UserDetails` with an empty authority list, so the `ADMIN` / `USER` distinction has no runtime effect.
- **No meaningful test coverage.** `spring-boot-starter-test` is declared, but the test source tree contains only a scratch class.

---
---


# Frontend


Located in `TFE/src/main/frontend/`.


## Tech stack

| Component | Version / Detail |
|---|---|
| Framework | React Native 0.74.1 / React 18.2.0 |
| Platform | Expo SDK 51 |
| Navigation | React Navigation 6 (bottom tabs, native stack, material top tabs) |
| HTTP client | apisauce 2.1 (over axios) |
| Secure storage | expo-secure-store |
| Local storage | @react-native-async-storage/async-storage |
| Geolocation | expo-location, expo-task-manager |
| Maps | react-native-maps 1.14 (Google Maps on Android) |
| Geo utilities | geolib |
| Forms | Formik 2.1 + Yup 0.32 |
| Dates | moment |
| Token decoding | jwt-decode |
| Build & deploy | EAS (Expo Application Services) |
| Linting | ESLint 8 with React and React Native plugins |

Android package: `com.rabaza.bikeometerapp`.

---

## Project structure

```
frontend/
├── App.js                    Entry point: providers, auth gate, navigation container
├── app.json                  Expo configuration
├── eas.json                  EAS build profiles
└── app/
    ├── api/                  One module per backend resource
    │   ├── client.js         apisauce instance + auth header transform
    │   ├── auth.js
    │   ├── users.js
    │   ├── tracks.js
    │   ├── markers.js
    │   └── comments.js
    ├── assets/               Icons, splash screen, images
    ├── auth/                 Auth context, secure token storage, useAuth hook
    ├── components/           Reusable UI
    │   ├── accountView/      Profile field pickers
    │   ├── forms/            Formik wrappers (fields, pickers, submit button)
    │   ├── lists/            List items and separators
    │   ├── location/         AppLocation — GPS tracking controls
    │   ├── timer/            StopWatchTimer
    │   └── track/            AddTrack — upload control
    ├── config/               Colors, shared styles, account picker data
    ├── hooks/                Context definitions + useApi / useLocation
    ├── navigation/           Navigators, route constants, theme
    └── screens/
        ├── authentication/   Welcome, Login, Register
        └── navBar/
            ├── activity/     Display, LiveStats, Map
            ├── history/      HistoryList, TrackDetails, MarkerEdit
            ├── share/        Share, Browse, Shared, Comment, TrackDetailsReadOnly
            ├── AccountScreen.js
            └── StatisticsScreen.js
```

---

## Getting started

### Prerequisites

- Node.js and npm
- Expo CLI
- A Google Maps API key (Android)

### Configure the backend URL

**The hosted backend has been decommissioned.** `app/api/client.js` still points at the original EC2 address, which no longer resolves:

```js
const apiClient = create({
  baseURL: "http://13.39.111.185/api",
});
```

### Configure Google Maps

The API key committed in `app.json` has been revoked. Supply your own under `android.config.googleMaps.apiKey` , ideally through an environment variable via `app.config.js` rather than committing it.

---

## Navigation

`App.js` chooses between two navigators based on authentication state: `AuthNavigator` when no user is restored from storage, `AppNavigator` once logged in.

`AppNavigator` is a bottom tab navigator with five tabs, opening on **Activity**:

| Tab | Navigator | Screens |
|---|---|---|
| Statistics | — | `StatisticsScreen` — aggregate figures with date filtering |
| History | `HistoryNavigator` | `HistoryListScreen`, `TrackDetailsScreen`, `MarkerEditScreen` |
| Activity | `ActivityNavigator` | `DisplayScreen`, `LiveStatsScreen`, `MapScreen` |
| Share | `ShareNavigator` | `ShareScreen`, `BrowseScreen`, `SharedScreen`, `CommentScreen`, `TrackDetailsReadOnlyScreen` |
| Account | `AccountNavigator` | `AccountScreen` |

The Activity tab uses a top tab navigator so the rider can swipe between the speedometer, the live statistics, and the map without interrupting the recording.

---

## State management

State is held in React Context — no external state library. `App.js` composes the providers and owns the recording state:

| Context | Holds |
|---|---|
| `AuthContext` | Current user, decoded from the JWT |
| `TracksContext` | Shared and unshared track lists, with loading and error state |
| `StartStopContext` | Whether a recording is in progress |
| `PauseContext` | Whether the recording is paused |
| `LocationContext` | The latest GPS reading (drives the speedometer) |
| `LocationsContext` | The accumulated route points |
| `MarkersContext` | Markers placed during the current ride |
| `StartTimeContext` / `StopTimeContext` / `PauseTimeContext` | Ride timing |

Most of these are bare `createContext()` calls exported as modules, with the state itself declared in `App.js` and passed down as `[value, setValue]` pairs. `TracksContext` is the exception: it ships a full `TracksProvider` that loads the user's tracks when the user changes and exposes `toggleShareStatus` to publish or unpublish a track and refresh the lists afterwards.

---

## API layer

Each backend resource has a module in `app/api/` exposing plain functions. `client.js` creates the apisauce instance and registers an async request transform that reads the JWT from secure storage and attaches it as a bearer token to every request.

---

## Authentication

1. `LoginScreen` posts credentials through `authApi.login`, which maps them to the backend's `{ login, password }` shape.
2. On success, `useAuth().logIn(token)` decodes the JWT and writes it to `expo-secure-store` (encrypted device storage, not AsyncStorage).
3. `App.js` calls `authStorage.getUser()` on mount, so a valid token restores the session without a new login.
4. `logOut()` clears both the context and the stored token, which returns the app to `AuthNavigator`.

The decoded token's `sub` claim carries the user's email and is used as the identifier in requests that expect a `userInfo` object.

---

## GPS tracking

Recording is handled by `components/location/AppLocation.js`, which renders the Start/Stop and Pause/Resume buttons and owns the tracking lifecycle.

**Starting** : foreground and background location permissions are requested on mount. Pressing Start stamps the start time with `moment()`, clears any previous markers, resets the pause counter, and opens a `Location.watchPositionAsync` subscription at `BestForNavigation` accuracy.

**While recording** : each GPS callback is filtered through `isSignificantChange`, which discards readings that moved less than a coordinate threshold, keeping the route free of stationary noise. Accepted points capture accuracy, altitude, altitude accuracy, heading, latitude, longitude, speed and timestamp, the exact shape the backend's `LocationRequest` expects. Every accepted point is appended to a module-level buffer, persisted to AsyncStorage, and pushed into context so the speedometer and map update live.

**Pausing** : removes the location subscription while a one-second interval accumulates the pause duration, which the backend later subtracts to compute active time.

**Stopping** : removes the subscription, stamps the stop time, and clears the stored buffer.

**Uploading** : `components/track/AddTrack.js` submits the recorded locations, markers, start and stop times, pause duration and user email to `POST /api/v1/tracks/location`. Local persistence in AsyncStorage means the recording survives an app restart mid-ride; the upload is a separate, deliberate action.

---

## Known limitations

- **Hardcoded backend URL.** `client.js` embeds the base URL as a literal, it should come from `expo-constants` and an environment-specific config.
- **Cleartext HTTP.** The app sets `usesCleartextTraffic: true` and the backend was served over plain HTTP, so JWTs and credentials travelled unencrypted. HTTPS is required for any real deployment.
- **Secrets committed.** The Google Maps API key was committed in `app.json` (since revoked). It should be injected at build time via `app.config.js`.
- **Background tracking incomplete.** The task is defined and permissions are requested, but no background location updates are started, so minimizing the app interrupts recording.
- **Committed build artifacts.** A `%ProgramData%/Microsoft/Windows/UUS/` directory was accidentally committed and should be removed and gitignored.
- **No tests.** No test suite is present.

The project dates from 2024 and has not been updated since.

# Screen shots

<img width="250" height="555" alt="home" src="https://github.com/user-attachments/assets/d5bc4154-b346-4c43-bfc2-765062785b46" />
<img width="250" height="555" alt="register" src="https://github.com/user-attachments/assets/4f8167a9-5cef-4c47-b0e4-840484a8dd55" />
<img width="250" height="555" alt="login" src="https://github.com/user-attachments/assets/8fb13910-503a-4f8c-9b9f-3330ac3c3c71" />


<img width="250" height="555" alt="statistics" src="https://github.com/user-attachments/assets/183e00d1-9db9-4a38-9b33-83507a15b6e9" />
<img width="250" height="555" alt="date_picker" src="https://github.com/user-attachments/assets/1faea6f3-2240-4ce9-b75d-122d515ff1aa" />

<img width="250" height="555" alt="history" src="https://github.com/user-attachments/assets/eff45644-41bb-4435-9712-cc6156302144" />
<img width="250" height="555" alt="history_details" src="https://github.com/user-attachments/assets/27a482e8-cdc9-437c-b2ae-e234dee67156" />
<img width="250" height="555" alt="history_marker_edit" src="https://github.com/user-attachments/assets/68e12438-aa35-4610-9480-5f2191489cdf" />
<img width="250" height="555" alt="history_delete" src="https://github.com/user-attachments/assets/1f3481e6-48b6-4260-9949-4705ee967547" />

<img width="250" height="555" alt="display" src="https://github.com/user-attachments/assets/2e67ec79-f315-4948-9929-43366ff8d75b" />
<img width="250" height="555" alt="activity_pause" src="https://github.com/user-attachments/assets/7f977ba6-0ff7-4fea-991d-5ae0a1684f90" />
<img width="250" height="555" alt="activity_resume" src="https://github.com/user-attachments/assets/e7022fd3-40db-4b3d-9173-274697c56f68" />
<img width="250" height="555" alt="live_stats" src="https://github.com/user-attachments/assets/d3106238-1456-42c5-b911-ca3914218113" />
<img width="250" height="555" alt="map" src="https://github.com/user-attachments/assets/28eca29f-c2e1-4bc6-b0af-0996176aa4d9" />

<img width="250" height="555" alt="share" src="https://github.com/user-attachments/assets/45191203-bd52-4ba3-bd49-41218ff650ef" />
<img width="250" height="555" alt="share_add" src="https://github.com/user-attachments/assets/7911fe5a-e1f3-4375-99f2-ff5f5d9304a3" />
<img width="250" height="555" alt="shared" src="https://github.com/user-attachments/assets/0f8380b3-8d24-42dc-93df-54ebe2fd0cfe" />
<img width="250" height="555" alt="shared_details" src="https://github.com/user-attachments/assets/961d7cab-e763-4a2f-82b7-851c8cf9da90" />
<img width="250" height="555" alt="comment_owner" src="https://github.com/user-attachments/assets/4e920039-3587-4bc7-b1bc-8ab353f197ad" />
<img width="250" height="555" alt="browse" src="https://github.com/user-attachments/assets/9fe77ffd-24e1-4a59-9286-b265ea970b5d" />
<img width="250" height="555" alt="browse_filter" src="https://github.com/user-attachments/assets/42495db0-1566-4d01-ad76-2b15030813a3" />
<img width="250" height="555" alt="comment_not_owner" src="https://github.com/user-attachments/assets/a7b4d04e-d2a7-432e-af4f-b25fb4f15e82" />

<img width="250" height="555" alt="account" src="https://github.com/user-attachments/assets/78aaa633-f06b-4047-8f97-7e7e3843649c" />
<img width="250" height="555" alt="account_height" src="https://github.com/user-attachments/assets/6a73ac61-c82b-47e7-84d5-4a8e1acb3780" />
<img width="250" height="555" alt="acccount_date" src="https://github.com/user-attachments/assets/b21c7e63-2ca6-423d-813d-d46ad2f3bd15" />


# License

Released under the MIT License. See [LICENSE](LICENSE) for details.
