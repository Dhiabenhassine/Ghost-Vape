const cloudflareUploader = require("../CloudFlare/cloudflareUploader");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucune image n'a été fournie" });
    }

    const imageUrl = await cloudflareUploader.upload(req.file);

    res.json({ imageUrl });
  } catch (error) {
    console.error("Erreur lors de l'upload de l'image :", error);
    res.status(500).json({ error: "Une erreur est survenue lors de l'upload de l'image" });
  }
};
