
import { useState, useCallback } from 'react';
import { FileNode } from '../types';

export const useFileSystem = (initialFiles: FileNode[] = []) => {
  const [files, setFiles] = useState<Map<string, string>>(
    new Map(initialFiles.map(file => [file.name, file.content]))
  );

  const listFiles = useCallback(async (): Promise<string> => {
    if (files.size === 0) {
      return "No files in the directory.";
    }
    return `Files available:\n- ${Array.from(files.keys()).join('\n- ')}`;
  }, [files]);

  const readFile = useCallback(async (fileName: string): Promise<string> => {
    if (files.has(fileName)) {
      return files.get(fileName) || '';
    }
    return `Error: File not found: ${fileName}`;
  }, [files]);

  const writeFile = useCallback(async (fileName: string, content: string): Promise<string> => {
    setFiles(prevFiles => {
      const newFiles = new Map(prevFiles);
      newFiles.set(fileName, content);
      return newFiles;
    });
    return `Successfully wrote to ${fileName}.`;
  }, []);
  
  const getFiles = useCallback(() => Array.from(files.keys()), [files]);

  const getFileContent = useCallback((fileName: string) => files.get(fileName), [files]);

  return { files: getFiles(), listFiles, readFile, writeFile, getFileContent, setFiles };
};
