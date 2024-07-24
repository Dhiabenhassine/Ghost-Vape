const sequelize = require("../database");

const selectLiquide = async (req, res) => {
    try {
      const querySelectLiquide = `
        SELECT TypeLiquide, COUNT(*) as Count 
        FROM StockLiquide 
        WHERE TypeLiquide IN ('Gourmand', 'Fruite') 
        GROUP BY TypeLiquide
      `;
      const resultQuery = await sequelize.query(querySelectLiquide, {
        type: sequelize.QueryTypes.SELECT
      });
      res.send(resultQuery);
    } catch (err) {
      res.status(500).send('Error selecting');
    }
  };
  

module.exports={
    selectLiquide
}