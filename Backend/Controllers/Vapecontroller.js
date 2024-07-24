const sequelize = require("../database");

const InsertVape = async (req, res) => {
  try {
    const { NomVape, PrixAchat, QteStockVape, Type } = req.body;

    const queryVape = `
      INSERT INTO StockVapes (NomVape, PrixAchat, QteStockVape, Type) 
      VALUES (:NomVape, :PrixAchat, :QteStockVape, :Type)
    `;

    await sequelize.query(queryVape, {
      replacements: { NomVape, PrixAchat, QteStockVape, Type },
      type: sequelize.QueryTypes.INSERT,
    });

    res.status(200).json({ message: "Vape inserted successfully" });
  } catch (err) {
    console.error('Error inserting vape:', err);
    res.status(500).send('Error inserting vape');
  }
};
const selectAllVapes=async(req,res)=>{
  try{
const selectVapes=`SELECT * FROM StockVapes`
const resultQuery=await sequelize.query(selectVapes,{type:sequelize.QueryTypes.SELECT})
res.status(200).json(resultQuery)
  }catch(err){
      res.status(500).send('err select')
  }
}

const VenteVape = async (req, res) => {
  try {
    const { NomVape, PrixVente } = req.body;

    // Check if the vape exists in the stock
    const selectVape = `SELECT * FROM StockVapes WHERE NomVape = :NomVape`;
    const resultQuery = await sequelize.query(selectVape, {
      replacements: { NomVape },
      type: sequelize.QueryTypes.SELECT,
    });

    if (resultQuery.length === 0) {
      return res.status(404).json({ message: "Vape not found in stock" });
    }

    const PrixAchat = resultQuery[0].PrixAchat;
    const BeneficeVape = PrixVente - PrixAchat;

    // Insert into SalesVapes table
    const queryVape = `INSERT INTO SalesVapes (NomVape, PrixVente, PrixAchat, BeneficeVape) VALUES (:NomVape, :PrixVente, :PrixAchat, :BeneficeVape)`;
    const resultQueryVape = await sequelize.query(queryVape, {
      replacements: { NomVape, PrixVente, PrixAchat, BeneficeVape },
      type: sequelize.QueryTypes.INSERT,
    });

    // Update the stock quantity
    const currentStock = resultQuery[0].QteStockVape;
    const newStock = currentStock - 1;

    if (newStock < 0) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    if (newStock === 0) {
      const deleteStock = `DELETE FROM StockVapes WHERE ID_Vape = :ID_Vape`;
      await sequelize.query(deleteStock, {
        replacements: { ID_Vape: resultQuery[0].ID_Vape },
        type: sequelize.QueryTypes.DELETE,
      });
    } else {
      const updateStock = `UPDATE StockVapes SET QteStockVape = :QteStockVape WHERE NomVape = :NomVape`;
      await sequelize.query(updateStock, {
        replacements: { QteStockVape: newStock, NomVape },
        type: sequelize.QueryTypes.UPDATE,
      });
    }

    res.status(200).json({ message: "Vape inserted and stock updated" });
  } catch (err) {
    res.status(500).json({ message: 'Error processing request', error: err.message });
  }
};





  const selectAllVapesSales=async(req,res)=>{
    try{
const selectVapes=`SELECT * FROM SalesVapes`
const resultQuery=await sequelize.query(selectVapes,{type:sequelize.QueryTypes.SELECT})
res.status(200).json(resultQuery)
    }catch(err){
        res.status(500).send('err select')
    }
  }

  
  
  
  
module.exports={
    VenteVape,
    selectAllVapesSales,
    InsertVape,
    selectAllVapes
}