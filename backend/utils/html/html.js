exports.registrationEmail = (name, registrationNumber) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parent Account Created</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
        h1 { color: #4CAF50; font-size: 24px; }
        p { font-size: 16px; line-height: 1.5; color: #555; }
        .info-box { padding: 15px; background-color: #f9f9f9; border-left: 4px solid #4CAF50; margin: 15px 0; border-radius: 5px; }
        .info-box strong { color: #333; }
        .button { display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; background-color: #4CAF50; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { font-size: 14px; color: #aaa; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>

<div class="container">
    <h1>Welcome to Our School Management System!</h1>
    <p>Dear ${name},</p>
    <p>Your account has been successfully created in our system. Here are your login credentials:</p>
    
    <div class="info-box">
        <strong>Parent ID:</strong> ${registrationNumber} <br>
        <strong>Temporary Password:</strong> ${registrationNumber}
    </div>
    
    <p>We recommend logging in to review your child's information and update your password for security. Keep these details safe.</p>
    
    <a href="https://schoolmanagementsystem.com/login" class="button">Login Now</a>
    
    <p>If you have any questions or need assistance, feel free to reach out to us.</p>

    <p>Best Regards,<br>The School Management System Team</p>

    <div class="footer">
        <p>School Management System | Contact Us: support@schoolmanagementsystem.com</p>
    </div>
</div>

</body>
</html>
`
}

exports.feePaymentMail = (data) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fee Deposit Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
        h1 { color: #4CAF50; font-size: 24px; }
        p { font-size: 16px; line-height: 1.5; color: #555; }
        .info-box { padding: 15px; background-color: #f9f9f9; border-left: 4px solid #4CAF50; margin: 15px 0; border-radius: 5px; }
        .info-box strong { color: #333; }
        .footer { font-size: 14px; color: #aaa; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>

<div class="container">
    <h1>Fee Deposit Confirmation</h1>
    <p>Dear ${data.parentName} Parent of ${data.studentName},</p>
    <p>We are pleased to confirm that a recent fee payment has been successfully processed for your child. Below are the details of the transaction:</p>
    
    <div class="info-box">
        <strong>Student ID:</strong> ${data.studentRegistrationNumber} <br>
        <strong>Parent ID:</strong> ${data.parentRegistrationNumber}<br>
        <strong>Amount Deposited:</strong> ₹${ data.depositFee }<br>
        <strong>Date of Payment:</strong> ${ data.paymentDate }<br>
        <strong>Total Fee:</strong> ₹${ data.totalFee }<br>
        <strong>Fees Paid to Date:</strong> ₹${ data.feesPaid }<br>
        <strong>Outstanding Balance:</strong> ₹${ data.feesDue }<br>
        <strong>Description:</strong> ${ data.description }
    </div>
    
    <p>Thank you for your prompt payment. If you have any questions regarding the fee details, feel free to contact our administration office.</p>

    <p>Best Regards,<br>The School Management System Team</p>

    <div class="footer">
        <p>School Management System | Contact Us: support@schoolmanagementsystem.com</p>
    </div>
</div>

</body>
</html>
`
}

exports.feesReminder = (data) =>{
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fee Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
        h1 { color: #E53935; font-size: 24px; }
        p { font-size: 16px; line-height: 1.5; color: #555; }
        .info-box { padding: 15px; background-color: #f9f9f9; border-left: 4px solid #E53935; margin: 15px 0; border-radius: 5px; }
        .info-box strong { color: #333; }
        .footer { font-size: 14px; color: #aaa; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>

<div class="container">
    <h1>Fee Payment Reminder</h1>
    <p>Dear ${data.parentName} Parent of ${data.studentName},</p>
    <p>This is a gentle reminder regarding the outstanding balance for your child's school fees. Please see the fee details below:</p>
    
    <div class="info-box">
        <strong>Student ID:</strong> ${data.studentRegistrationNumber}<br>
        <strong>Parent ID:</strong> ${data.parentRegistrationNumber}<br>
        <strong>Total Fee:</strong> ₹${ data.totalFee }<br>
        <strong>Fees Paid:</strong> ₹${ data.feesPaid }<br>
        <strong>Outstanding Balance:</strong> ₹${ data.feesDue }
    </div>
    
    <p>We kindly request that you arrange for payment at your earliest convenience to avoid any late fees or disruption to your child's education. If you have recently paid the outstanding amount, please disregard this email.</p>
    
    <p>If you have any questions, please feel free to contact our administration office.</p>

    <p>Thank you for your prompt attention to this matter.</p>
    
    <p>Best Regards,<br>The School Management System Team</p>

    <div class="footer">
        <p>School Management System | Contact Us: support@schoolmanagementsystem.com</p>
    </div>
</div>

</body>
</html>
`
}

exports.emailForNotice = (data) =>{
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notice from School</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f2f2f2;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            font-size: 20px;
        }
        h1 {
            color: #333;
            font-size: 24px;
            text-align: center;
            margin: 20px 0;
        }
        p {
            color: #555;
            line-height: 1.6;
        }
        .img{
        	width:100vw; 
        }
        .footer {
            text-align: center;
            color: #777;
            font-size: 14px;
            margin-top: 30px;
        }
        .footer a {
            color: #007BFF;
            text-decoration: none;
        }
    </style>
</head>
<body>

    <div class="container">

		<div class="header">
        	School Name
        </div>
    
        <h1>Notice: ${data.title}</h1>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>

        <p>${data.description}</p>

        ${
            (data.img)?`<img class="img" src="${data.img}" alt="School notice">`:""
        }
        

        <div class="footer">
            <p>If you have any questions, feel free to <a href="mailto:contact@school.com">contact us</a>.</p>
            <p>Thank you for being part of our community.</p>
        </div>
    </div>

</body>
</html>`
}

