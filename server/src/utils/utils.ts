import { randomUUID } from 'crypto';

export const CANDIDATE_FILE_PATH = 'src/data/candidates.json';

export const generateUUID = function() {
    return randomUUID();
}