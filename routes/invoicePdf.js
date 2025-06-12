import express  from "express";
import { generateInvoicePdf } from "../services/invoicePdf.js";
import { validateToken } from "../middlewares/validateToken.js";
const router = express.Router();

router.post("/",[validateToken], async (req,res)=>{
    try {
        const {data} = req.body;
        const invoicePdf = await generateInvoicePdf(data);

        res.setHeader('Content-Type', 'application/pdf'); 
        res.setHeader('Content-Disposition', `attachment; filename="factura-ColproMarket-${data._id.substring(0, 8)}.pdf"`);
        res.setHeader('Content-Length', invoicePdf.length);
        res.status(200).end(invoicePdf); 
    } catch (error) {
        console.log("[POST /invoice] Error generating invoice", error);
        return res.status(500).json({
            success: false,
            message: 'Ocurrió un error interno al intentar generar la factura.'
        });
    }
});

export default router;