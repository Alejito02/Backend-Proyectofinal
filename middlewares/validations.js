import { check } from "express-validator";

export const categoryValidations = [
    /* check("data.name", "El nombre es obligatorio")
            .notEmpty()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("El nombre debe tener entre 2 y 50 caracteres")
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
            .withMessage("Solo se permiten letras y espacios"),
    
        check("data.description", "La descripción es obligatoria")
            .notEmpty()
            .trim()
            .isLength({ max: 500 })
            .withMessage("La descripción no puede exceder los 500 caracteres")
            .custom((value) => !/<script>|<\/script>|http:|https:/.test(value))
            .withMessage("La descripción contiene contenido no permitido") */
];

export const inventoryValidations = [
    /*  check("data.productId", "Product ID is required")
            .notEmpty()
            .isMongoId().withMessage("Invalid product ID"), */

    check("data.type", "Type is required")
        .notEmpty()
        .isIn(["returns", "outbound", "inbound"])
        .withMessage("Invalid type value"),

    

    /*  check("data.quantity", "Quantity is required")
            .notEmpty()
            .isInt({ min: 1 }).withMessage("Quantity must be a positive integer"),
     */
    /*     check("data.date", "Date must be a valid date")
            .optional()
            .isISO8601().withMessage("Invalid date format"), */

    check("data.userId", "User ID is required")
        .notEmpty()
        .isMongoId()
        .withMessage("Invalid user ID"),
    /* 
        check("data.reason", "Reason must be a string")
            .optional()
            .isString() */
];

export const orderValidations = [
    check("data.userId", "User ID is required")
        .notEmpty()
        .isMongoId()
        .withMessage("Invalid user ID in products array"),

    check("data.products", "Products must be a non-empty array").isArray({
        min: 1,
    }),

    check("data.total", "Total is required")
        .notEmpty()
        .isNumeric()
        .withMessage("Total must be a number"),
];

export const productValidations = [
    check("data.name", "Name is required").notEmpty(),

    check("data.description", "Description is required").notEmpty(),

    check("data.acceptReturns", "The acceptReturns field is required").notEmpty(),

    check("data.price", "Price is required")
        .notEmpty()
        .isNumeric()
        .withMessage("Price must be a number"),

    check("data.categoryId", "Category ID is required")
        .notEmpty()
        .isMongoId()
        .withMessage("Invalid category ID"),

    check("data.stock", "Stock is required")
        .notEmpty()
        .isInt({ min: 0 })
        .withMessage("Stock must be a non-negative integer"),

    /*     check('data.user', 'User ID is required')
            .notEmpty()
            .isMongoId().withMessage('Invalid user ID'), */

    check("data.state")
        .optional()
        .isIn([0, 1])
        .withMessage("State must be 0 (inactive) or 1 (active)"),
];

export const userValidations = [
    check("data.name", "El nombre es obligatorio")
        .notEmpty()
        .isLength({ max: 50 })
        .withMessage("El nombre no debe exceder los 50 caracteres"),

    check("data.email", "El correo electrónico es obligatorio")
        .notEmpty()
        .isEmail()
        .withMessage("Debe proporcionar un correo electrónico válido"),

    check("data.password", "La contraseña es obligatoria")
        .notEmpty()
        .isLength({ min: 6 })
        .withMessage("La contraseña debe tener al menos 6 caracteres"),

    /*     check('data.role', 'El rol es obligatorio')
            .notEmpty()
            .isIn([0, 1]).withMessage('El rol debe ser 0 (admin) o 1 (usuario)'), */

    check("data.state")
        .optional()
        .isIn([0, 1])
        .withMessage("El estado debe ser 0 (inactivo) o 1 (activo)"),
];
