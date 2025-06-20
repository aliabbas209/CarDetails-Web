import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CssBaseline,
  Box,
  Container,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import PropTypes from "prop-types";
import {
  fetchCarDetails,
  fetchColumns,
  deleteCarDetailById,
} from "../services/dataService";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

const conditionOptions = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "starts", label: "Starts With" },
  { value: "ends", label: "Ends With" },
  { value: "empty", label: "Is Empty" },
];

// Extracted for clarity
const ActionsCell = ({ id, onView, onDelete }) => (
  <div>
    <Button
      size="small"
      variant="outlined"
      onClick={() => onView(id)}
      sx={{ mr: 1 }}
    >
      View
    </Button>
    <Button
      size="small"
      variant="outlined"
      color="error"
      onClick={() => onDelete(id)}
    >
      Delete
    </Button>
  </div>
);

ActionsCell.propTypes = {
  id: PropTypes.string.isRequired,
  onView: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const DataGridTable = () => {
  const [rowData, setRowData] = useState([]);
  const [colDefs, setColDefs] = useState([]);
  const [columns, setColumns] = useState([]);
  const [search, setSearch] = useState("");
  const [column, setColumn] = useState("");
  const [condition, setCondition] = useState("contains");
  const navigate = useNavigate();

  // Fetch columns on mount
  useEffect(() => {
    fetchColumns().then((res) => {
      const cols = res.columns.filter((key) => key !== "_id" && key !== "__v");
      setColumns(cols);
      if (cols.length > 0) setColumn(cols[0]);
    });
  }, []);

  // Fetch data (optionally with filters)
  const fetchData = useCallback(async (params = {}) => {
    const data = await fetchCarDetails(params);
    setRowData(data);

    if (data.length > 0) {
      setColDefs(getColDefs(data));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate column definitions including Actions
  const getColDefs = (data) => {
    const baseCols = Object.keys(data[0])
      .filter((key) => key !== "_id" && key !== "__v")
      .map((key) => ({ field: key }));

    return [
      ...baseCols,
      {
        headerName: "Actions",
        field: "actions",
        cellRenderer: (params) => (
          <ActionsCell
            id={params.data._id}
            onView={handleView}
            onDelete={handleDelete}
          />
        ),
        pinned: "right",
        minWidth: 120,
        maxWidth: 160,
      },
    ];
  };

  // Handlers
  const handleView = (id) => {
    navigate(`/details/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this row?")) {
      try {
        await deleteCarDetailById(id);
        fetchData();
      } catch {
        alert("Failed to delete row.");
      }
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    if (search && column && condition) {
      fetchData({ search, column, condition });
    } else {
      fetchData();
    }
  };

  const handleClear = () => {
    setSearch("");
    setCondition("contains");
    if (columns.length > 0) setColumn(columns[0]);
    fetchData();
  };

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#f5f7fa" }}>
      <CssBaseline />
      <Container maxWidth="lg" disableGutters sx={{ width: "100%" }}>
        <Box sx={{ minHeight: "100vh", py: 2 }}>
          {/* Filter Form */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, width: "100%" }}>
            <form onSubmit={handleFilter}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Column</InputLabel>
                    <Select
                      value={column}
                      label="Column"
                      onChange={(e) => setColumn(e.target.value)}
                    >
                      {columns.map((col) => (
                        <MenuItem key={col} value={col}>
                          {col}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Condition</InputLabel>
                    <Select
                      value={condition}
                      label="Condition"
                      onChange={(e) => setCondition(e.target.value)}
                    >
                      {conditionOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <TextField
                    label="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    fullWidth
                    disabled={condition === "empty"}
                  />
                </Grid>
                <Grid item xs={6} sm={3} md={1.5}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<SearchIcon />}
                  >
                    Filter
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3} md={1.5}>
                  <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    startIcon={<ClearIcon />}
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
          {/* Data Grid */}
          <Paper elevation={2} sx={{ p: 2 }}>
            <div
              className="ag-theme-alpine"
              style={{ height: 500, width: "100%" }}
            >
              <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 25, 50]}
              />
            </div>
          </Paper>
        </Box>
      </Container>
    </div>
  );
};

export default DataGridTable;
