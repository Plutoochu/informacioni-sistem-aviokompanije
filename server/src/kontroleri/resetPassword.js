import { createTransport } from "nodemailer";

const resetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email je obavezan." });
  }

  try {
    // Konfiguracija za slanje emaila
    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: "tvoj.email@gmail.com",
        pass: "tvoj-app-password", // Ako koristiš Gmail, postavi app password
      },
    });

    const mailOptions = {
      from: "tvoj.email@gmail.com",
      to: email,
      subject: "Reset lozinke",
      text: "Klikni na link za resetovanje lozinke: http://localhost:3000/reset-password",
    };

    // Slanje emaila
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email poslan za resetovanje lozinke." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri slanju emaila." });
  }
};

export default resetPassword;
