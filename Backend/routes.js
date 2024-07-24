const express = require('express');
const router = express.Router();
const multer = require('multer');
const StockController = require('./Controllers/StockController');
const StockFlacon = require('./Controllers/FlaconController');
const CloudFlare = require('./Controllers/CloudFlare/cloudFlareController');
const VapeController= require('./Controllers/Vapecontroller')
const upload = multer({ dest: 'uploads/' });
const Divers=require('./Controllers/DiversController')
const Credit=require('./Controllers/CreditController')
const Caisse=require('./Controllers/CaisseController')
const Dashboard=require('./Controllers/Dashboard')

router.post("/upload", upload.single("file"), CloudFlare.uploadImage);

router.get("/Dashboard/selectLiquide", async (req, res) => {
  try {
    await Dashboard.selectLiquide(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.post("/Caisse/insertCaisse", async (req, res) => {
  try {
    await Caisse.insertCaisse(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.post("/Caisse/updateCaisse", async (req, res) => {
  try {
    await Caisse.updateCaisse(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.get("/Caisse/selectCaisse", async (req, res) => {
  try {
    await Caisse.selectCaisse(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.get("/Caisse/VenteSuposer", async (req, res) => {
  try {
    await Caisse.VenteSuposer(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.post("/Credit/insertCredit", async (req, res) => {
  try {
    await Credit.insertCredit(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.post("/Credit/insertAvance", async (req, res) => {
  try {
    await Credit.insertAvance(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.get("/Credit/selectAllCredit", async (req, res) => {
  try {
    await Credit.selectAllCredit(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.post("/Divers/insertDivers", async (req, res) => {
  try {
    await Divers.insertDivers(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.post("/Divers/venteDivers", async (req, res) => {
  try {
    await Divers.venteDivers(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.get("/Divers/selectAllDivers", async (req, res) => {
  try {
    await Divers.selectAllDivers(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.post("/VapeController/InsertVape", async (req, res) => {
  try {
    await VapeController.InsertVape(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.get("/VapeController/selectAllVapes", async (req, res) => {
  try {
    await VapeController.selectAllVapes(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.post("/VapeController/VenteVape", async (req, res) => {
  try {
    await VapeController.VenteVape(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.get("/VapeController/selectAllVapesSales", async (req, res) => {
  try {
    await VapeController.selectAllVapesSales(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post("/StockController/InsertStock", async (req, res) => {
  try {
    await StockController.insertStock(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.get("/StockController/selectAllLiquide", async (req, res) => {
  try {
    await StockController.selectAllLiquide(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.post("/StockController/vendreLiquide", async (req, res) => {
  try {
    await StockController.vendreLiquide(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.get("/StockController/selectAllSales", async (req, res) => {
  try {
    await StockController.selectAllSales(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.get("/StockController/selectTopSellingLiquide", async (req, res) => {
  try {
    await StockController.selectTopSellingLiquide(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.post("/StockController/selectTopSellingLiquidebyDay", async (req, res) => {
  try {
    await StockController.selectTopSellingLiquidebyDay(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.get("/StockFlacon/selectAllFlacon", async (req, res) => {
  try {
    await StockFlacon.selectAllFlacon(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.post("/StockFlacon/insertFlacon", async (req, res) => {
  try {
    await StockFlacon.insertFlacon(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.post("/StockController/updateNomLiquide", async (req, res) => {
  try {
    await StockController.updateNomLiquide(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
module.exports = router;
