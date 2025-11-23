import { Badge, LocalHospital, Person } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

export default function PatientAssignment() {
  const assignments = [
    { patient: "John Doe", room: "203A", acuity: "High", time: "7:00 AM" },
    { patient: "Jane Smith", room: "204B", acuity: "Medium", time: "7:00 AM" },
    { patient: "Robert Johnson", room: "205A", acuity: "Low", time: "7:00 AM" },
    { patient: "Mary Williams", room: "206B", acuity: "High", time: "7:00 AM" },
  ];

  const getAcuityColor = (acuity: string) => {
    switch (acuity) {
      case "High":
        return "error";
      case "Medium":
        return "warning";
      case "Low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Patient Assignment
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Today's Assignments
              </Typography>
              <List>
                {assignments.map((assignment, index) => (
                  <ListItem
                    key={index}
                    sx={{ borderBottom: "1px solid #e0e0e0" }}
                  >
                    <Person sx={{ mr: 2, color: "#EC4899" }} />
                    <ListItemText
                      primary={assignment.patient}
                      secondary={`Room: ${assignment.room} | Shift Start: ${assignment.time}`}
                    />
                    <Chip
                      label={`Acuity: ${assignment.acuity}`}
                      color={getAcuityColor(assignment.acuity)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Badge sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Nurse Info</Typography>
              </Box>
              <Typography>Lisa Anderson, RN</Typography>
              <Typography variant="body2" color="text.secondary">
                Unit: Medical-Surgical
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Shift: Day (7AM - 7PM)
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LocalHospital sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Unit Summary</Typography>
              </Box>
              <Typography variant="body2">Total Patients: 4</Typography>
              <Typography variant="body2">High Acuity: 2</Typography>
              <Typography variant="body2">Medium Acuity: 1</Typography>
              <Typography variant="body2">Low Acuity: 1</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
