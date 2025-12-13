import { useMemo, useState, ChangeEvent, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

interface Notification {
    id: number;
    companies: string[];
    roles: string[];
    keywords: string[];
}

const ViewNotification = () => {
    const dummyCandidateId = "11234";
    const fetchNotificationSettings = async () => {
        const { data } = await axios.get<Notification[]>(`/candidates/${dummyCandidateId}/settings`);
        setNotifications(Array.isArray(data) ? data : []);
    };
      
    // useEffect(() => { fetchNotifications(); }, []);
      
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: 1,
            companies: ["Acme Corp", "Globex"],
            roles: ["Frontend Engineer", "Product Manager"],
            keywords: ["React", "TypeScript", "Node.js"],
        },
        {
            id: 2,
            companies: ["Initech"],
            roles: ["Backend Engineer"],
            keywords: ["PostgreSQL", "API", "Performance"],
        },
    ]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formValues, setFormValues] = useState({
        companies: "",
        roles: "",
        keywords: "",
    });

    // const dummySettingId = "11234567";

    const editingNotification = useMemo(
        () => notifications.find((n) => n.id === editingId),
        [editingId, notifications]
    );

    const openEdit = (notification: Notification) => {
        setEditingId(notification.id);
        setFormValues({
            companies: notification.companies.join(", "),
            roles: notification.roles.join(", "),
            keywords: notification.keywords.join(", "),
        });
    };

    const closeEdit = () => {
        setEditingId(null);
        setFormValues({ companies: "", roles: "", keywords: "" });
    };

    const handleDelete = async (deletingId: number) => {
        /* const payload = {
            id: deletingId,
        };

        try {
            // Dummy API route for now — replace with your real endpoint.
            await axios.delete(`/settings/${deletingId}`);
            console.log("Notification deleted:", payload);
            await fetchNotifications();
        } catch (error) {
            console.error("Failed to save notification", error);
        } */
        setNotifications((prev) => prev.filter((n) => n.id !== deletingId));
    };

    const handleSave = async () => {
        /* const payload = {
            id: editingId,
        };

        try {
            // Dummy API route for now — replace with your real endpoint.
            await axios.patch(`/settings/${dummySettingId}`, payload);
            console.log("Notification changed:", payload);
            await fetchNotifications();
        } catch (error) {
            console.error("Failed to save notification", error);
        } finally {
            closeEdit();
        } */
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === editingId
                    ? {
                          ...n,
                          companies: formValues.companies
                              .split(",")
                              .map((c) => c.trim())
                              .filter(Boolean),
                          roles: formValues.roles
                              .split(",")
                              .map((r) => r.trim())
                              .filter(Boolean),
                          keywords: formValues.keywords
                              .split(",")
                              .map((k) => k.trim())
                              .filter(Boolean),
                      }
                    : n
            )
        );
        closeEdit();
    };

    if (!notifications.length) {
        return (
            <Box>
                <Typography variant="h4" gutterBottom>
                    Notifications
                </Typography>
                <Typography color="text.secondary">
                    You have not set up any notifications yet.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Notifications
            </Typography>
            <Stack spacing={2}>
                {notifications.map((notification) => (
                    <Card key={notification.id} variant="outlined">
                        <CardContent>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                spacing={2}
                            >
                                <Stack spacing={1.25} flex={1}>
                                    <Stack direction="row" spacing={1} alignItems="flex-start">
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ minWidth: 100, pt: 0.4 }}
                                        >
                                            Companies
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            {notification.companies.map((company) => (
                                                <Chip
                                                    key={company}
                                                    label={company}
                                                    size="small"
                                                    color="secondary"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Stack>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="flex-start">
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ minWidth: 100, pt: 0.4 }}
                                        >
                                            Roles
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            {notification.roles.map((role) => (
                                                <Chip
                                                    key={role}
                                                    label={role}
                                                    size="small"
                                                    color="secondary"
                                                    variant="filled"
                                                />
                                            ))}
                                        </Stack>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="flex-start">
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ minWidth: 100, pt: 0.4 }}
                                        >
                                            Keywords
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            {notification.keywords.map((keyword) => (
                                                <Chip
                                                    key={keyword}
                                                    label={keyword}
                                                    size="small"
                                                    color="primary"
                                                    variant="filled"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                        </Stack>
                                    </Stack>
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => openEdit(notification)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="small"
                                        color="error"
                                        variant="outlined"
                                        onClick={() => handleDelete(notification.id)}
                                    >
                                        Delete
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Stack>

            <Dialog open={Boolean(editingNotification)} onClose={closeEdit} maxWidth="sm" fullWidth>
                <DialogTitle>Edit notification</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Companies"
                            value={formValues.companies}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setFormValues((prev) => ({ ...prev, companies: e.target.value }))
                            }
                            placeholder="Acme Corp, Globex"
                            fullWidth
                        />
                        <TextField
                            label="Roles"
                            value={formValues.roles}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setFormValues((prev) => ({ ...prev, roles: e.target.value }))
                            }
                            placeholder="Frontend Engineer, Product Manager"
                            fullWidth
                        />
                        <TextField
                            label="Keywords"
                            value={formValues.keywords}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setFormValues((prev) => ({ ...prev, keywords: e.target.value }))
                            }
                            placeholder="React, Node.js, API"
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeEdit}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ViewNotification;

