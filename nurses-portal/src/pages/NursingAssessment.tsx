import {
  Assessment,
  Description,
  LocalHospital,
  Psychology,
} from "@mui/icons-material";
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

export default function NursingAssessment() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Nursing Assessment
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Assessment sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Physical Assessment</Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter physical assessment notes..."
                sx={{ mb: 2 }}
              />
              <Button variant="contained" fullWidth>
                Save Assessment
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Psychology sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Mental Status</Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter mental status notes..."
                sx={{ mb: 2 }}
              />
              <Button variant="contained" fullWidth>
                Save Assessment
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LocalHospital sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Pain Assessment</Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="Pain score (0-10)"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Pain description..."
                sx={{ mb: 2 }}
              />
              <Button variant="contained" fullWidth>
                Record Pain Assessment
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Description sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Nursing Diagnosis</Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter nursing diagnosis..."
                sx={{ mb: 2 }}
              />
              <Button variant="contained" fullWidth>
                Save Diagnosis
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
