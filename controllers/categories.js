import categorias from "../models/categories.js";

const postCategorias = async (req, res) => {
    try {
        const { name, description } = req.body;
        const categoria = new categorias({ name, description });
        await categoria.save();
        res.json({ categoria });
    } catch (error) {
        res.status(400).json({ error: "fallo-registro-categoria" });
        console.log(error);
    }
}

const putCategorias = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const categoria = await categorias.findById(id);
        categoria.name = name;
        categoria.description = description;
        await categoria.save();
        res.json({ categoria });
    } catch (error) {
        res.status(400).json({ error: "fallo-actualizacion-categoria" });
        console.log(error);
    }
}

const getCategorias = async (req, res) => {
    try{
        const{id} = req.params;
        const categoria = await categorias.findById(id);
        res.json({categoria});
    } catch (error) {
        res.status(400).json({ error: "fallo-actualizacion-categoria" });
        console.log(error);
    }
}

export { postCategorias, putCategorias, getCategorias }