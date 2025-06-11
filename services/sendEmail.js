import nodemailer from "nodemailer";
import ejs from 'ejs';
import path from 'path';
import fs from 'fs/promises';


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER, 
        pass: process.env.PASS, 
    },
});

async function renderEmailTemplate(templatePath, data) {
    try {

        const fullTemplatePath = path.join(process.cwd(), 'emailsTemplates', templatePath);
        const templateContent = await fs.readFile(fullTemplatePath, 'utf8');
        return ejs.render(templateContent, data);   
    } catch (error) {
        console.error(`Error al renderizar la plantilla ${templatePath}:`, error.message);
        throw new Error('La plantilla de email no pudo ser renderizada.');
    }
}

export async function sendEmail(req, res) {
    const { to, subject, templateFile, data } = req.body; 

    if (!to || !subject || !templateFile || !data) {
        return res.status(400).json({ message: "Faltan parámetros requeridos: 'to', 'subject', 'templateFile', o 'data'." });
    }

    try {
        const htmlContent = await renderEmailTemplate(templateFile, data);

        const mailOptions = {
            from: process.env.USER, 
            to: to,
            subject: subject, 
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Correo enviado:", info.response); 
        res.status(200).json({ message: `Correo enviado a ${mailOptions.to}` });
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        res.status(500).json({ message: "Error al enviar el correo", error: error.message });
    }
}