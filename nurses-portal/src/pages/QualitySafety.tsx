import { CheckCircle, Report, Security, Warning } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";

export default function QualitySafety() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Quality & Safety
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Remember: Patient safety is our top priority. Report all incidents
            and near-misses.
          </Alert>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Report sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Incident Reporting</Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Report safety incidents, medication errors, falls, or
                near-misses
              </Typography>
              <Button variant="contained" fullWidth color="error">
                Report Incident
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Security sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Safety Protocols</Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Review and update safety protocols and procedures
              </Typography>
              <Button variant="outlined" fullWidth>
                View Protocols
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Warning sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Risk Assessments</Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Complete patient risk assessments for falls, pressure ulcers,
                etc.
              </Typography>
              <Button variant="outlined" fullWidth>
                Start Assessment
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CheckCircle sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Quality Indicators</Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Monitor and track quality metrics and indicators
              </Typography>
              <Button variant="outlined" fullWidth>
                View Metrics
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
