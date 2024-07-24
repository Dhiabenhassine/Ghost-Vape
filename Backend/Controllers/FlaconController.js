const sequelize = require("../database");
const insertFlacon=async(req,res)=>{
    try{
const {nbrFlaconEmpty,PriceUnitFlacon}=req.body
const PriceFlacon = nbrFlaconEmpty * PriceUnitFlacon;

const queryFlacon=`INSERT INTO StockFlacon (nbrFlaconEmpty,PriceUnitFlacon,PriceFlacon) VALUES (:nbrFlaconEmpty,:PriceUnitFlacon,:PriceFlacon)`
const resultQuery=await sequelize.query(queryFlacon,{
    replacements:{
        nbrFlaconEmpty:nbrFlaconEmpty,
        PriceUnitFlacon:PriceUnitFlacon,
        PriceFlacon:PriceFlacon
    },
    type:sequelize.QueryTypes.INSERT
})
res.status(200).json('insert ok')
    }catch(err){
        res.status(500).send('err insert flacon')
    }
}
const selectAllFlacon=async(req,res)=>{
    try{
const selectAll=`SELECT * FROM StockFlacon`
const resultSelect=await sequelize.query(selectAll,{ type: sequelize.QueryTypes.SELECT })
res.status(200).json(resultSelect)
    }catch(err){
        res.status(500).send('err select')
    }
  }
module.exports={insertFlacon,selectAllFlacon}