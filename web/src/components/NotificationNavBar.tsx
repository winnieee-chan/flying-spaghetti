import { Box, Button, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ActiveCandidateMenu from "./ActiveCandidateMenu";

const NotificationNavBar = () => {
    return (
        <Box
            sx={{
                position: "absolute",
                top: 8,
                right: 8,
                display: "flex",
                alignItems: "center",
                gap: 1,
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center">
                <Button
                    size="small"
                    variant="outlined"
                    component={RouterLink}
                    to="/noti/set"
                >
                    Add notification setting
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    component={RouterLink}
                    to="/noti/view"
                >
                    View notification settings
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    component={RouterLink}
                    to="/noti/get"
                >
                    Mailbox
                </Button>
                <ActiveCandidateMenu />
            </Stack>
        </Box>
    );
};

export default NotificationNavBar;
