import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {demoCandidateId, BACKEND_URL, CANDIDATE_API_URL} from '../utils/utils.ts';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

const SetupNotification = () => {
    const [companies, setCompanies] = useState<string>("");
    const [roles, setRoles] = useState<string>("");
    const [keywords, setKeywords] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [candidateName, setCandidateName] = useState<string>("");
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCandidateName = async () => {
            try {
                const { data } = await axios.get<{ full_name?: string }>(
                    `${CANDIDATE_API_URL}/candidates/${demoCandidateId}`
                );
                setCandidateName(data.full_name || "");
            } catch (error) {
                console.error("Failed to fetch candidate info", error);
            }
        };
        fetchCandidateName();
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const payload = {
            companyNames: companies.split(",").map((c) => c.trim()).filter(Boolean),
            jobRoles: roles.split(",").map((r) => r.trim()).filter(Boolean),
            keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        };

        setIsSubmitting(true);
        try {
            await axios.post(`${BACKEND_URL}/candidates/${demoCandidateId}/filter`, payload);
            console.log("Notification saved:", payload);
            setShowSuccess(true);
        } catch (error) {
            console.error("Failed to save notification", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography variant="h5" gutterBottom>
                    Set up notifications
                </Typography>
                {candidateName && (
                    <Typography variant="subtitle1" color="text.secondary">
                        for {candidateName}
                    </Typography>
                )}
            </Stack>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Add the companies, roles, and keywords you want to track. Use commas
                to separate multiple entries.
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                    <TextField
                        label="Company names"
                        placeholder="Acme Corp, Globex, Initech"
                        value={companies}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setCompanies(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Job roles"
                        placeholder="Frontend Engineer, Product Manager"
                        value={roles}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setRoles(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Keywords"
                        placeholder="TypeScript, React, Node.js"
                        value={keywords}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setKeywords(e.target.value)}
                        fullWidth
                    />
                    <Box display="flex" justifyContent="flex-end">
                        <Button variant="contained" type="submit" disabled={isSubmitting}>
                            Save preferences
                        </Button>
                    </Box>
                </Stack>
            </Box>
            <Dialog open={showSuccess} onClose={() => setShowSuccess(false)}>
                <DialogTitle>Notification saved</DialogTitle>
                <DialogContent>
                    <Typography>
                        Notification preferences have been set for {candidateName || "this candidate"}.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowSuccess(false)}>Close</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setShowSuccess(false);
                            navigate("/noti/view");
                        }}
                    >
                        View notifications
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default SetupNotification;
