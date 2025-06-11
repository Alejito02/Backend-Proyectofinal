import mongoose from "mongoose";
import favoritesModel from "../models/favorites.js";

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

const postCrear = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "userId invalid"
            });
        } else if (!isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "productId invalid"
            })
        }

        // Verificar si el favorito ya existe y está activo
        const existingFavorite = await favoritesModel.findOne({
            userId,
            productId,
            state: 1
        });

        if (existingFavorite) {
            return res.status(400).json({
                success: false,
                message: "Este producto ya está en tus favoritos"
            });
        }

        const newFavorite = new favoritesModel({
            userId,
            productId,
            state: 1
        });
        await newFavorite.save();

        return res.status(201).json({
            success: true,
            message: "producto agregado a favoritos exitosamente",
            data: newFavorite
        })
    } catch (error) {
        console.error('Error en postCrear:', error);
        return res.status(500).json({
            success: false,
            message: "Error al agregar a favoritos",
            error: error.message
        });
    }

};


// Obtener todos los favoritos de un usuario
const getListarTodos = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log("id de usuario", userId)
            return res.status(400).json({
                success: false,
                message: "userId inválido"
            });
        }

        const favorites = await favoritesModel.find({
            userId,
            state: 1 // S olo los activos
        }).populate('productId', 'name price images description')
            .sort({ createdAt: -1 }).populate('userId'); // Ordenar por más recientes

        return res.status(200).json({
            success: true,
            message: "Favoritos obtenidos exitosamente",
            count: favorites.length,
            data: favorites
        });
    } catch (error) {
        console.error('Error en geLlistarTodos:', error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener favoritos",
            error: error.message
        });
    }
};


const putState = async (req, res) => {
    try {
        const { favoriteId } = req.params;

        // Validar que el favoriteId sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
            return res.status(400).json({
                success: false,
                message: "favoriteId inválido"
            });
        }

       

        // Buscar el favorito por ID
        const favorite = await favoritesModel.findById(favoriteId);

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: "Favorito no encontrado"
            });
        }

        // Actualizar el estado
        favorite.state = !favorite.state;
        await favorite.save();

        return res.status(200).json({
            success: true,
            message: `estado cambiado`, 
            data: favorite
        });

    } catch (error) {
        console.error('Error en putState:', error);
        return res.status(500).json({
            success: false,
            message: "Error al actualizar el estado del favorito",
            error: error.message
        });
    }
};


export { postCrear, getListarTodos, putState}