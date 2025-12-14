import { Avatar, AvatarGroup, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useActiveCandidate } from "../context/ActiveCandidateContext";

const colors = ["#1976d2", "#9c27b0", "#ff9800"];

const CandidateSwitcher = () => {
    const { candidates, activeCandidate, setActiveCandidate } = useActiveCandidate();

    return (
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
                Active candidate:
            </Typography>
            <AvatarGroup max={4}>
                {candidates.map((candidate, idx) => (
                    <Tooltip key={candidate.id} title={candidate.name}>
                        <IconButton
                            size="small"
                            onClick={() => setActiveCandidate(candidate)}
                            aria-label={`Select ${candidate.name}`}
                            sx={{
                                border: activeCandidate.id === candidate.id ? "2px solid #1976d2" : "1px solid #e0e0e0",
                                p: 0.25,
                            }}
                        >
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
                        </IconButton>
                    </Tooltip>
                ))}
            </AvatarGroup>
            <Typography variant="body2" fontWeight={600}>
                {activeCandidate.name}
            </Typography>
        </Stack>
    );
};

export default CandidateSwitcher;
