export class Property {
  constructor({ id, title, description, location, price, propertyType, status, images }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.location = location;
    this.price = Number(price) || 0;
    this.propertyType = propertyType;
    this.status = status;
    this.images = Array.isArray(images) ? images : [];
  }

  static fromRaw(raw) {
    if (!raw) return null;

    // Resilient data parsing: handles both "loaction" and "location" typos
    const location = raw.location || raw.loaction || "Unknown Location";

    // Extract images safely from gallery array or images array
    let images = [];
    if (Array.isArray(raw.gallery)) {
      images = raw.gallery
        .map(item => typeof item === 'object' && item !== null ? item.image : item)
        .filter(img => typeof img === 'string' && img.trim() !== "");
    } else if (Array.isArray(raw.images)) {
      images = raw.images.filter(img => typeof img === 'string' && img.trim() !== "");
    } else if (typeof raw.image === 'string' && raw.image.trim() !== "") {
      images = [raw.image];
    }

    return new Property({
      id: raw.name || raw.id,
      title: raw.title || "Untitled Property",
      description: raw.description || "",
      location,
      price: raw.price,
      propertyType: raw.property_type || "Unknown",
      status: raw.status || null,
      images,
    });
  }
}
