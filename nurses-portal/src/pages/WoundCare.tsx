import {
  Assessment,
  CameraAlt,
  Description,
  Healing,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

export default function WoundCare() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Wound Care Documentation
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Healing sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Wound Assessment</Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Wound Type</InputLabel>
                    <Select label="Wound Type">
                      <MenuItem value="pressure">Pressure Ulcer</MenuItem>
                      <MenuItem value="surgical">Surgical</MenuItem>
                      <MenuItem value="trauma">Traumatic</MenuItem>
                      <MenuItem value="diabetic">Diabetic</MenuItem>
                      <MenuItem value="venous">Venous Stasis</MenuItem>
                      <MenuItem value="arterial">Arterial</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Location</InputLabel>
                    <Select label="Location">
                      <MenuItem value="sacrum">Sacrum</MenuItem>
                      <MenuItem value="heel">Heel</MenuItem>
                      <MenuItem value="ankle">Ankle</MenuItem>
                      <MenuItem value="elbow">Elbow</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Length (cm)" type="number" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Width (cm)" type="number" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Depth (cm)" type="number" />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Stage/Grade</InputLabel>
                    <Select label="Stage/Grade">
                      <MenuItem value="1">Stage 1</MenuItem>
                      <MenuItem value="2">Stage 2</MenuItem>
                      <MenuItem value="3">Stage 3</MenuItem>
                      <MenuItem value="4">Stage 4</MenuItem>
                      <MenuItem value="unstageable">Unstageable</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Wound Description"
                    placeholder="Describe appearance, drainage, odor, surrounding tissue..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Treatment Performed"
                    placeholder="Describe cleaning, dressing changes, medications applied..."
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <Button variant="contained" startIcon={<CameraAlt />}>
                  Add Photo
                </Button>
                <Button variant="contained" fullWidth>
                  Save Documentation
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Description sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Quick Notes</Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Additional notes..."
                sx={{ mb: 2 }}
              />
              <Button variant="outlined" fullWidth>
                Save Note
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Assessment sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Healing Progress</Typography>
              </Box>
              <FormControl fullWidth>
                <InputLabel>Healing Status</InputLabel>
                <Select label="Healing Status">
                  <MenuItem value="improving">Improving</MenuItem>
                  <MenuItem value="stable">Stable</MenuItem>
                  <MenuItem value="deteriorating">Deteriorating</MenuItem>
                  <MenuItem value="healed">Healed</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
