const sequelize = require("../database");

const insertCaisse=async(req,res)=>{
    try{
const{CaisseDebut}=req.body
const queryInsert=`INSERT INTO Caisse (CaisseDebut)VALUES(:CaisseDebut)`
const resultQuery=await sequelize.query(queryInsert,{
    replacements:{CaisseDebut},
    type: sequelize.QueryTypes.INSERT
})
res.status(200).json({message:"Caisse enregistré avec succès"})
    }catch(err){
        res.status(500).send('err insert')
    }
}
const selectCaisse=async(req,res)=>{
    try{
const querySelect=`SELECT * FROM Caisse`
const resultQuery=await sequelize.query(querySelect,{
    type: sequelize.QueryTypes.SELECT
    })
    res.status(200).json(resultQuery)
    }catch(err){
        res.status(500).send('err select')
    }
}
const updateCaisse = async (req, res) => {
    try {
      const { ID_Caisee, CaisseFin } = req.body;
      
      const selectCaisse = `SELECT * FROM Caisse WHERE ID_Caisee = :ID_Caisee`;
      const resultQuery = await sequelize.query(selectCaisse, {
        replacements: { ID_Caisee },
        type: sequelize.QueryTypes.SELECT,
      });
  
      if (resultQuery.length > 0) {
        const benefice = CaisseFin - resultQuery[0].CaisseDebut;
  
        const queryUpdate = `UPDATE Caisse SET CaisseFin = :CaisseFin, BeneficeCaisse = :BeneficeCaisse WHERE ID_Caisee = :ID_Caisee`;
        await sequelize.query(queryUpdate, {
          replacements: { CaisseFin, BeneficeCaisse: benefice, ID_Caisee },
          type: sequelize.QueryTypes.UPDATE,
        });
  
        res.status(200).json({ message: "Caisse modifié avec succès" });
      } else {
        res.status(404).json({ message: "Caisse not found" });
      }
    } catch (err) {
      res.status(500).send('Error updating caisse');
    }
  };
const VenteSuposer=async(req,res)=>{
  try{

      const selectVenteTotal=`SELECT SUM(TotalSales)AS TotalSalesLiquide,
      SUM(PrixVente)AS TotalSalesVapes,
      SUM(Total)AS TotalSalesDivers FROM Sales,SalesVapes,Divers WHERE created_at = NOW()`
      const resultQueryTotal=await sequelize.query(selectVenteTotal,{
        type: sequelize.QueryTypes.SELECT
        })
res.status(200).send(resultQueryTotal)
  }catch(err){
    res.status(500).send('err select')
  }
}
module.exports={
    insertCaisse,
    selectCaisse,
    updateCaisse,
    VenteSuposer
}