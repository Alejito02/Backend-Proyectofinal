import Supplier from "../models/suppliers.js";

const postSuppliers = async (req, res) => {
    try {
        const {name , contact, address} = req.body;
        const supplier = new Supplier({
            name,
            contact,
            address
        });
        await supplier.save();
        res.json({supplier})
    } catch (error) {
        res.status(400).json({error:"fallo-registro-user"})
        console.log(error);
    }
}

export {postSuppliers};