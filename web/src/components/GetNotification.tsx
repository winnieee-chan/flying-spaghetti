import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useActiveCandidate } from "../context/ActiveCandidateContext";
import { BACKEND_URL } from "../utils/utils.ts";
import NotificationNavBar from "./NotificationNavBar";

type ResponseStatus = "accepted" | "declined" | null;

type MailEntry = {
    date: string | number;
    context: string;
};

const GetNotification = () => {
    const [emails, setEmails] = useState<MailEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { activeCandidate } = useActiveCandidate();

    const fetchNotification = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get<{ emails: MailEntry[] }>(
                `${BACKEND_URL}/candidates/${activeCandidate.id}/notifications`
            );
            setEmails(Array.isArray(data.emails) ? data.emails : []);
        } catch (err) {
            console.error("Failed to fetch mailbox", err);
            setError("Failed to fetch mailbox");
            setEmails([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotification();
    }, [activeCandidate.id]);

    const [status, setStatus] = useState<ResponseStatus>(null);

    const formatDate = (value: string | number) => {
        const numeric = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
        if (!Number.isFinite(numeric)) return String(value);
        return new Date(numeric).toLocaleString();
    };

    const handleRespond = (response: Exclude<ResponseStatus, null>) => {
        setStatus(response);
        console.log(`User responded: ${response}`);
    };

    if (loading) {
        return (
            <Box position="relative" p={3}>
                <NotificationNavBar />
                <Typography variant="body1">Loading mailbox…</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box position="relative" p={3}>
                <NotificationNavBar />
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (!emails.length) {
        return (
            <Box position="relative" p={3}>
                <NotificationNavBar />
                <Typography variant="h4" gutterBottom>
                    Mailbox
                </Typography>
                <Typography color="text.secondary">No notifications in the mailbox yet.</Typography>
            </Box>
        );
    }

    return (
        <Box position="relative" p={3}>
            <NotificationNavBar />
            <Typography variant="h4" gutterBottom>
                Mailbox
            </Typography>
            <Stack spacing={2}>
                {emails.map((email, idx) => (
                    <Card key={`${email.date}-${idx}`} variant="outlined">
                        <CardContent>
                            <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip label={formatDate(email.date)} size="small" />
                                </Stack>
                                <Typography color="text.secondary">{email.context}</Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleRespond("accepted")}
                                        disabled={status === "accepted"}
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleRespond("declined")}
                                        disabled={status === "declined"}
                                    >
                                        Decline
                                    </Button>
                                    {status && (
                                        <Box display="flex" alignItems="center" color="text.secondary">
                                            <Typography variant="body2">
                                                You {status} this notification.
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
};

export default GetNotification;
