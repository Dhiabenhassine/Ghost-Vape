const sequelize = require("../database");

const insertCredit = async (req, res) => {
    try {
        const { Nom, ArticleVendu,Qte, Avance, PrixVente, PrixAchat } = req.body;

        if (!Nom || !ArticleVendu||!Qte || !Avance || !PrixVente || !PrixAchat) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const totalprixAchat=Qte*PrixAchat
        const totalprixVendut=Qte*PrixVente

        const rest = totalprixVendut - Avance;
        const benefice = totalprixVendut - totalprixAchat;

        // Select queries to check for existing stock
        const selectQueryVape = `SELECT * FROM StockVapes WHERE NomVape=:ArticleVendu`;
        const resultSelectVape = await sequelize.query(selectQueryVape, {
            replacements: { ArticleVendu },
            type: sequelize.QueryTypes.SELECT,
        });

        const selectQueryLiquide = `SELECT * FROM StockLiquide WHERE NomLiquide=:ArticleVendu`;
        const resultSelectLiquide = await sequelize.query(selectQueryLiquide, {
            replacements: { ArticleVendu },
            type: sequelize.QueryTypes.SELECT,
        });

        const selectQueryDivers = `SELECT * FROM Divers WHERE Article=:ArticleVendu`;
        const resultSelectDivers = await sequelize.query(selectQueryDivers, {
            replacements: { ArticleVendu },
            type: sequelize.QueryTypes.SELECT,
        });

        // Insert into Credit table if the article exists in any of the stock tables
        if (resultSelectDivers.length > 0 || resultSelectLiquide.length > 0 || resultSelectVape.length > 0) {
            const queryCredit = `
                INSERT INTO Credit (Nom, ArticleVendu,Qte, PrixAchat, Credit, PrixVente, Avance, Benefice, created_at) 
                VALUES (:Nom, :ArticleVendu,:Qte, :PrixAchat, :Credit, :PrixVente, :Avance, :Benefice, NOW())
            `;

            const resultQueryCredit = await sequelize.query(queryCredit, {
                replacements: {
                    Nom,
                    ArticleVendu,
                    Qte,
                    PrixAchat,
                    Credit: rest,
                    PrixVente,
                    Avance,
                    Benefice: benefice
                },
                type: sequelize.QueryTypes.INSERT
            });

            if (resultQueryCredit) {
                if (resultSelectVape.length > 0) {
                    const updateVape = `UPDATE StockVapes SET QteStockVape = QteStockVape - 1 WHERE NomVape = :ArticleVendu`;
                    await sequelize.query(updateVape, {
                        replacements: { ArticleVendu },
                        type: sequelize.QueryTypes.UPDATE
                    });
                }

                if (resultSelectLiquide.length > 0) {
                    const updateLiquide = `UPDATE StockLiquide SET NbrFlacon = NbrFlacon - 1 WHERE NomLiquide = :ArticleVendu`;
                    await sequelize.query(updateLiquide, {
                        replacements: { ArticleVendu },
                        type: sequelize.QueryTypes.UPDATE
                    });
                }

                if (resultSelectDivers.length > 0) {
                    const updateDivers = `UPDATE Divers SET Qte = Qte - 1 WHERE Article = :ArticleVendu`;
                    await sequelize.query(updateDivers, {
                        replacements: { ArticleVendu },
                        type: sequelize.QueryTypes.UPDATE
                    });
                }
            }
        }

        res.status(200).json({ message: "Credit enregistré avec succès" });
    } catch (err) {
        console.error('Error during insertCredit:', err);
        res.status(500).json({ message: 'Erreur lors de l\'insertion du crédit', error: err.message });
    }
};

const insertAvance = async (req, res) => {
    try {
        const { ID_Credit, Avance } = req.body;

        if (!ID_Credit || !Avance) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const selectAvanceQuery = `SELECT * FROM Credit WHERE ID_Credit = :ID_Credit`;
        const resultSelectUpdate = await sequelize.query(selectAvanceQuery, {
            replacements: { ID_Credit },
            type: sequelize.QueryTypes.SELECT
        });

        if (resultSelectUpdate.length > 0) {
            const existingAvance = resultSelectUpdate[0].Avance;
            const existingCredit = resultSelectUpdate[0].Credit;
            const newAvance = parseFloat(existingAvance) + parseFloat(Avance);
            const newCredit = parseFloat(existingCredit) - parseFloat(Avance);

            const updateAvanceQuery = `UPDATE Credit SET Avance = :Avance, Credit = :Credit, created_at = NOW() WHERE ID_Credit = :ID_Credit`;
            await sequelize.query(updateAvanceQuery, {
                replacements: {
                    Avance: newAvance,
                    Credit: newCredit,
                    ID_Credit
                },
                type: sequelize.QueryTypes.UPDATE
            });

            res.status(200).json({ message: "Avance updated successfully" });
        } else {
            res.status(404).json({ message: "Credit record not found" });
        }
    } catch (err) {
        console.error('Error during insertAvance:', err);
        res.status(500).json({ message: 'Error during the update of avance', error: err.message });
    }
};


const selectAllCredit=async(req,res)=>{
    try{
const querySelect=`SELECT * FROM Credit`
const resultQuerySelect=await sequelize.query(querySelect,{type:sequelize.QueryTypes.SELECT})
res.status(200).json(resultQuerySelect)
    }catch(err){
        res.status(500).send('err select')
    }
}


module.exports={
    insertCredit,
    selectAllCredit,
    insertAvance
}