const serviceImages: Record<string, string> = {
  "Manicure": "/images/services/manicure.jpg",
  "Pedicure": "/images/services/pedicure.jpg",
  "Relaxing Massage": "/images/services/relaxing-massage.jpg",
  "Haircut & Styling": "/images/services/haircut-styling.jpg",
  "Beard Trim & Shape": "/images/services/beard-trim-shape.jpg",
  "Hair Coloring": "/images/services/hair-coloring.jpg",
  "Hair Treatment": "/images/services/hair-treatment.jpg",
  "Facial & Skincare": "/images/services/facial-skincare.jpg",
  "Bridal Makeup": "/images/services/bridal-makeup.jpg",
  "Hair Wash": "/images/services/hair-wash.jpg",
};

const categoryImages: Record<string, string> = {
  Nails: serviceImages.Manicure,
  "Spa & Massage": serviceImages["Relaxing Massage"],
  Hair: serviceImages["Haircut & Styling"],
  "Beard & Grooming": serviceImages["Beard Trim & Shape"],
  "Hair Color": serviceImages["Hair Coloring"],
  "Hair Treatments": serviceImages["Hair Treatment"],
  "Skin & Facial": serviceImages["Facial & Skincare"],
  Makeup: serviceImages["Bridal Makeup"],
};

export function getServiceImage(serviceName: string, uploadedImage: string): string {
  const localImage = serviceImages[serviceName];
  return localImage && (!uploadedImage || isImgBBUrl(uploadedImage)) ? localImage : uploadedImage || localImage || "";
}

export function getCategoryImage(categoryName: string, uploadedImage: string): string {
  const localImage = categoryImages[categoryName];
  return localImage && (!uploadedImage || isImgBBUrl(uploadedImage)) ? localImage : uploadedImage || localImage || "";
}

function isImgBBUrl(value: string): boolean {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "ibb.co" || host.endsWith(".ibb.co") || host === "imgbb.com" || host.endsWith(".imgbb.com");
  } catch {
    return false;
  }
}
