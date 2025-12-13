import fs from 'fs/promises';
import path from 'path';

/**
 * Generic function to read and parse a JSON file.
 * @param relativePath - The path to the file relative to the project root (e.g., "data/users.json")
 * @returns The parsed data as type T, or null if reading fails.
 */
export const readJsonFile = async <T>(relativePath: string): Promise<T | null> => {
  try {
    // Construct absolute path based on where the process is running
    const filePath = path.join(process.cwd(), relativePath);
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    return JSON.parse(fileContent) as T;
  } catch (error) {
    console.error(`Error reading file at ${relativePath}:`, error);
    return null;
  }
};