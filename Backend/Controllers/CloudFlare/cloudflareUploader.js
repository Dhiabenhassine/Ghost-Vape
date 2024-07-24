
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

exports.upload = async (file) => {
  try {
    const uploadUrl = "https://api.cloudflare.com/client/v4/accounts/3e4a2e1358c7256b2571939d9220677d0d470/images/v1"; 

    const formData = new FormData();
    formData.append("file", fs.createReadStream(file.path));

    const response = await axios.post(uploadUrl, formData, {
      headers: {
        Authorization: "Bearer As5k7aQ1xRNKn8VzQnpB6Ikr3p61qp_CfcCTVTDL", 
        ...formData.getHeaders(),
      },
    });

    console.log("Cloudflare API response:", response.data);

    if (response.data.success && response.data.result.variants) {
      const imageUrl = response.data.result.variants[0];
      return imageUrl;
    } else {
      throw new Error("Cloudflare API response does not contain image URL");
    }
  } catch (error) {
    console.error("Error uploading image to Cloudflare:", error);
    throw new Error("Error uploading image to Cloudflare");
  }
};
