import api from "@/lib/axios";

export interface PresignResponse {
  key: string;
  uploadUrl: string;
  method: string;
  contentType: string;
}

export const uploadFileToS3 = async (
  file: File,
  folder: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  // Trace file metadata to help debug issues on mobile devices (feedback #2)
  console.log("Trace File Upload details:", {
    name: file.name,
    type: file.type,
    size: file.size,
    folder,
  });

  // Normalize / detect mimetype from extension if blank
  let contentType = file.type;
  if (!contentType || contentType === "application/octet-stream" || contentType === "") {
    const ext = file.name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "jpg":
      case "jpeg":
        contentType = "image/jpeg";
        break;
      case "png":
        contentType = "image/png";
        break;
      case "gif":
        contentType = "image/gif";
        break;
      case "webp":
        contentType = "image/webp";
        break;
      case "mp4":
        contentType = "video/mp4";
        break;
      case "mov":
        contentType = "video/quicktime";
        break;
      default:
        contentType = "application/octet-stream";
    }
  }

  // 1. Get presigned upload URL
  const { data } = await api.post<PresignResponse>("/upload/presign-put", {
    folder,
    fileName: file.name,
    contentType,
    fileSize: file.size,
  });

  const { uploadUrl, key } = data;

  // 2. Perform direct S3 PUT upload via XMLHttpRequest
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      const progress = Math.min(
        100,
        Math.round((event.loaded / event.total) * 100)
      );
      onProgress(progress);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      reject(new Error(`Upload thất bại với mã trạng thái ${xhr.status}`));
    };

    xhr.onerror = () => {
      reject(new Error("Lỗi mạng khi tải tệp lên S3"));
    };

    xhr.send(file);
  });

  return key;
};
