# RentFlow-App

RentFlow is a mobile-first property-management application under active
development. It is designed to help property owners manage properties,
buildings, flats/units, tenants, rent, and utility information from a
single application.

The project is currently implemented as a React Native / Expo mobile
frontend backed by a Node.js, Express, MongoDB, and Mongoose API.

> **Current status:** Property and Building creation, configuration,
> updating, and listing are working end-to-end. The next major module is
> Flat/Unit setup. The frontend is currently maintained on **Expo SDK
> 54**.

------------------------------------------------------------------------

## Table of Contents

- [Overview](#overview)
- [Goals](#goals)
- [Current Features](#current-features)
- [Planned Features](#planned-features)
- [Application Flow](#application-flow)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Frontend](#frontend)
- [Backend](#backend)
- [Data Model](#data-model)
- [API Design](#api-design)
- [Property and Building Workflow](#property-and-building-workflow)
- [State Management](#state-management)
- [Navigation](#navigation)
- [Development Conventions](#development-conventions)
- [Environment Configuration](#environment-configuration)
- [Running the Project](#running-the-project)
- [Git and Version Control](#git-and-version-control)
- [Roadmap](#roadmap)
- [Current Status](#current-status)

------------------------------------------------------------------------

# Overview

RentFlow is being built around a hierarchical rental-property model:

``` text
Property
   |
   +-- Building
   |      |
   |      +-- Flat / Unit
   |             |
   |             +-- Tenant
   |
   +-- Property-level information
```

The application is being developed incrementally. The Property -\>
Building workflow is the current reference implementation for future
modules.

------------------------------------------------------------------------

# Goals

RentFlow aims to:

- Create and manage rental properties.
- Support properties containing multiple buildings.
- Configure individual buildings.
- Manage flats/units inside buildings.
- Manage tenants.
- Track rent and payments.
- Track electricity and water information.
- Keep the mobile UI simple and structured.
- Maintain a clean separation between UI, API, business logic, and
  database access.
- Reuse the same architecture as new entities are introduced.

------------------------------------------------------------------------

# Current Features

## Authentication

Implemented foundation:

- Login flow
- JWT authentication
- Protected backend APIs
- Auth state on the frontend

## Property Management

Implemented:

- Create Property
- Property listing
- Property update foundation
- Property setup
- Property-to-building relationships
- Automatic skeleton Building creation

A Property contains information such as:

``` text
propertyName
propertyType
address
totalBuildings
totalUnits
buildingIds
ownerId
```

Example API shape:

``` json
{
  "id": "...",
  "propertyName": "Prestige Shantiniketan",
  "propertyType": "Residential Complex",
  "address": "Whitefield, Bangalore",
  "totalBuildings": 5,
  "totalUnits": 0,
  "buildingIds": ["...", "..."]
}
```

## Building Management

Implemented:

- Automatic skeleton Building creation.
- Fetch Buildings belonging to a Property.
- Building listing from real backend data.
- Building Setup.
- Building name update.
- Number-of-floors update.
- Total-units update.
- Navigation using real `propertyId` and `buildingId`.
- Refreshing the Building list when the screen receives focus.

A skeleton Building initially looks conceptually like:

``` text
Building 1
numberOfFloors = 0
totalUnits = 0
unitIds = []
```

The user then configures it.

------------------------------------------------------------------------

# Planned Features

## Flats / Units

Planned workflow:

``` text
Building
   |
   +-- Create Skeleton Units
             |
             +-- Unit List
                    |
                    +-- Unit Setup
                    |
                    +-- Unit Details
```

## Tenants

Planned:

- Tenant creation
- Tenant assignment to a Unit
- Tenant details
- Rental information

## Rent

Planned:

- Rent records
- Payment tracking
- Payment history
- Rent status

## Utilities

Planned:

- Electricity meter readings
- Water readings
- Utility bills
- Proof/screenshot records

------------------------------------------------------------------------

# Application Flow

The intended overall application flow is:

``` text
Login
  |
  v
Home / Dashboard
  |
  v
Property List
  |
  v
Property
  |
  v
Building List
  |
  v
Building
  |
  v
Flat / Unit List
  |
  v
Flat / Unit
  |
  v
Tenant
  |
  +-- Rent
  |
  +-- Utilities
```

The currently completed portion is primarily:

``` text
Login
  |
Property
  |
Buildings
  |
Building Setup
```

------------------------------------------------------------------------

# Architecture

The backend follows a layered architecture:

``` text
React Native / Expo
        |
       Axios
        |
        v
Express Routes
        |
        v
Controllers
        |
        v
Services
        |
        v
Repositories
        |
        v
Mongoose Models
        |
        v
MongoDB
```

## Routes

Define HTTP endpoints and connect them to controllers.

## Controllers

Handle HTTP concerns:

- Read request parameters.
- Validate required input.
- Call services.
- Return HTTP responses.
- Handle controller-level errors.

Controllers should not contain database access logic.

## Services

Contain application/business logic.

For example, Property creation coordinates:

``` text
Create Property
      |
Create Skeleton Buildings
      |
Collect Building IDs
      |
Update Property
      |
Return Property
```

## Repositories

Contain database access.

Examples:

``` js
Property.find(...)
Building.find(...)
Building.findById(...)
Building.findByIdAndUpdate(...)
```

Repositories should not contain HTTP/UI logic.

## Models

Define MongoDB/Mongoose schemas and serialization behavior.

------------------------------------------------------------------------

# Technology Stack

## Frontend

| Technology                     | Purpose                          |
|--------------------------------|----------------------------------|
| React Native                   | Mobile application UI            |
| Expo                           | React Native development/runtime |
| Expo SDK 54                    | Current project SDK              |
| React                          | UI framework                     |
| React Native                   | Native mobile framework          |
| TypeScript                     | Type safety                      |
| React Navigation               | Navigation                       |
| Axios                          | HTTP/API communication           |
| AsyncStorage                   | Local persistent storage         |
| react-native-element-dropdown  | Dropdown UI                      |
| react-native-safe-area-context | Safe-area handling               |
| react-native-screens           | Navigation support/performance   |
| lucide-react-native            | Icons                            |

Current important frontend versions include:

``` text
Expo:          54.x
React:         19.1.0
React Native:  0.81.5
```

## Backend

| Technology     | Purpose              |
|----------------|----------------------|
| Node.js        | Backend runtime      |
| Express        | HTTP API             |
| MongoDB        | Database             |
| Mongoose       | MongoDB ODM          |
| JWT            | Authentication       |
| Docker Compose | Local infrastructure |

------------------------------------------------------------------------

# Project Structure

The following root structure is based on the current RentFlow-App
workspace.

``` text
RENTFLOW-APP/
|
+-- rentflow-api/
|   |
|   +-- node_modules/
|   +-- src/
|   +-- utils/
|   +-- .env
|   +-- .gitignore
|   +-- docker-compose.yml
|   +-- package-lock.json
|   +-- package.json
|
+-- rentFlow-ui/
    |
    +-- .claude/
    +-- .expo/
    +-- assets/
    +-- node_modules/
    +-- src/
    +-- .gitignore
    +-- AGENTS.md
    +-- app.json
    +-- App.tsx
    +-- CLAUDE.md
    +-- index.ts
    +-- package-lock.json
    +-- package.json
    +-- src.zip
    +-- tsconfig.json
```

The `node_modules` and `.expo` directories are generated/local
directories and should normally remain excluded from Git.

## Frontend source

``` text
rentFlow-ui/src/
```

contains the main application code.

The established organization includes concepts such as:

``` text
components/
screens/
navigation/
context/
api/
models/
```

The exact source tree can evolve as the application grows.

## Backend source

``` text
rentflow-api/src/
```

contains the API implementation, organized around the layered
architecture described above.

------------------------------------------------------------------------

# Frontend

The frontend is located at:

``` text
rentFlow-ui/
```

Important root files include:

``` text
App.tsx
index.ts
app.json
package.json
tsconfig.json
```

The main application source lives under:

``` text
src/
```

The frontend is responsible for:

- Screens
- Navigation
- API communication
- TypeScript models
- Application state
- Reusable UI components
- Authentication state
- Property state

------------------------------------------------------------------------

# Frontend API Layer

API communication is separated from screens.

Examples:

``` text
property.api.ts
building.api.ts
```

The Building API currently follows the pattern:

``` ts
createBuilding(...)
getBuildingsByProperty(...)
updateBuilding(...)
```

Example:

``` ts
export async function getBuildingsByProperty(
    propertyId: string
): Promise<Building[]> {
    const response = await apiClient.get("/buildings", {
        params: { propertyId },
    });

    return response.data;
}
```

Screens should call API functions rather than constructing Axios
requests directly.

------------------------------------------------------------------------

# Frontend Models

Frontend entities use TypeScript interfaces.

Example:

``` ts
export interface Building {
    id?: string;

    propertyId: string;

    buildingName: string;

    numberOfFloors: number;
    totalUnits: number;

    unitIds: string[];
}
```

The frontend convention is:

``` text
id
```

rather than MongoDB’s:

``` text
_id
```

This keeps MongoDB implementation details out of the mobile application.

------------------------------------------------------------------------

# Backend Models and ID Serialization

MongoDB/Mongoose normally exposes:

``` text
_id
```

RentFlow converts that to:

``` text
id
```

at the API boundary.

Example:

``` js
buildingSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();

        delete ret._id;
        delete ret.__v;

        return ret;
    },
});
```

The frontend therefore receives:

``` json
{
  "id": "...",
  "buildingName": "Building 1"
}
```

instead of:

``` json
{
  "_id": "...",
  "__v": 0,
  "buildingName": "Building 1"
}
```

This convention should be applied consistently to future models.

------------------------------------------------------------------------

# Important Repository Rule: `lean()`

The project relies on Mongoose `toJSON()` transforms for API
serialization.

Therefore, repositories should return Mongoose documents when that
transform is required.

Preferred:

``` js
export async function getBuildingsByPropertyId(propertyId) {
    return await Building.find({ propertyId });
}
```

Avoid:

``` js
return Building.find({ propertyId }).lean();
```

for these responses.

`lean()` returns plain JavaScript objects and bypasses the Mongoose
document serialization behavior used by the project’s `toJSON()`
transform.

This distinction was important in getting the Property and Building APIs
to consistently expose `id` instead of `_id`.

------------------------------------------------------------------------

# Property -\> Building Workflow

Property creation uses automatic skeleton Building creation.

The flow is:

``` text
POST /properties
        |
        v
Create Property
        |
        v
createSkeletonBuildings(property)
        |
        +-- Building 1
        +-- Building 2
        +-- Building 3
        +-- ...
        |
        v
Collect building IDs
        |
        v
Update Property.buildingIds
        |
        v
Return updated Property
```

Conceptually:

``` js
const property = await createProperty({...});

const buildingIds =
    await createSkeletonBuildings(property);

const updatedProperty =
    await updateProperty(property.id, {
        buildingIds,
    });

return updatedProperty;
```

This means the frontend does not have to manually create every initial
Building document.

------------------------------------------------------------------------

# Building List

The Building list originally used generated/fake UI data such as:

``` ts
Array.from(...)
```

That approach was removed once the backend became available.

The current approach is:

``` text
propertyId
    |
    v
GET /buildings?propertyId=...
    |
    v
Backend
    |
    v
MongoDB
    |
    v
Building[]
    |
    v
React state
    |
    v
Building list
```

The list therefore displays actual database state.

------------------------------------------------------------------------

# Navigation and Entity IDs

Navigation should use the real entity ID.

Example:

``` ts
navigation.navigate("BuildingSetup", {
    propertyId,
    buildingId: building.id,
    buildingName: building.buildingName,
});
```

Do not rely on array indexes once the actual entity objects are
available.

Avoid patterns such as:

``` ts
buildingIds[index]
```

Prefer:

``` ts
building.id
```

This makes navigation stable even if the list ordering changes.

------------------------------------------------------------------------

# Screen Refresh

List screens can refresh when they regain focus using React Navigation’s
`useFocusEffect()`.

The current Building workflow is:

``` text
Open Building List
       |
       v
Load buildings
       |
       v
Tap Building
       |
       v
Building Setup
       |
       v
Save
       |
       v
Go back
       |
       v
Building List receives focus
       |
       v
Reload buildings
```

This allows changes such as a building rename to appear without
requiring a manual refresh.

------------------------------------------------------------------------

# PropertyContext

RentFlow has a `PropertyContext` for property-level application state.

It currently manages concepts such as:

``` text
properties
selectedProperty
setSelectedProperty()
addProperty()
updateProperty()
refreshProperties()
clearSelectedProperty()
```

The context is useful for property-level state.

It is not intended to become a global source of truth for every child
entity.

Buildings are loaded from the backend using:

``` text
propertyId
```

Future Units should similarly be loaded using:

``` text
buildingId
```

This keeps child screens independent of whether a particular object
happens to be present in context.

------------------------------------------------------------------------

# Planned Details / Setup Pattern

The intended pattern for each configurable entity is:

``` text
Entity List
     |
     v
Tap Entity
     |
     +-- Not configured --> Setup Screen
     |
     +-- Configured ------> Details Screen
                                |
                                v
                              Edit
                                |
                                v
                         Setup / Edit Screen
```

This pattern is intended to be used for Buildings, Units, and later
entities.

------------------------------------------------------------------------

# Environment Configuration

The backend contains:

``` text
rentflow-api/.env
```

Environment-specific configuration and secrets should live there.

Examples include:

``` text
MongoDB connection settings
JWT secret
API configuration
```

Never commit real secrets to GitHub.

The backend `.gitignore` should exclude:

``` text
.env
```

The frontend should follow the same principle for any local
secret/configuration files.

------------------------------------------------------------------------

# Running the Project

## Backend

``` bash
cd rentflow-api
npm install
```

List available scripts:

``` bash
npm run
```

Start the backend using the project’s configured script.

The backend requires its configured MongoDB environment.

## Frontend

``` bash
cd rentFlow-ui
npm install
```

Start Expo:

``` bash
npx expo start
```

The current project uses:

``` text
Expo SDK 54
```

The physical device’s Expo Go version must be compatible with SDK 54
when using Expo Go.

------------------------------------------------------------------------

# Expo SDK

The project is currently maintained on Expo SDK 54.

Relevant versions at the current checkpoint:

``` text
Expo:          54.x
React:         19.1.0
React Native:  0.81.5
```

Do not casually upgrade the Expo SDK as part of normal dependency
installation.

A major Expo upgrade should be treated as a separate, committed
migration task.

Before an SDK upgrade:

``` bash
git status
git add .
git commit -m "Working state before Expo SDK upgrade"
```

Then upgrade deliberately and verify the application after each major
step.

------------------------------------------------------------------------

# Git and Version Control

The project has a local Git repository.

The recommended workflow is:

``` text
Working state
     |
     v
Test
     |
     v
Commit
     |
     v
Push to GitHub
     |
     v
Major change
     |
     v
Test
```

Create a checkpoint before major changes such as:

- Expo SDK upgrades
- React Native upgrades
- Database schema migrations
- Large navigation refactors
- Major architecture changes

A remote GitHub repository should be configured so the project has an
off-machine backup.

------------------------------------------------------------------------

# Development Conventions

## 1. Consistent IDs

API responses should expose:

``` text
id
```

not:

``` text
_id
```

## 2. No fake entity lists after backend integration

Once real backend data exists, use:

``` text
API -> state -> UI
```

rather than generating placeholder entities with `Array.from()`.

## 3. Child data is loaded using parent IDs

Examples:

``` text
Buildings -> propertyId
Units     -> buildingId
Tenants   -> unitId
```

## 4. Use entity IDs instead of array indexes

Prefer:

``` ts
building.id
```

over:

``` ts
buildingIds[index]
```

## 5. Keep API calls in API modules

Screens should call functions such as:

``` ts
getBuildingsByProperty(propertyId)
```

rather than directly calling Axios.

## 6. Keep backend layers separate

Use:

``` text
Controller -> Service -> Repository -> Model
```

## 7. Keep context intentionally small

Use context for application-level state where it is useful, but do not
use it as a replacement for the database.

------------------------------------------------------------------------

# Roadmap

## Phase 1 — Property

- [x] Authentication foundation
- [x] Property creation
- [x] Property listing
- [x] Property update foundation
- [x] Property/building relationship
- [x] Automatic skeleton Building creation

## Phase 2 — Building

- [x] Building model
- [x] Building repository
- [x] Building service
- [x] Building controller
- [x] Building routes
- [x] Building API
- [x] Building list
- [x] Building setup
- [x] Building update
- [x] Real backend data in Building list
- [x] Consistent `id` serialization
- [ ] Configured Building -\> Details navigation
- [ ] Unconfigured Building -\> Setup navigation
- [ ] Building Details -\> Edit flow

## Phase 3 — Flats / Units

- [ ] Unit model
- [ ] Unit repository
- [ ] Unit service
- [ ] Unit controller
- [ ] Unit routes
- [ ] Unit API
- [ ] Unit TypeScript model
- [ ] Skeleton Unit creation
- [ ] Unit list
- [ ] Unit setup
- [ ] Unit details
- [ ] Unit edit flow

## Phase 4 — Tenants

- [ ] Tenant model
- [ ] Tenant management
- [ ] Tenant assignment
- [ ] Tenant details

## Phase 5 — Rent

- [ ] Rent records
- [ ] Payment tracking
- [ ] Payment history
- [ ] Rent status

## Phase 6 — Utilities

- [ ] Electricity readings
- [ ] Water readings
- [ ] Utility bills
- [ ] Proof/screenshot records

------------------------------------------------------------------------

# Current Status

The current verified reference workflow is:

``` text
Create Property
       |
       v
Property saved
       |
       v
Skeleton Buildings created
       |
       v
Building IDs stored on Property
       |
       v
Building List fetched from API
       |
       v
Select Building
       |
       v
Building Setup
       |
       v
Building updated
       |
       v
Building List refreshed
       |
       v
Updated Building displayed
```

The next major implementation should extend this same pattern to:

``` text
Building
    |
    v
Skeleton Units
    |
    v
Unit List
    |
    v
Unit Setup
    |
    v
Unit Details
```

The Property -\> Building implementation should therefore be treated as
the reference architecture for the Unit/Flat module.
