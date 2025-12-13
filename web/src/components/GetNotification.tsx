import { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from "@mui/material";

type ResponseStatus = "accepted" | "declined" | null;

type Notification = {
    company: string;
    summary: string;
    mainSkill: string;
};

const GetNotification = () => {
    const [status, setStatus] = useState<ResponseStatus>(null);

    const notification: Notification = {
        company: "Acme Corp",
        summary:
            "Building a new customer-facing dashboard to visualize real-time usage data across the platform.",
        mainSkill: "React",
    };

    const handleRespond = (response: Exclude<ResponseStatus, null>) => {
        setStatus(response);
        console.log(`User responded: ${response}`);
    };

    return (
        <Card variant="outlined">
            <CardContent>
                <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6" sx={{ lineHeight: 1 }}>
                            {notification.company}
                        </Typography>
                        <Chip label={notification.mainSkill} color="primary" size="small" />
                    </Stack>
                    <Typography color="text.secondary">{notification.summary}</Typography>
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
    );
};

export default GetNotification;
