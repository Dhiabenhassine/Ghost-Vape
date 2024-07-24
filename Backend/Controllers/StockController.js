const sequelize = require("../database");

const insertStock = async (req, res) => {
  try {
    const { NomLiquide, TypeLiquide, BaseQte, AromeQte, BasePrice, AromePrice } = req.body;

    // Query to get Flacon details
    const querySelectFlacon = `
      SELECT 
        COALESCE(SUM(nbrFlaconEmpty), 0) as totalnbrFlaconEmpty,
        COALESCE(AVG(PriceUnitFlacon), 0) as avgPriceUnitFlacon
      FROM StockFlacon
    `;
    const [flaconResult] = await sequelize.query(querySelectFlacon, { type: sequelize.QueryTypes.SELECT });
    const querySelectLiquide=`SELECT * FROM StockLiquide`
    const resultSelectLiquide=await sequelize.query(querySelectLiquide,{
      type: sequelize.QueryTypes.SELECT
    })
    const nbrFlaconEmpty = flaconResult.totalnbrFlaconEmpty;
    const avgPriceUnitFlacon = parseFloat(flaconResult.avgPriceUnitFlacon).toFixed(2);

    const AromeQtes = AromeQte * 30;
    const liquideVolumFinal = BaseQte + AromeQtes;
    const NbrFlacon = Math.ceil(liquideVolumFinal / 30);
    const baseQte = BaseQte / 1000;
    const BasePrices = BasePrice * baseQte;
    const AromePrices = AromePrice * AromeQte;
    const priceUnitaire = parseFloat(BasePrices + AromePrices + (avgPriceUnitFlacon * NbrFlacon)) / NbrFlacon;
    const priceFixed = priceUnitaire.toFixed(2);

    const Total = parseFloat(BasePrices + AromePrices + (avgPriceUnitFlacon * NbrFlacon));

    // Query to insert new stock
    const queryStock = `
      INSERT INTO StockLiquide 
        (NomLiquide, NbrFlacon, TypeLiquide, BaseQte, AromeQte, BasePrice, AromePrice, FlaconPrice, PriceUnit, LiquideVolum, Total)
      VALUES 
        (:NomLiquide, :NbrFlacon, :TypeLiquide, :BaseQte, :AromeQte, :BasePrice, :AromePrice, :FlaconPrice, :PriceUnit, :LiquideVolum, :Total)
    `;

   const resultQueryStock= await sequelize.query(queryStock, {
      replacements: {
        NomLiquide,
        NbrFlacon,
        TypeLiquide,
        BaseQte,
        AromeQte:AromeQtes,
        BasePrice,
        AromePrice,
        FlaconPrice: avgPriceUnitFlacon,
        PriceUnit: priceFixed,
        LiquideVolum: liquideVolumFinal,
        Total
      },
      type: sequelize.QueryTypes.INSERT
    });

    // Query to get total Flacon
    const querySumFlacon = `SELECT COALESCE(SUM(NbrFlacon), 0) as totalFlacons FROM StockLiquide`;
    const [sumFlaconResult] = await sequelize.query(querySumFlacon, { type: sequelize.QueryTypes.SELECT });
    const totalFlacons = sumFlaconResult.totalFlacons;

    const restFlacon = nbrFlaconEmpty - totalFlacons;
    const TotalFlacon = nbrFlaconEmpty;

    res.status(200).json({ message: 'Insert success', restFlacon, TotalFlacon });

  } catch (err) {
    console.error('Error inserting stock:', err);
    res.status(500).json({ message: 'Error inserting stock', error: err.message });
  }
};


  const selectAllLiquide=async(req,res)=>{
    try{
const selectAll=`SELECT NomLiquide,
    BaseQte,
    AromeQte,
    BasePrice,
    AromePrice,
    FlaconPrice,
    LiquideVolum,
    NbrFlacon,
    TypeLiquide,
    PriceUnit,
    Total,
    created_at FROM StockLiquide`
const resultSelect=await sequelize.query(selectAll,{ type: sequelize.QueryTypes.SELECT })
res.status(200).json(resultSelect)
    }catch(err){
        res.status(500).send('err select')
    }
  }
  const vendreLiquide = async (req, res) => {
    try {
      const { NomLiquide, NbrFlacon, PriceLiquide } = req.body;
  
      // Check if there are available flacons in StockFlacon
      const querySelectFlacon = `SELECT nbrFlaconEmpty FROM StockFlacon LIMIT 1`;
      const flaconResult = await sequelize.query(querySelectFlacon, { type: sequelize.QueryTypes.SELECT });
  
      // Log the full result for debugging
      console.log('Flacon Result:', flaconResult);
  
      if (!flaconResult || flaconResult.length === 0) {
        return res.status(400).send('No flacons available in StockFlacon');
      }
  
      const nbrFlaconEmpty = flaconResult[0].nbrFlaconEmpty;
  
      // Select the specific liquide from StockLiquide
      const selectLiquide = `SELECT * FROM StockLiquide WHERE NomLiquide = :NomLiquide LIMIT 1`;
      const resultSelect = await sequelize.query(selectLiquide, {
        replacements: { NomLiquide },
        type: sequelize.QueryTypes.SELECT
      });
  
      // Log the full result for debugging
      console.log('Liquide Result:', resultSelect);
  
      if (!resultSelect || resultSelect.length === 0) {
        return res.status(404).send('Liquide not found');
      }
  
      const liquide = resultSelect[0];
  
      if (liquide.NbrFlacon < NbrFlacon) {
        return res.status(400).send('Insufficient flacons in stock');
      }
  
      const ProfitLiquides = PriceLiquide - liquide.PriceUnit;
      const PriceUnitSales = liquide.PriceUnit;
      const TotalSales = PriceLiquide * NbrFlacon;
  
      const querySales = `
        INSERT INTO Sales (NomLiquide, NbrFlaconSale, TotalSales, PriceLiquide, ProfitSales, PriceUnitSales) 
        VALUES (:NomLiquide, :NbrFlaconSale, :TotalSales, :PriceLiquide, :ProfitSales, :PriceUnitSales)
      `;
      await sequelize.query(querySales, {
        replacements: { 
          NomLiquide, 
          NbrFlaconSale: NbrFlacon, 
          TotalSales, 
          PriceLiquide, 
          ProfitSales: ProfitLiquides, 
          PriceUnitSales 
        },
        type: sequelize.QueryTypes.INSERT
      });
  
      // Update NbrFlacon by decrementing it by the number of sold flacons
      const updatedNbrFlacon = liquide.NbrFlacon - NbrFlacon;
      if (updatedNbrFlacon <= 0) {
        // Delete record from StockLiquide if NbrFlacon is 0 or less
        const queryDeleteLiquide = `DELETE FROM StockLiquide WHERE ID_Stock = :ID_Stock`;
        await sequelize.query(queryDeleteLiquide, {
          replacements: { ID_Stock: liquide.ID_Stock }
        });
  
        // Update nbrFlaconEmpty in StockFlacon
        const updatedFlaconCount = nbrFlaconEmpty - NbrFlacon;
        const updateQueryFlacon = `
          UPDATE StockFlacon 
          SET nbrFlaconEmpty = :updatedFlaconCount
        `;
        await sequelize.query(updateQueryFlacon, {
          replacements: { updatedFlaconCount },
          type: sequelize.QueryTypes.UPDATE
        });
  
        return res.status(200).json({ message: 'Insert success, record deleted from StockLiquide', updatedFlaconCount });
      } else {
        // Update NbrFlacon if there are remaining flacons
        const updateNbrFlacon = `
          UPDATE StockLiquide
          SET NbrFlacon = :UpdatedNbrFlacon
          WHERE NomLiquide = :NomLiquide
        `;
        await sequelize.query(updateNbrFlacon, {
          replacements: {
            UpdatedNbrFlacon: updatedNbrFlacon,
            NomLiquide
          },
          type: sequelize.QueryTypes.UPDATE
        });
  
     
  
        res.status(200).json({ message: 'Sales success', updatedNbrFlacon });
      }
    } catch (err) {
      console.error('Error selling stock:', err);
      res.status(500).send('Error selling stock');
    }
  };
  
  
  
  
  
  const selectAllSales=async(req,res)=>{
    try{
const querySales=`SELECT * FROM Sales`
const resultSelect=await sequelize.query(querySales,{type:sequelize.QueryTypes.SELECT})
res.status(200).json(resultSelect)
    }catch(err){
      res.status(500).send('err select')
    }
  }
  
  const selectTopSellingLiquide = async (req, res) => {
    try {
      const querySales = `
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as Month, 
          NomLiquide, 
          SUM(NbrFlaconSale) as TotalFlacons
        FROM Sales
        GROUP BY Month, NomLiquide
        ORDER BY TotalFlacons DESC
        LIMIT 10
      `;
      const resultSelect = await sequelize.query(querySales, { type: sequelize.QueryTypes.SELECT });
      res.status(200).json(resultSelect); 
    } catch (err) {
      res.status(500).send('Error selecting top selling liquide by month');
    }
  };
  const selectTopSellingLiquidebyDay = async (req, res) => {
    try {
      const { created_at } = req.body;
      
      const querySales = `
        SELECT 
          NomLiquide, 
          SUM(NbrFlaconSale) as TotalFlacons,
          created_at,
          SUM(PriceUnitSales*NbrFlaconSale) as TotalpriceUnitaire,
          SUM(PriceLiquide*NbrFlaconSale) as TotalPriceLiquide,
          SUM(ProfitSales*NbrFlaconSale) as TotalProfitSales,
          SUM(TotalSales) as TotalSales
        FROM Sales
        WHERE DATE(created_at) = DATE(:created_at)
        GROUP BY NomLiquide, DATE(created_at)
        ORDER BY TotalFlacons DESC
      `;
  
      const resultSelect = await sequelize.query(querySales, {
        type: sequelize.QueryTypes.SELECT,
        replacements: { created_at } 
      });
  
      // Calculate total values
      const total = resultSelect.reduce((acc, curr) => {
        acc.TotalFlacons = (acc.TotalFlacons || 0) + parseInt(curr.TotalFlacons);
        acc.TotalProfitSales = (acc.TotalProfitSales || 0) + parseFloat(curr.TotalProfitSales);
        acc.TotalSales = (acc.TotalSales || 0) + parseFloat(curr.TotalSales);
        return acc;
      }, {});
  
      // Format the total object
      const totalObject = {
        Total: {
          TotalAllFlacons: total.TotalFlacons.toString(),
          TotalAllProfitSales: total.TotalProfitSales.toString(),
          TotalAllSales: total.TotalSales.toString()
        }
      };
  
      // Respond with combined result
      res.status(200).json([...resultSelect, totalObject]);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error selecting top selling liquide');
    }
  };

  const updateNomLiquide = async (req, res) => {
    try {
      const { ID_Stock, NomLiquide } = req.body;
  
      const query = `
        UPDATE StockLiquide
        SET NomLiquide = :NomLiquide
        WHERE ID_Stock = :ID_Stock
      `;
  
      const resultUpdate = await sequelize.query(query, {
        replacements: { ID_Stock: ID_Stock, NomLiquide: NomLiquide },
        type: sequelize.QueryTypes.UPDATE
      });
  
      res.status(200).json('Update success');
    } catch (err) {
      console.error('Error updating NomLiquide:', err);
      res.status(500).send('Error updating NomLiquide');
    }
  };
  
  const updateBaseQte = async (req, res) => {
    try {
      const { ID_Stock, BaseQte } = req.body;
  
      const query = `
        UPDATE StockLiquide
        SET BaseQte = :BaseQte
        WHERE ID_Stock = :ID_Stock
      `;
  
      const resultUpdate = await sequelize.query(query, {
        replacements: { ID_Stock: ID_Stock, BaseQte: BaseQte },
        type: sequelize.QueryTypes.UPDATE
      });
  
      res.status(200).json('Update success');
    } catch (err) {
      console.error('Error updating BaseQte:', err);
      res.status(500).send('Error updating BaseQte');
    }
  }; 
  const updateAromeQte = async (req, res) => {
    try {
      const { ID_Stock, AromeQte } = req.body;
  
      const query = `
        UPDATE StockLiquide
        SET AromeQte = :AromeQte
        WHERE ID_Stock = :ID_Stock
      `;
  
      const resultUpdate = await sequelize.query(query, {
        replacements: { ID_Stock: ID_Stock, AromeQte: AromeQte },
        type: sequelize.QueryTypes.UPDATE
      });
  
      res.status(200).json('Update success');
    } catch (err) {
      console.error('Error updating AromeQte:', err);
      res.status(500).send('Error updating AromeQte');
    }
  }; 
  
  const updateBasePrice = async (req, res) => {
    try {
      const { ID_Stock, BasePrice } = req.body;
  
      const query = `
        UPDATE StockLiquide
        SET BasePrice = :BasePrice
        WHERE ID_Stock = :ID_Stock
      `;
  
      const resultUpdate = await sequelize.query(query, {
        replacements: { ID_Stock: ID_Stock, BasePrice: BasePrice },
        type: sequelize.QueryTypes.UPDATE
      });
  
      res.status(200).json('Update success');
    } catch (err) {
      console.error('Error updating BasePrice:', err);
      res.status(500).send('Error updating BasePrice');
    }
  }; 
  
  const updateAromePrice = async (req, res) => {
    try {
      const { ID_Stock, AromePrice } = req.body;
  
      const query = `
        UPDATE StockLiquide
        SET AromePrice = :AromePrice
        WHERE ID_Stock = :ID_Stock
      `;
  
      const resultUpdate = await sequelize.query(query, {
        replacements: { ID_Stock: ID_Stock, AromePrice: AromePrice },
        type: sequelize.QueryTypes.UPDATE
      });
  
      res.status(200).json('Update success');
    } catch (err) {
      console.error('Error updating AromePrice:', err);
      res.status(500).send('Error updating AromePrice');
    }
  };
  
  
module.exports={
    insertStock,
    selectAllLiquide,
    vendreLiquide,
    selectAllSales,
    selectTopSellingLiquide,
    selectTopSellingLiquidebyDay,
    updateNomLiquide,
    updateBaseQte,
    updateAromeQte,
    updateBasePrice,
    updateAromePrice
}