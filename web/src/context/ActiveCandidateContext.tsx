import { createContext, useContext, useMemo, useState, ReactNode } from "react";

type CandidateOption = {
    id: string;
    name: string;
};

type ActiveCandidateContextValue = {
    candidates: CandidateOption[];
    activeCandidate: CandidateOption;
    setActiveCandidate: (candidate: CandidateOption) => void;
};

const candidateOptions: CandidateOption[] = [
    { id: "550e8400-e29b-41d4-a716-446655440001", name: "Alex Chen" },
    { id: "550e8400-e29b-41d4-a716-446655440002", name: "Sarah O'Connor" },
    { id: "550e8400-e29b-41d4-a716-446655440003", name: "David Nguyen" },
];

const ActiveCandidateContext = createContext<ActiveCandidateContextValue | undefined>(undefined);

export const ActiveCandidateProvider = ({ children }: { children: ReactNode }) => {
    const [activeCandidate, setActiveCandidate] = useState<CandidateOption>(candidateOptions[0]);

    const value = useMemo(
        () => ({
            candidates: candidateOptions,
            activeCandidate,
            setActiveCandidate,
        }),
        [activeCandidate]
    );

    return (
        <ActiveCandidateContext.Provider value={value}>
            {children}
        </ActiveCandidateContext.Provider>
    );
};

export const useActiveCandidate = () => {
    const ctx = useContext(ActiveCandidateContext);
    if (!ctx) {
        throw new Error("useActiveCandidate must be used within ActiveCandidateProvider");
    }
    return ctx;
};
