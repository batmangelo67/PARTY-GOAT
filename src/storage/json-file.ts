const JSON_MIME = "application/json";

// Prefer the share sheet (iOS home-screen apps can't always download), fall back to a download link.
export async function saveJsonFile(fileName: string, json: string): Promise<void> {
  const file = new File([json], fileName, { type: JSON_MIME });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      throw error;
    }
  }
  const url = URL.createObjectURL(file);
  const link = Object.assign(document.createElement("a"), { href: url, download: file.name });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function datedFileName(prefix: string): string {
  return `${prefix}-${new Date().toISOString().slice(0, 10)}.json`;
}
