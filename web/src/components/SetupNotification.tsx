import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {demoCandidateId, BACKEND_URL, generateUUID} from '../utils/utils.ts';
import {
    Box,
    Button,
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
    const navigate = useNavigate();
    // const candidateId = generateUUID();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const payload = {
            companyNames: companies.split(",").map((c) => c.trim()).filter(Boolean),
            jobRoles: roles.split(",").map((r) => r.trim()).filter(Boolean),
            keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        };

        setIsSubmitting(true);
        try {
            // Dummy API route for now — replace with your real endpoint.
            await axios.post(`${BACKEND_URL}/candidates/${demoCandidateId}/filter`, payload);
            console.log("Notification saved:", payload);
            navigate("/noti/view");
        } catch (error) {
            console.error("Failed to save notification", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Set up notifications
            </Typography>
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
        </Paper>
    );
};

export default SetupNotification;
