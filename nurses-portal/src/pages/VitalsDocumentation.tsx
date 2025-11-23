import { Air, FavoriteBorder, Speed, Thermostat } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

export default function VitalsDocumentation() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Vitals Documentation
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <FavoriteBorder sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Heart Rate</Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="BPM"
                type="number"
                sx={{ mb: 2 }}
              />
              <Button variant="contained" fullWidth size="small">
                Record
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Speed sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Blood Pressure</Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField placeholder="Systolic" type="number" size="small" />
                <TextField placeholder="Diastolic" type="number" size="small" />
              </Box>
              <Button variant="contained" fullWidth size="small">
                Record
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Thermostat sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Temperature</Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="°F"
                type="number"
                sx={{ mb: 2 }}
              />
              <Button variant="contained" fullWidth size="small">
                Record
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Air sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Respiration</Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="Breaths/min"
                type="number"
                sx={{ mb: 2 }}
              />
              <Button variant="contained" fullWidth size="small">
                Record
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Additional Vital Signs
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="SpO2 (%)" type="number" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Pain Score (0-10)"
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Blood Glucose (mg/dL)"
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Weight (lbs)" type="number" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Height (inches)" type="number" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="BMI" type="number" />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Button variant="contained" fullWidth>
                  Save All Vitals
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
