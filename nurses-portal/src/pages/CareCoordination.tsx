import { Assignment, Chat, Event, Groups } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";

export default function CareCoordination() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Care Coordination
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Groups sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Team Communication</Typography>
              </Box>
              <Button variant="outlined" fullWidth>
                Open Team Chat
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Event sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Care Conferences</Typography>
              </Box>
              <Button variant="outlined" fullWidth>
                Schedule Conference
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Chat sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Physician Messages</Typography>
              </Box>
              <Button variant="outlined" fullWidth>
                View Messages
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Assignment sx={{ mr: 2, color: "#EC4899" }} />
                <Typography variant="h6">Care Plans</Typography>
              </Box>
              <Button variant="outlined" fullWidth>
                Manage Care Plans
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
