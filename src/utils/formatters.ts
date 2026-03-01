// Format date helper
export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format resolution helper
export const formatResolution = (width: number, height: number) => {
  if (!width || !height) return "";
  const megapixels = ((width * height) / 1000000).toFixed(1);
  return `${width}x${height}px (${megapixels}MP)`;
};
