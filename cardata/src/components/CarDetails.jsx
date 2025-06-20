import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Paper, Typography, Button, Box, Divider } from "@mui/material";
import { fetchCarDetailById } from "../services/dataService";

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCarDetailById(id)
      .then((data) => setCar(data))
      .catch(() => setError("Failed to load car details."));
  }, [id]);

  if (error) return <Typography color="error">{error}</Typography>;
  if (!car) return <Typography>Loading...</Typography>;

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#f5f7fa" }}>
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fa",
        }}
      >
        <Paper sx={{ p: 3, mb: 2, width: "100%", maxWidth: 600 }}>
          <Typography variant="h5" gutterBottom>
            Car Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {Object.entries(car).map(([key, value]) => (
            <Typography key={key} sx={{ mb: 1 }}>
              <strong>{key}:</strong> {String(value)}
            </Typography>
          ))}
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Paper>
      </Box>
    </div>
  );
};

export default CarDetails;
