const nodemailer = require('nodemailer');


async function createEtherealTransporter() {

    let testAccount = await nodemailer.createTestAccount();


    console.log('Credenciais do Ethereal Mail criadas (para teste):');
    console.log(`Usuário: ${testAccount.user}`);
    console.log(`Senha: ${testAccount.pass}`);


    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, 
        auth: {
            user: testAccount.user, 
            pass: testAccount.pass, 
        },
    });
    
    return transporter;
}


async function sendPasswordResetEmail(toEmail, resetLink) {
    try {
        const transporter = await createEtherealTransporter();


        let mailOptions = {
            from: '"WorkConnect" <suporte@workconnect.com>',
            to: toEmail,
            subject: "Recuperação de Senha - WorkConnect",
            text: `Você solicitou a redefinição de senha. Clique neste link: ${resetLink}`,
            html: `
                <p>Olá,</p>
                <p>Recebemos uma solicitação de redefinição de senha para sua conta WorkConnect.</p>
                <p>Se foi você, clique no link abaixo para criar uma nova senha:</p>
                <a href="${resetLink}" style="padding: 10px 15px; background-color: #1e88e5; color: white; text-decoration: none; border-radius: 5px;">
                    Redefinir Minha Senha
                </a>
                <p>O link expira em 1 hora.</p>
                <p>Se você não solicitou isso, por favor, ignore este e-mail.</p>
            `
        };


        let info = await transporter.sendMail(mailOptions);


        console.log("================================================");
        console.log("E-MAIL DE TESTE ENVIADO (Ethereal)");
        console.log("Abra este link no navegador para VER o e-mail:");
        console.log(nodemailer.getTestMessageUrl(info));
        console.log("================================================");

    } catch (error) {
        console.error("Erro ao enviar e-mail de teste:", error);
    }
}


module.exports = { sendPasswordResetEmail };
