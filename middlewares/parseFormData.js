export const parseFormData = (req, res, next) => {
    try {
        if (req.body.data) {
            req.body.data = JSON.parse(req.body.data);
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Invalid JSON in data field" });
    }
};