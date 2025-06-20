# Car Data Viewer Project Documentation

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Backend](#backend)
   - [Setup](#backend-setup)
   - [API Endpoints](#api-endpoints)
   - [Key Code Snippets](#backend-key-code-snippets)
4. [Frontend](#frontend)
   - [Setup](#frontend-setup)
   - [Main Components](#main-components)
   - [Key Code Snippets](#frontend-key-code-snippets)
5. [Data Flow](#data-flow)
6. [Running the Project](#running-the-project)
7. [Customization](#customization)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This project is a **full-stack web application** for viewing, filtering, and managing car data.

- **Backend:** Node.js/Express with MongoDB, serving car data via REST API.
- **Frontend:** React (Vite), Material UI, and AG Grid for a modern, interactive UI.

---

## Project Structure

```
backend/
  data.csv
  package.json
  server.js
cardata/
  package.json
  vite.config.js
  src/
    App.jsx
    main.jsx
    components/
      CarDetails.jsx
      DataGridTable.jsx
    services/
      dataService.js
```

---

## Backend

### Backend Setup

1. **Install dependencies:**
   ```sh
   cd backend
   npm install
   ```
2. **Import data:**
   - Ensure MongoDB is running.
   - Import `data.csv` into a collection (e.g., `cardetails`).
3. **Start the server:**
   ```sh
   node server.js
   ```
   The backend runs on `http://localhost:4000`.

---

### API Endpoints

#### 1. `GET /data`

- **Description:** Fetch car data, with optional filtering.
- **Query Parameters:**
  - `column`: Field to filter (e.g., `Brand`)
  - `search`: Search value (e.g., `Tesla`)
  - `condition`: Filter condition (`equals`, `contains`, etc.)
- **Example:**
  ```
  GET /data?column=Brand&search=Tesla&condition=contains
  ```

#### 2. `GET /columns`

- **Description:** Returns all available column names.

#### 3. `GET /data/:id`

- **Description:** Fetch details for a single car by MongoDB `_id`.

---

### Backend Key Code Snippets

```js
// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(cors());

mongoose.connect("mongodb://localhost:27017/cardb", { useNewUrlParser: true });

const DataSchema = new mongoose.Schema({}, { strict: false });
const DataModel = mongoose.model("cardetails", DataSchema);

app.get("/data", async (req, res) => {
  const { search, column, condition } = req.query;
  let query = {};
  if (search && column) {
    if (condition === "contains") {
      query[column] = { $regex: search, $options: "i" };
    } else if (condition === "equals") {
      query[column] = search;
    }
  }
  const results = await DataModel.find(query).limit(100);
  res.json(results);
});

app.get("/columns", async (req, res) => {
  const doc = await DataModel.findOne();
  res.json(doc ? Object.keys(doc.toObject()) : []);
});

app.get("/data/:id", async (req, res) => {
  const doc = await DataModel.findById(req.params.id);
  res.json(doc);
});

app.listen(4000, () => console.log("Server running on port 4000"));
```

---

## Frontend

### Frontend Setup

1. **Install dependencies:**
   ```sh
   cd cardata
   npm install
   ```
2. **Start the dev server:**
   ```sh
   npm run dev
   ```
   The frontend runs on `http://localhost:5173` (default Vite port).

---

### Main Components

#### 1. `App.jsx`

- Sets up React Router routes for the data grid and car details.

#### 2. `DataGridTable.jsx`

- Fetches columns and data from backend.
- Renders AG Grid table.
- Supports filtering and row actions (view, delete).

#### 3. `CarDetails.jsx`

- Fetches and displays details for a single car.

#### 4. `dataService.js`

- Contains functions for API calls.

---

### Frontend Key Code Snippets

```jsx
// cardata/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MyGrid from "./components/DataGridTable";
import CarDetails from "./components/CarDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MyGrid />} />
        <Route path="/details/:id" element={<CarDetails />} />
      </Routes>
    </Router>
  );
}
export default App;
```

```jsx
// cardata/src/components/DataGridTable.jsx
import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { fetchCarDetails } from "../services/dataService";
import { useNavigate } from "react-router-dom";

function MyGrid() {
  const [rowData, setRowData] = useState([]);
  const [colDefs, setColDefs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCarDetails().then(setRowData);
    fetch("http://localhost:4000/columns")
      .then((res) => res.json())
      .then((cols) => setColDefs(cols.map((col) => ({ field: col }))));
  }, []);

  const onView = (id) => navigate(`/details/${id}`);

  return (
    <div className="ag-theme-alpine" style={{ height: 600 }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={[
          ...colDefs,
          {
            headerName: "Actions",
            cellRendererFramework: (params) => (
              <button onClick={() => onView(params.data._id)}>View</button>
            ),
          },
        ]}
        pagination={true}
        paginationPageSize={10}
      />
    </div>
  );
}
export default MyGrid;
```

```jsx
// cardata/src/components/CarDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:4000/data/${id}`)
      .then((res) => res.json())
      .then(setCar);
  }, [id]);

  if (!car) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)}>Back</button>
      <h2>Car Details</h2>
      <ul>
        {Object.entries(car).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong> {value?.toString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default CarDetails;
```

```js
// cardata/src/services/dataService.js
export async function fetchCarDetails(params = {}) {
  let url = "http://localhost:4000/data";
  const query = new URLSearchParams(params).toString();
  if (query) url += `?${query}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
}
```

---

## Data Flow

1. **User visits frontend** → React app loads.
2. **DataGridTable** fetches columns and car data from backend.
3. **User filters/searches** → Table updates via API.
4. **User clicks "View"** → Navigates to `/details/:id`, fetches car details.
5. **All data** is served from MongoDB via Express API.

---

## Running the Project

1. **Start MongoDB** and import `data.csv`.
2. **Start backend:**
   ```sh
   cd backend
   node server.js
   ```
3. **Start frontend:**
   ```sh
   cd cardata
   npm run dev
   ```
4. **Open browser:**  
   Visit `http://localhost:5173` (or as shown in terminal).

---

## Customization

- **Add new fields:** Update `data.csv` and re-import.
- **Change filtering logic:** Edit `/data` endpoint in `server.js`.
- **UI tweaks:** Edit React components in `cardata/src/components/`.

---

## Troubleshooting

- **CORS errors:** Ensure backend uses `cors()`
