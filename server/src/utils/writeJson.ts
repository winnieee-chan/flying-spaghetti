import fs from 'fs/promises';
import path from 'path';

/**
 * Generic function to write data to a JSON file.
 * Overwrites the file with the new data.
 * @param relativePath - The path to the file relative to the project root (e.g., "data/users.json")
 * @param data - The data to write to the file
 */
export const writeJsonFile = async <T>(relativePath: string, data: T): Promise<void> => {
  try {
    const filePath = path.join(process.cwd(), relativePath);
    
    // 'null, 2' creates a pretty-printed JSON (readable format)
    const jsonString = JSON.stringify(data, null, 2);
    
    await fs.writeFile(filePath, jsonString, 'utf-8');
  } catch (error) {
    console.error(`Error writing file at ${relativePath}:`, error);
    throw new Error('Failed to save data to disk');
  }
};
