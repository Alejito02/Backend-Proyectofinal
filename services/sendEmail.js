import nodemailer from "nodemailer";


export async function sendEmail(req, res) {
    const { to, subject,  } = req.body;
    try {

        console.log("fdfsfds", process.env.USER, process.env.PASS );
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user:process.env.USER,
                pass:process.env.PASS,
            },
        });

        const mailOptions = {
            from: process.env.USER, 
            to: to,
            subject: subject, 
            text: 'prueba de email'
        };
        const info = await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Mail sent" });
        console.log("Mail sent", info);
    } catch (error) {
        res.status(400).json({ message: "Error sending email" });
        console.log(error);
    }
}
