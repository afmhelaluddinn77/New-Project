import {
  AutoAwesome,
  CheckCircle,
  ContentCopy,
  Description,
  History,
  Info,
  LocalHospital,
  Psychology,
  Refresh,
  Save,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";

export interface CodeSuggestion {
  code: string;
  description: string;
  confidence: number;
  rationale?: string;
}

export interface AiCodingResult {
  icd10Codes: CodeSuggestion[];
  cptCodes: CodeSuggestion[];
  modifiers: Array<{ modifier: string; reason: string }>;
  overallConfidence: number;
  processingTime?: number;
}

interface AiCodingSuggestionsProps {
  onGenerateSuggestions: (
    clinicalText: string,
    serviceType?: string,
    specialty?: string
  ) => Promise<AiCodingResult>;
  onAcceptSuggestion: (type: "icd10" | "cpt", code: string) => void;
  onRejectSuggestion: (type: "icd10" | "cpt", code: string) => void;
  onShowNotification: (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => void;
}

export default function AiCodingSuggestions({
  onGenerateSuggestions,
  onAcceptSuggestion,
  onRejectSuggestion,
  onShowNotification,
}: AiCodingSuggestionsProps) {
  const [clinicalText, setClinicalText] = useState("");
  const [serviceType, setServiceType] = useState("office-visit");
  const [specialty, setSpecialty] = useState("internal-medicine");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AiCodingResult | null>(null);
  const [selectedCodes, setSelectedCodes] = useState<{
    icd10: string[];
    cpt: string[];
  }>({ icd10: [], cpt: [] });
  const [history, setHistory] = useState<
    Array<{
      timestamp: string;
      text: string;
      result: AiCodingResult;
    }>
  >([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const handleGenerateSuggestions = async () => {
    if (!clinicalText.trim()) {
      onShowNotification("Please enter clinical documentation", "warning");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      const result = await new Promise<AiCodingResult>((resolve) => {
        setTimeout(() => {
          resolve({
            icd10Codes: [
              {
                code: "I10",
                description: "Essential (primary) hypertension",
                confidence: 0.92,
                rationale: "Patient history indicates hypertension diagnosis",
              },
              {
                code: "E11.9",
                description: "Type 2 diabetes mellitus without complications",
                confidence: 0.85,
                rationale: "Mentioned diabetes management in clinical notes",
              },
              {
                code: "Z79.84",
                description:
                  "Long term (current) use of oral hypoglycemic drugs",
                confidence: 0.78,
                rationale: "Patient on metformin per documentation",
              },
            ],
            cptCodes: [
              {
                code: "99214",
                description:
                  "Office visit, established patient, moderate complexity",
                confidence: 0.88,
                rationale: "Moderate complexity based on multiple conditions",
              },
              {
                code: "36415",
                description: "Collection of venous blood by venipuncture",
                confidence: 0.75,
                rationale: "Lab work mentioned in documentation",
              },
            ],
            modifiers: [
              {
                modifier: "25",
                reason: "Significant, separately identifiable E/M service",
              },
            ],
            overallConfidence: 0.85,
            processingTime: 1250,
          });
        }, 1500);
      });

      setSuggestions(result);
      setHistory([
        {
          timestamp: new Date().toISOString(),
          text: clinicalText,
          result,
        },
        ...history.slice(0, 9),
      ]);
      onShowNotification("AI suggestions generated successfully", "success");
    } catch (error) {
      onShowNotification("Failed to generate suggestions", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSelection = (type: "icd10" | "cpt", code: string) => {
    const isSelected = selectedCodes[type].includes(code);
    if (isSelected) {
      setSelectedCodes({
        ...selectedCodes,
        [type]: selectedCodes[type].filter((c) => c !== code),
      });
    } else {
      setSelectedCodes({
        ...selectedCodes,
        [type]: [...selectedCodes[type], code],
      });
    }
  };

  const handleAcceptAll = () => {
    if (suggestions) {
      suggestions.icd10Codes.forEach((s) =>
        onAcceptSuggestion("icd10", s.code)
      );
      suggestions.cptCodes.forEach((s) => onAcceptSuggestion("cpt", s.code));
      onShowNotification("All suggestions accepted", "success");
    }
  };

  const handleAcceptSelected = () => {
    selectedCodes.icd10.forEach((code) => onAcceptSuggestion("icd10", code));
    selectedCodes.cpt.forEach((code) => onAcceptSuggestion("cpt", code));
    onShowNotification(
      `${selectedCodes.icd10.length + selectedCodes.cpt.length} codes accepted`,
      "success"
    );
    setSelectedCodes({ icd10: [], cpt: [] });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    onShowNotification(`Code ${code} copied to clipboard`, "info");
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return "success.main";
    if (confidence >= 0.6) return "warning.main";
    return "error.main";
  };

  const exampleTemplates = [
    {
      title: "Hypertension Follow-up",
      text: "Patient presents for follow-up of essential hypertension. BP today 145/90. Patient reports compliance with medication. No chest pain, shortness of breath. Continue current medication regimen.",
    },
    {
      title: "Diabetes Management",
      text: "Type 2 diabetes mellitus follow-up. HbA1c 7.2%. Patient on metformin 1000mg BID. Blood glucose logs reviewed. Discussed diet and exercise. No neuropathy or retinopathy symptoms.",
    },
    {
      title: "Annual Physical",
      text: "Annual preventive exam for 55-year-old male. Review of systems negative. Vital signs stable. Ordered routine labs including lipid panel, CMP, and CBC. Discussed preventive care guidelines.",
    },
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              <Psychology sx={{ verticalAlign: "middle", mr: 1 }} />
              Clinical Documentation
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Quick Templates:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                {exampleTemplates.map((template, index) => (
                  <Chip
                    key={index}
                    label={template.title}
                    size="small"
                    onClick={() => setClinicalText(template.text)}
                    clickable
                  />
                ))}
              </Box>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={8}
              label="Enter Clinical Documentation"
              value={clinicalText}
              onChange={(e) => setClinicalText(e.target.value)}
              placeholder="Enter patient symptoms, diagnosis, procedures performed, and any relevant clinical information..."
              sx={{ mb: 2 }}
            />

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Service Type</InputLabel>
                  <Select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    label="Service Type"
                  >
                    <MenuItem value="office-visit">Office Visit</MenuItem>
                    <MenuItem value="consultation">Consultation</MenuItem>
                    <MenuItem value="preventive">Preventive Care</MenuItem>
                    <MenuItem value="procedure">Procedure</MenuItem>
                    <MenuItem value="emergency">Emergency</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Specialty</InputLabel>
                  <Select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    label="Specialty"
                  >
                    <MenuItem value="internal-medicine">
                      Internal Medicine
                    </MenuItem>
                    <MenuItem value="family-practice">Family Practice</MenuItem>
                    <MenuItem value="cardiology">Cardiology</MenuItem>
                    <MenuItem value="orthopedics">Orthopedics</MenuItem>
                    <MenuItem value="psychiatry">Psychiatry</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                startIcon={<AutoAwesome />}
                onClick={handleGenerateSuggestions}
                disabled={isLoading || !clinicalText.trim()}
                fullWidth
              >
                Generate AI Suggestions
              </Button>
              <Button
                variant="outlined"
                startIcon={<History />}
                onClick={() => setHistoryDialogOpen(true)}
                disabled={history.length === 0}
              >
                History
              </Button>
            </Box>

            {isLoading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Analyzing clinical documentation...
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">
                <AutoAwesome sx={{ verticalAlign: "middle", mr: 1 }} />
                AI Coding Suggestions
              </Typography>
              {suggestions && (
                <Chip
                  label={`Confidence: ${(suggestions.overallConfidence * 100).toFixed(0)}%`}
                  color={
                    suggestions.overallConfidence >= 0.8 ? "success" : "warning"
                  }
                  size="small"
                />
              )}
            </Box>

            {!suggestions ? (
              <Alert severity="info">
                Enter clinical documentation and click "Generate AI Suggestions"
                to receive coding recommendations
              </Alert>
            ) : (
              <Box>
                {/* ICD-10 Codes */}
                <Typography variant="subtitle2" gutterBottom>
                  <LocalHospital
                    sx={{ verticalAlign: "middle", mr: 1, fontSize: 18 }}
                  />
                  ICD-10 Diagnosis Codes
                </Typography>
                <List dense sx={{ mb: 2 }}>
                  {suggestions.icd10Codes.map((suggestion, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: selectedCodes.icd10.includes(suggestion.code)
                          ? "action.selected"
                          : "transparent",
                      }}
                      onClick={() =>
                        handleCodeSelection("icd10", suggestion.code)
                      }
                    >
                      <ListItemIcon>
                        <Chip
                          label={suggestion.code}
                          size="small"
                          color="primary"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={suggestion.description}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {suggestion.rationale}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={suggestion.confidence * 100}
                              sx={{
                                mt: 0.5,
                                height: 4,
                                borderRadius: 2,
                                bgcolor: "grey.300",
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: getConfidenceColor(
                                    suggestion.confidence
                                  ),
                                },
                              }}
                            />
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Copy code">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(suggestion.code);
                            }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                {/* CPT Codes */}
                <Typography variant="subtitle2" gutterBottom>
                  <Description
                    sx={{ verticalAlign: "middle", mr: 1, fontSize: 18 }}
                  />
                  CPT Procedure Codes
                </Typography>
                <List dense sx={{ mb: 2 }}>
                  {suggestions.cptCodes.map((suggestion, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: selectedCodes.cpt.includes(suggestion.code)
                          ? "action.selected"
                          : "transparent",
                      }}
                      onClick={() =>
                        handleCodeSelection("cpt", suggestion.code)
                      }
                    >
                      <ListItemIcon>
                        <Chip
                          label={suggestion.code}
                          size="small"
                          color="secondary"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={suggestion.description}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {suggestion.rationale}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={suggestion.confidence * 100}
                              sx={{
                                mt: 0.5,
                                height: 4,
                                borderRadius: 2,
                                bgcolor: "grey.300",
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: getConfidenceColor(
                                    suggestion.confidence
                                  ),
                                },
                              }}
                            />
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Copy code">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(suggestion.code);
                            }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                {/* Modifiers */}
                {suggestions.modifiers && suggestions.modifiers.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Suggested Modifiers
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {suggestions.modifiers.map((modifier, index) => (
                        <Tooltip key={index} title={modifier.reason}>
                          <Chip
                            label={`Modifier ${modifier.modifier}`}
                            size="small"
                            variant="outlined"
                            icon={<Info fontSize="small" />}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </>
                )}

                {/* Actions */}
                <Box display="flex" gap={1} mt={3}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={handleAcceptAll}
                    size="small"
                  >
                    Accept All
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Save />}
                    onClick={handleAcceptSelected}
                    disabled={
                      selectedCodes.icd10.length === 0 &&
                      selectedCodes.cpt.length === 0
                    }
                    size="small"
                  >
                    Accept Selected (
                    {selectedCodes.icd10.length + selectedCodes.cpt.length})
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => {
                      setSuggestions(null);
                      setSelectedCodes({ icd10: [], cpt: [] });
                    }}
                    size="small"
                  >
                    Clear
                  </Button>
                </Box>

                {suggestions.processingTime && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Generated in {suggestions.processingTime}ms
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* History Dialog */}
      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Suggestion History</DialogTitle>
        <DialogContent>
          <List>
            {history.map((item, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={item.text.substring(0, 100) + "..."}
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block">
                        {new Date(item.timestamp).toLocaleString()}
                      </Typography>
                      <Box display="flex" gap={1} mt={0.5}>
                        <Chip
                          label={`ICD-10: ${item.result.icd10Codes.length}`}
                          size="small"
                        />
                        <Chip
                          label={`CPT: ${item.result.cptCodes.length}`}
                          size="small"
                        />
                        <Chip
                          label={`${(item.result.overallConfidence * 100).toFixed(0)}% confidence`}
                          size="small"
                          color={
                            item.result.overallConfidence >= 0.8
                              ? "success"
                              : "warning"
                          }
                        />
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Button
                    size="small"
                    onClick={() => {
                      setClinicalText(item.text);
                      setSuggestions(item.result);
                      setHistoryDialogOpen(false);
                    }}
                  >
                    Load
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
