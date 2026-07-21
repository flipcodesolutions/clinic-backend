const { ClinicGallery } = require("../models");

const GALLERY_ITEMS = [
  { title: "Hospital Front View", photo: "https://placehold.co/800x500?text=Front+View" },
  { title: "Reception Area", photo: "https://placehold.co/800x500?text=Reception" },
  { title: "OPD Waiting Hall", photo: "https://placehold.co/800x500?text=OPD" },
  { title: "Operation Theatre", photo: "https://placehold.co/800x500?text=OT" },
  { title: "Laboratory", photo: "https://placehold.co/800x500?text=Lab" },
];

/**
 * Gallery images per clinic.
 */
async function seedClinicGalleries(clinics) {
  let createdCount = 0;

  for (const clinic of clinics) {
    for (const item of GALLERY_ITEMS) {
      const [, created] = await ClinicGallery.findOrCreate({
        where: {
          clinic_id: clinic.id,
          title: item.title,
        },
        defaults: {
          clinic_id: clinic.id,
          title: item.title,
          photo: item.photo,
          uploaded_by: null,
        },
      });
      if (created) createdCount += 1;
    }
  }

  console.log(`✓ Clinic gallery photos: ${createdCount} new`);
}

module.exports = { seedClinicGalleries };
