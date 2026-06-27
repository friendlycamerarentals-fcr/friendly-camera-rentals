export async function uploadProductImages(images = [], folder = "products") {
  if (!Array.isArray(images) || images.length === 0) {
    return [];
  }

  const finalUrls = [];

  for (const image of images) {
    if (!image) {
      continue;
    }

    if (typeof image === "string") {
      finalUrls.push(image);
      continue;
    }

    if (image.url) {
      finalUrls.push(image.url);
      continue;
    }

    if (!(image.file instanceof File)) {
      continue;
    }

    const formData = new FormData();
    formData.append("file", image.file);
    formData.append("folder", folder);

    const uploadResponse = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorBody = await uploadResponse.json().catch(() => null);
      throw new Error(
        errorBody?.error || errorBody?.message || "Failed to upload image",
      );
    }

    const uploadResult = await uploadResponse.json();

    if (!uploadResult.success || !uploadResult.url) {
      throw new Error(uploadResult.error || "Failed to upload image");
    }

    finalUrls.push(uploadResult.url);
  }

  return finalUrls.filter(Boolean);
}
