const sequelize = require("../database");

const insertDivers = async (req, res) => {
    try {
        const { Article, PrixAchat, Qte } = req.body;

        // Query to check if there are existing entries
        const selectDivers = `SELECT * FROM Divers WHERE Article = :Article`;
        const resultSelect = await sequelize.query(selectDivers, {
            replacements: { Article },
            type: sequelize.QueryTypes.SELECT
        });

        if (resultSelect.length > 0) {
            // If entry exists, update the quantity and average the price
            const currentQte = parseFloat(resultSelect[0].Qte);
            const currentPrixAchat = parseFloat(resultSelect[0].PrixAchat);
            const newQte = currentQte + parseFloat(Qte);
            const newPrixAchat = ((currentPrixAchat * currentQte) + (parseFloat(PrixAchat) * parseFloat(Qte))) / newQte;
            const newPrixAchatFixed=newPrixAchat.toFixed(2)
            const updateDivers = `
                UPDATE Divers 
                SET Qte = :newQte, PrixAchat = :newPrixAchatFixed 
                WHERE Article = :Article
            `;

            await sequelize.query(updateDivers, {
                replacements: { Article, newPrixAchatFixed, newQte },
                type: sequelize.QueryTypes.UPDATE
            });

            res.status(200).json({ message: "Divers updated successfully" });
        } else {
            // If entry does not exist, insert new entry
            const insertDivers = `
                INSERT INTO Divers (Article, PrixAchat, Qte) 
                VALUES (:Article, :PrixAchat, :Qte)
            `;

            await sequelize.query(insertDivers, {
                replacements: { Article, PrixAchat: parseFloat(PrixAchat), Qte: parseFloat(Qte) },
                type: sequelize.QueryTypes.INSERT
            });

            res.status(200).json({ message: "Divers inserted successfully" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error during insert');
    }
}



const selectAllDivers=async(req,res)=>{
    try{
const querySelect=`SELECT * FROM Divers`
const resultQueryDivers=await sequelize.query(querySelect,{
    type: sequelize.QueryTypes.SELECT
})
res.status(200).json(resultQueryDivers)
    }catch(err){
        res.status(500).send('err select')
    }
}
const venteDivers = async (req, res) => {
    try {
        const { ID_Divers, QteVendu, PrixVente } = req.body;

        // Calculate total vente
        const vente = QteVendu * PrixVente;

        // Query to get the current quantity, price, total, and existing benefice
        const selectAvance = `SELECT Qte, PrixAchat, Total, BeneficeArticle, PrixVente, QteVendu FROM Divers WHERE ID_Divers = :ID_Divers`;
        const resultSelect = await sequelize.query(selectAvance, {
            replacements: { ID_Divers },
            type: sequelize.QueryTypes.SELECT
        });

        if (resultSelect.length > 0) {
            const currentQte = parseFloat(resultSelect[0].Qte);
            const prixAchat = parseFloat(resultSelect[0].PrixAchat);
            const currentTotal = parseFloat(resultSelect[0].Total);
            const currentBeneficeArticle = parseFloat(resultSelect[0].BeneficeArticle);
            const currentPrixVente = parseFloat(resultSelect[0].PrixVente) || 0;

            // Calculate new average selling price
            const newPrixVente = (currentPrixVente + parseFloat(PrixVente)) / 2;

            // Calculate new total and benefice
            const newTotal = currentTotal + vente;
            const newBeneficeArticle = currentBeneficeArticle + (PrixVente - prixAchat) * QteVendu;
            const QteAvendre = currentQte - QteVendu;

            // Update query
            const queryVente = `
                UPDATE Divers 
                SET QteVendu = :QteVendu, PrixVente = :PrixVente, Total = :Total, Qte = :Qte, BeneficeArticle = :BeneficeArticle 
                WHERE ID_Divers = :ID_Divers
            `;
            await sequelize.query(queryVente, {
                replacements: {
                    ID_Divers,
                    QteVendu: (parseFloat(resultSelect[0].QteVendu) || 0) + QteVendu,
                    PrixVente: newPrixVente.toFixed(2),
                    Total: newTotal,
                    Qte: QteAvendre,
                    BeneficeArticle: newBeneficeArticle
                },
                type: sequelize.QueryTypes.UPDATE
            });

            res.status(200).send('Vente updated');
        } else {
            res.status(404).send('Divers not found');
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Error during vente');
    }
};






module.exports={
    insertDivers,
    selectAllDivers,
    venteDivers
}