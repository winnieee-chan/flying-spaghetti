import { useState, MouseEvent } from "react";
import { Avatar, IconButton, Menu, MenuItem, Stack, Typography, Box } from "@mui/material";
import { useActiveCandidate } from "../context/ActiveCandidateContext";

const colors = ["#1976d2", "#9c27b0", "#ff9800"];

const ActiveCandidateMenu = () => {
    const { candidates, activeCandidate, setActiveCandidate } = useActiveCandidate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <Box>
            <IconButton onClick={handleOpen} size="small" aria-label="Select active candidate">
                <Avatar sx={{ bgcolor: "#1976d2", width: 36, height: 36 }}>
                    {activeCandidate.name.charAt(0)}
                </Avatar>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                {candidates.map((candidate, idx) => (
                    <MenuItem
                        key={candidate.id}
                        selected={candidate.id === activeCandidate.id}
                        onClick={() => {
                            setActiveCandidate(candidate);
                            handleClose();
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar
                                sx={{
                                    bgcolor: colors[idx % colors.length],
                                    width: 32,
                                    height: 32,
                                    fontSize: 14,
                                }}
                            >
                                {candidate.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">{candidate.name}</Typography>
                        </Stack>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export default ActiveCandidateMenu;
