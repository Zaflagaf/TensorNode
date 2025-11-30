interface Window {
  showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
}

interface FileSystemDirectoryHandle {
  kind: "directory";
  name: string;
  entries: () => AsyncIterableIterator<[string, FileSystemHandle]>;
  values: () => AsyncIterableIterator<FileSystemHandle>;
  keys: () => AsyncIterableIterator<string>;
  getFileHandle: (name: string, options?: any) => Promise<FileSystemFileHandle>;
  getDirectoryHandle: (name: string, options?: any) => Promise<FileSystemDirectoryHandle>;
}

interface FileSystemFileHandle {
  kind: "file";
  name: string;
  getFile: () => Promise<File>;
}

interface FileSystemHandle {
  kind: "file" | "directory";
  name: string;
}
