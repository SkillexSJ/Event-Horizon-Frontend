import { useMutation } from "@tanstack/react-query";

interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: string;
    height: string;
    size: number;
    time: string;
    expiration: string;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

const uploadImageToImgbb = async (file: File): Promise<string> => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ImgBB API key is not configured. Please add VITE_IMGBB_API_KEY to your .env file"
    );
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ImgBBResponse = await response.json();

    if (!data.success) {
      throw new Error("Image upload failed");
    }

    // Return the display URL (best quality image URL)
    return data.data.display_url;
  } catch (err) {
    console.error("ImgBB upload error:", err);
    if (err instanceof Error) {
      throw new Error(`Failed to upload image: ${err.message}`);
    }
    throw new Error("Failed to upload image. Please try again.");
  }
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: uploadImageToImgbb,
    onSuccess: () => {
      console.log("Image uploaded successfully to ImgBB");
    },
    onError: (error: Error) => {
      console.error("Image upload failed:", error.message);
    },
  });
};
