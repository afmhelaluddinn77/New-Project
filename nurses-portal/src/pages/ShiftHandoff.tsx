import { AccessTime, Assignment, SwapHoriz } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";

export default function ShiftHandoff() {
  const handoffItems = [
    {
      patient: "John Doe - Room 203A",
      status: "Pain medication due at 8 PM",
      priority: "High",
    },
    {
      patient: "Jane Smith - Room 204B",
      status: "IV needs replacement",
      priority: "Medium",
    },
    {
      patient: "Robert Johnson - Room 205A",
      status: "Discharge pending",
      priority: "Low",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Shift Handoff Report
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <SwapHoriz sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">SBAR Handoff Report</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Situation
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Current patient situation..."
                  sx={{ mb: 2 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Background
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Relevant background information..."
                  sx={{ mb: 2 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Assessment
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Current assessment..."
                  sx={{ mb: 2 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Recommendation
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Recommendations for next shift..."
                  sx={{ mb: 2 }}
                />
              </Box>

              <Button variant="contained" fullWidth>
                Save Handoff Report
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AccessTime sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Shift Info</Typography>
              </Box>
              <Typography variant="body2">
                Current Shift: Day (7AM - 7PM)
              </Typography>
              <Typography variant="body2">
                Next Shift: Night (7PM - 7AM)
              </Typography>
              <Typography variant="body2">Handoff Time: 6:45 PM</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Assignment sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Priority Items</Typography>
              </Box>
              <List dense>
                {handoffItems.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.patient}
                      secondary={item.status}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
