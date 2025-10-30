

import { useState, useCallback } from 'react';

// FIX: Add global declaration to inform TypeScript about the non-standard File System Access API
declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
}

// Check for File System Access API support
const isFileSystemAccessAPISupported = 'showDirectoryPicker' in window;

export const useFileSystem = () => {
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refreshFileList = useCallback(async (handle: FileSystemDirectoryHandle | null) => {
    if (!handle) {
      setFiles([]);
      return;
    }
    const fileList: string[] = [];
    for await (const entry of handle.values()) {
      if (entry.kind === 'file') {
        fileList.push(entry.name);
      }
    }
    setFiles(fileList.sort());
  }, []);

  const loadFolder = useCallback(async () => {
    if (!isFileSystemAccessAPISupported) {
      const message = "Your browser does not support the File System Access API. Please use a modern browser like Chrome or Edge.";
      console.error(message);
      setError(message);
      return;
    }
    try {
      const handle = await window.showDirectoryPicker();
      setDirHandle(handle);
      await refreshFileList(handle);
      setError(null);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.error('Error loading folder:', e);
        setError('Could not load folder. Please check permissions.');
      }
    }
  }, [refreshFileList]);

  const listFiles = useCallback(async (): Promise<string> => {
    if (!dirHandle) {
      return "No folder loaded. Please load a folder to see files.";
    }
    if (files.length === 0) {
      return "The selected folder is empty.";
    }
    return `Files available:\n- ${files.join('\n- ')}`;
  }, [dirHandle, files]);

  const readFile = useCallback(async (fileName: string): Promise<string> => {
    if (!dirHandle) return `Error: No folder loaded.`;
    try {
      const fileHandle = await dirHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (e) {
      console.error(`Error reading file ${fileName}:`, e);
      return `Error: File not found or could not be read: ${fileName}`;
    }
  }, [dirHandle]);

  const writeFile = useCallback(async (fileName: string, content: string): Promise<string> => {
    if (!dirHandle) return `Error: No folder loaded.`;
    try {
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      // Refresh file list if it's a new file
      if (!files.includes(fileName)) {
        await refreshFileList(dirHandle);
      }
      return `Successfully wrote to ${fileName}.`;
    } catch (e) {
      console.error(`Error writing file ${fileName}:`, e);
      return `Error: Could not write to file: ${fileName}. Check permissions.`;
    }
  }, [dirHandle, files, refreshFileList]);

  const getFileContent = readFile;

  return { 
    files, 
    listFiles, 
    readFile, 
    writeFile, 
    getFileContent,
    loadFolder,
    isFolderLoaded: !!dirHandle,
    fsError: error,
    isApiSupported: isFileSystemAccessAPISupported,
  };
};