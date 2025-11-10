const nodemailer = require('nodemailer');

// Esta função cria um "transporter" 
async function createEtherealTransporter() {
    //  Cria uma conta de teste no Ethereal
    let testAccount = await nodemailer.createTestAccount();

    //  Imprime no console as credenciais (
    console.log('Credenciais do Ethereal Mail criadas (para teste):');
    console.log(`Usuário: ${testAccount.user}`);
    console.log(`Senha: ${testAccount.pass}`);

    //  Configura o "transporter" do Nodemailer
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, 
        auth: {
            user: testAccount.user, // Usuário do Ethereal
            pass: testAccount.pass, // Senha do Ethereal
        },
    });
    
    return transporter;
}

// Esta é a função que o auth.js irá chamar
async function sendPasswordResetEmail(toEmail, resetLink) {
    try {
        const transporter = await createEtherealTransporter();

        //  Configura o conteúdo do e-mail
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

        // Envia o e-mail
        let info = await transporter.sendMail(mailOptions);

        //  Imprime o link de VISUALIZAÇÃO do Ethereal no console
        console.log("================================================");
        console.log("E-MAIL DE TESTE ENVIADO (Ethereal)");
        console.log("Abra este link no navegador para VER o e-mail:");
        console.log(nodemailer.getTestMessageUrl(info));
        console.log("================================================");

    } catch (error) {
        console.error("Erro ao enviar e-mail de teste:", error);
    }
}

// Exporta a função para o auth.js
module.exports = { sendPasswordResetEmail };