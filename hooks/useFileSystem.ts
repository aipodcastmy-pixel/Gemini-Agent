import { useState, useCallback, useEffect } from 'react';

// Add global declaration for the platform-specific File System Access API
declare global {
  interface AIStudio {
    selectDirectory: () => Promise<FileSystemDirectoryHandle>;
  }

  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
    aistudio?: AIStudio;
  }
}

const isApiSupported = !!window.aistudio?.selectDirectory;

export const useFileSystem = () => {
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [virtualFiles, setVirtualFiles] = useState<Map<string, string>>(new Map());
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refreshLocalFileList = useCallback(async (handle: FileSystemDirectoryHandle) => {
    const fileList: string[] = [];
    for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
            fileList.push(entry.name);
        }
    }
    setFiles(fileList.sort());
  }, []);

  useEffect(() => {
    if (dirHandle) {
        refreshLocalFileList(dirHandle);
    } else {
        setFiles(Array.from(virtualFiles.keys()).sort());
    }
  }, [dirHandle, virtualFiles, refreshLocalFileList]);

  const loadFolder = useCallback(async () => {
    if (!isApiSupported || !window.aistudio) {
      const message = "This feature is not supported in the current environment.";
      console.error(message);
      setError(message);
      return;
    }
    try {
      const handle = await window.aistudio.selectDirectory();
      setVirtualFiles(new Map()); // Switch to local mode, clear virtual files
      setDirHandle(handle);
      setError(null);
      // useEffect will refresh the file list
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.error('Error loading folder:', e);
        const errorMessage = "Could not load folder. Please check permissions.";
        setError(errorMessage);
      }
    }
  }, [refreshLocalFileList]);

  const listFiles = useCallback(async (): Promise<string> => {
    if (files.length === 0) {
      return "The file system is empty.";
    }
    return `Files available:\n- ${files.join('\n- ')}`;
  }, [files]);

  const readFile = useCallback(async (fileName: string): Promise<string> => {
    if (dirHandle) { // Local mode
      try {
        const fileHandle = await dirHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        return await file.text();
      } catch (e) {
        console.error(`Error reading local file ${fileName}:`, e);
        return `Error: File not found or could not be read: ${fileName}`;
      }
    } else { // Virtual mode
      if (virtualFiles.has(fileName)) {
        return virtualFiles.get(fileName)!;
      }
      return `Error: Virtual file not found: ${fileName}`;
    }
  }, [dirHandle, virtualFiles]);

  const writeFile = useCallback(async (fileName: string, content: string): Promise<string> => {
    if (dirHandle) { // Local mode
      try {
        const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        await refreshLocalFileList(dirHandle);
        return `Successfully wrote to ${fileName}.`;
      } catch (e) {
        console.error(`Error writing local file ${fileName}:`, e);
        return `Error: Could not write to file: ${fileName}. Check permissions.`;
      }
    } else { // Virtual mode
      setVirtualFiles(prev => new Map(prev).set(fileName, content));
      return `Successfully wrote to virtual file ${fileName}.`;
    }
  }, [dirHandle, refreshLocalFileList]);

  return { 
    files, 
    listFiles, 
    readFile, 
    writeFile, 
    getFileContent: readFile,
    loadFolder,
    isFolderLoaded: !!dirHandle,
    fsError: error,
    isApiSupported: isApiSupported,
  };
};