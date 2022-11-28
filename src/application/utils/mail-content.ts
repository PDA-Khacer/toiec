export function getMailAgencyAssignToAdmin(): string {
  return `<p>We have a new agency:<br/>
Agency name: <%=AGENCY_USERNAME%><br/>
Email: <%=AGENCY_EMAIL%><br/>
Date: <%=NOW%><br/>
Only when you activate this agency, they can use it. Please check it through this link https://admin.aiphoenix.tech/admin/agency-users</p>`;
}

export function getMailTransactionAdmin(): string {
  return `<p><a href="https://aiphoenix.tech">AIPhoenix.tech</a> notify admin</p>
<p>
    <%=BODY_MESSAGE%>
</p>
<table class="table">
    <thead>
        <tr>
            <th>Name</th>
            <th>Value</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Transaction hash</td>
            <td>
                <a href="https://bscscan.com/tx/<%=TNX_HASH%>"><%=TNX_HASH%></a>
            </td>
        </tr>
        <tr>
            <td>From address </td>
            <td>
                <%=FROM_ADDRESS%>
            </td>
        </tr>
        <tr>
            <td>To address</td>
            <td>
                <%=TO_ADDRESS%>
            </td>
        </tr>
        <tr>
            <td>Amount</td>
            <td>
                <%=AMOUNT_SEND%>
            </td>
        </tr>
        <tr>
            <td>Time</td>
            <td>
                <%=TIME_TNX%>
            </td>
        </tr>
    </tbody>
</table>`;
}

export function getMailInsurances(): string {
  return `<p><a href="https://aiphoenix.tech">AIPhoenix</a></p>
<p>
    <%=BODY_MESSAGE%>
</p>
<table class="table">
    <thead>
        <tr>
            <th>Name</th>
            <th>Value</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>User name</td>
            <td>
                <%=USER_NAME%>
            </td>
        </tr>
        <tr>
            <td>Page support</td>
            <td>
                <%=PAGE_SUPPORT%>
            </td>
        </tr>
        <tr>
            <td>Game insurance </td>
            <td>
                <%=GAME_INS%>
            </td>
        </tr>
        <tr>
            <td>Fund game insurance</td>
            <td>
                <%=FUND_GAME%>
            </td>
        </tr>
        <tr>
            <td>Amount</td>
            <td>
                <%=AMOUNT_SEND%>
            </td>
        </tr>
        <tr>
            <td>To address</td>
            <td>
                <%=TO_ADDRESS%>
            </td>
        </tr>
        <tr>
            <td>From address</td>
            <td>
                <%=FROM_ADDRESS%>
            </td>
        </tr>
        <tr>
            <td>Txn hash user enter</td>
            <td>
                <%=TNX_HASH_USER%>
            </td>
        </tr>
        <tr>
            <td>Time send to system</td>
            <td>
                <%=TIME_SEND%>
            </td>
        </tr>
        <tr>
            <td>Insurance status</td>
            <td>
                <%=INS_STATUS%>
            </td>
        </tr>
        <tr>
            <td>Transaction confirmed at</td>
            <td>
                <%=CONFIRM_AT%>
            </td>
        </tr>
    </tbody>
</table>`;
}

export function getMailSuccessAssignInsurances(): string {
  return `<p><a href="https://aiphoenix.tech">AIPhoenix</a></p>
<p>
    You assign insurance success confirm by transaction: <a href="https://bscscan.com/tx/<%=TNX_HASH%>"><%=TNX_HASH%></a>
</p>
<table class="table">
    <thead>
        <tr>
            <th>Name</th>
            <th>Value</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>User name</td>
            <td>
                <%=USER_NAME%>
            </td>
        </tr>
        <tr>
            <td>Page support</td>
            <td>
                <%=PAGE_SUPPORT%>
            </td>
        </tr>
        <tr>
            <td>Game insurance </td>
            <td>
                <%=GAME_INS%>
            </td>
        </tr>
        <tr>
            <td>Fund game insurance</td>
            <td>
                <%=FUND_GAME%>
            </td>
        </tr>
        <tr>
            <td>Amount</td>
            <td>
                <%=AMOUNT_SEND%>
            </td>
        </tr>
    </tbody>
</table>`;
}

export function getHtmlMailSuccessAssignIns(): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title></title>
    <style type="text/css" rel="stylesheet" media="all">
        /* Base ------------------------------ */
        
        @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");
        body {
            width: 100% !important;
            height: 100%;
            margin: 0;
            -webkit-text-size-adjust: none;
        }
        
        a {
            color: #3869D4;
        }
        
        a img {
            border: none;
        }
        
        td {
            word-break: break-word;
        }
        
        .preheader {
            display: none !important;
            visibility: hidden;
            mso-hide: all;
            font-size: 1px;
            line-height: 1px;
            max-height: 0;
            max-width: 0;
            opacity: 0;
            overflow: hidden;
        }
        /* Type ------------------------------ */
        
        body,
        td,
        th {
            font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
        }
        
        h1 {
            margin-top: 0;
            color: #333333;
            font-size: 22px;
            font-weight: bold;
            text-align: left;
        }
        
        h2 {
            margin-top: 0;
            color: #333333;
            font-size: 16px;
            font-weight: bold;
            text-align: left;
        }
        
        h3 {
            margin-top: 0;
            color: #333333;
            font-size: 14px;
            font-weight: bold;
            text-align: left;
        }
        
        td,
        th {
            font-size: 16px;
        }
        
        p,
        ul,
        ol,
        blockquote {
            margin: .4em 0 1.1875em;
            font-size: 16px;
            line-height: 1.625;
        }
        
        p.sub {
            font-size: 13px;
        }
        /* Utilities ------------------------------ */
        
        .align-right {
            text-align: right;
        }
        
        .align-left {
            text-align: left;
        }
        
        .align-center {
            text-align: center;
        }
        /* Buttons ------------------------------ */
        
        .button {
            background-color: #3869D4;
            border-top: 10px solid #3869D4;
            border-right: 18px solid #3869D4;
            border-bottom: 10px solid #3869D4;
            border-left: 18px solid #3869D4;
            display: inline-block;
            color: #FFF;
            text-decoration: none;
            border-radius: 3px;
            box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
            -webkit-text-size-adjust: none;
            box-sizing: border-box;
        }
        
        .button--green {
            background-color: #22BC66;
            border-top: 10px solid #22BC66;
            border-right: 18px solid #22BC66;
            border-bottom: 10px solid #22BC66;
            border-left: 18px solid #22BC66;
        }
        
        .button--red {
            background-color: #FF6136;
            border-top: 10px solid #FF6136;
            border-right: 18px solid #FF6136;
            border-bottom: 10px solid #FF6136;
            border-left: 18px solid #FF6136;
        }
        
        @media only screen and (max-width: 500px) {
            .button {
                width: 100% !important;
                text-align: center !important;
            }
        }
        /* Attribute list ------------------------------ */
        
        .attributes {
            margin: 0 0 21px;
        }
        
        .attributes_content {
            background-color: #F4F4F7;
            padding: 16px;
        }
        
        .attributes_item {
            padding: 0;
        }
        /* Related Items ------------------------------ */
        
        .related {
            width: 100%;
            margin: 0;
            padding: 25px 0 0 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
        }
        
        .related_item {
            padding: 10px 0;
            color: #CBCCCF;
            font-size: 15px;
            line-height: 18px;
        }
        
        .related_item-title {
            display: block;
            margin: .5em 0 0;
        }
        
        .related_item-thumb {
            display: block;
            padding-bottom: 10px;
        }
        
        .related_heading {
            border-top: 1px solid #CBCCCF;
            text-align: center;
            padding: 25px 0 10px;
        }
        /* Discount Code ------------------------------ */
        
        .discount {
            width: 100%;
            margin: 0;
            padding: 24px;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            background-color: #F4F4F7;
            border: 2px dashed #CBCCCF;
        }
        
        .discount_heading {
            text-align: center;
        }
        
        .discount_body {
            text-align: center;
            font-size: 15px;
        }
        /* Social Icons ------------------------------ */
        
        .social {
            width: auto;
        }
        
        .social td {
            padding: 0;
            width: auto;
        }
        
        .social_icon {
            height: 20px;
            margin: 0 8px 10px 8px;
            padding: 0;
        }
        /* Data table ------------------------------ */
        
        .purchase {
            width: 100%;
            margin: 0;
            padding: 35px 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
        }
        
        .purchase_content {
            width: 100%;
            margin: 0;
            padding: 25px 0 0 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
        }
        
        .purchase_item {
            padding: 10px 0;
            color: #51545E;
            font-size: 15px;
            line-height: 18px;
        }
        
        .purchase_heading {
            padding-bottom: 8px;
            border-bottom: 1px solid #EAEAEC;
        }
        
        .purchase_heading p {
            margin: 0;
            color: #85878E;
            font-size: 12px;
        }
        
        .purchase_footer {
            padding-top: 15px;
            border-top: 1px solid #EAEAEC;
        }
        
        .purchase_total {
            margin: 0;
            text-align: right;
            font-weight: bold;
            color: #333333;
        }
        
        .purchase_total--label {
            padding: 0 15px 0 0;
        }
        
        body {
            background-color: #F2F4F6;
            color: #51545E;
        }
        
        p {
            color: #51545E;
        }
        
        .email-wrapper {
            width: 100%;
            margin: 0;
            padding: 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            background-color: #F2F4F6;
        }
        
        .email-content {
            width: 100%;
            margin: 0;
            padding: 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
        }
        /* Masthead ----------------------- */
        
        .email-masthead {
            padding: 25px 0;
            text-align: center;
        }
        
        .email-masthead_logo {
            width: 94px;
        }
        
        .email-masthead_name {
            font-size: 16px;
            font-weight: bold;
            color: #A8AAAF;
            text-decoration: none;
            text-shadow: 0 1px 0 white;
        }
        /* Body ------------------------------ */
        
        .email-body {
            width: 100%;
            margin: 0;
            padding: 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
        }
        
        .email-body_inner {
            width: 570px;
            margin: 0 auto;
            padding: 0;
            -premailer-width: 570px;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            background-color: #FFFFFF;
        }
        
        .email-footer {
            width: 570px;
            margin: 0 auto;
            padding: 0;
            -premailer-width: 570px;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            text-align: center;
        }
        
        .email-footer p {
            color: #A8AAAF;
        }
        
        .body-action {
            width: 100%;
            margin: 30px auto;
            padding: 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            text-align: center;
        }
        
        .body-sub {
            margin-top: 25px;
            padding-top: 25px;
            border-top: 1px solid #EAEAEC;
        }
        
        .content-cell {
            padding: 45px;
        }
        /*Media Queries ------------------------------ */
        
        @media only screen and (max-width: 600px) {
            .email-body_inner,
            .email-footer {
                width: 100% !important;
            }
        }
        
        @media (prefers-color-scheme: dark) {
            body,
            .email-body,
            .email-body_inner,
            .email-content,
            .email-wrapper,
            .email-masthead,
            .email-footer {
                background-color: #333333 !important;
                color: #FFF !important;
            }
            p,
            ul,
            ol,
            blockquote,
            h1,
            h2,
            h3,
            span,
            .purchase_item {
                color: #FFF !important;
            }
            .attributes_content,
            .discount {
                background-color: #222 !important;
            }
            .email-masthead_name {
                text-shadow: none !important;
            }
        }
        
         :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }
    </style>
    <!--[if mso]>
    <style type="text/css">
      .f-fallback  {
        font-family: Arial, sans-serif;
      }
    </style>
  <![endif]-->
</head>

<body>
    <span class="preheader">Congratulations for completing the purchase!</span>
    <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center">
                <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td class="email-masthead">
                            <a href="https://aiphoenix.tech" class="f-fallback email-masthead_name">
                                <img style="width:100px;height:100px;" src="https://i.ibb.co/LkC73xV/Microsoft-Teams-image-7.png" alt="Microsoft-Teams-image-7" border="0">
                            </a>
                        </td>
                    </tr>
                    <!-- Email Body -->
                    <tr>
                        <td class="email-body" width="570" cellpadding="0" cellspacing="0">
                            <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                                <!-- Body content -->
                                <tr>
                                    <td class="content-cell">
                                        <div class="f-fallback">
                                            <h1>Hi
                                                <%=USER_NAME%>,</h1>
                                            <p>Congratulations for completing the purchase!</p>
                                            <table class="purchase" width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td>
                                                        <h3>
                                                            <%=INV_ID%>
                                                        </h3>
                                                    </td>
                                                    <td>
                                                        <h3 class="align-right">
                                                            <%=NOW%>
                                                        </h3>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2">
                                                        <table class="purchase_content" width="100%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <th class="purchase_heading" align="left">
                                                                </th>
                                                                <th class="purchase_heading" align="right">
                                                                </th>
                                                            </tr>
                                                            <tr>
                                                                <td align="left">User name</td>
                                                                <td align="right">
                                                                    <%=USER_NAME%>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left">Page support</td>
                                                                <td align="right">
                                                                    <%=PAGE_SUPPORT%>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left">Game insurance </td>
                                                                <td align="right">
                                                                    <%=GAME_INS%>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left">Fund game insurance</td>
                                                                <td align="right">
                                                                    <%=FUND_GAME%> ERU
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left">Amount</td>
                                                                <td align="right">
                                                                    <%=AMOUNT_SEND%> USDT
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left">To address</td>
                                                                <td align="right">
                                                                    <%=TO_ADDRESS%>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left">From address</td>
                                                                <td align="right">
                                                                    <%=FROM_ADDRESS%>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left">Txn hash</td>
                                                                <td align="right">
                                                                    <a href="https://bscscan.com/tx/<%=TNX_HASH_USER%>">
                                                                        <%=TNX_HASH_USER%>
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            <p>Download bot here:
                                                <a href="https://www.mediafire.com/file/j1it5fvidnx4uq8/Bot_11_11_2021.rar/file">
                                                    link
                                                </a>
                                            </p>
                                            <p>File guide:
                                                <a href="https://www.mediafire.com/file/wupxdqr8gkouetb/Guide.docx/file">
                                                    link
                                                </a>
                                            </p>
                                            <p>If you have any questions about this invoice, simply reply to this email or reach out to our <a href="#">support@aiphoenix.tech</a> for help.</p>
                                            <p>Cheers,
                                                <br>The AIPhoenix Team</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td class="content-cell" align="center">
                                        <p class="f-fallback sub align-center">&copy; 2021 AIPhoenix.tech. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>`;
}

export function getHtmlMailCorrectIns(): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title></title>
    <style type="text/css" rel="stylesheet" media="all">
        /* Base ------------------------------ */
        
        @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");
        body {
            width: 100% !important;
            height: 100%;
            margin: 0;
            -webkit-text-size-adjust: none;
        }
        
        a {
            color: #3869D4;
        }
        
        a img {
            border: none;
        }
        
        td {
            word-break: break-word;
        }
        
        .preheader {
            display: none !important;
            visibility: hidden;
            mso-hide: all;
            font-size: 1px;
            line-height: 1px;
            max-height: 0;
            max-width: 0;
            opacity: 0;
            overflow: hidden;
        }
        /* Type ------------------------------ */
        
        body,
        td,
        th {
            font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
        }
        
        h1 {
            margin-top: 0;
            color: #333333;
            font-size: 22px;
            font-weight: bold;
            text-align: left;
        }
        
        h2 {
            margin-top: 0;
            color: #333333;
            font-size: 16px;
            font-weight: bold;
            text-align: left;
        }
        
        h3 {
            margin-top: 0;
            color: #333333;
            font-size: 14px;
            font-weight: bold;
            text-align: left;
        }
        
        td,
        th {
            font-size: 16px;
        }
        
        p,
        ul,
        ol,
        blockquote {
            margin: .4em 0 1.1875em;
            font-size: 16px;
            line-height: 1.625;
        }
        
        p.sub {
            font-size: 13px;
        }
        /* Utilities ------------------------------ */
        
        .align-right {
            text-align: right;
        }
        
        .align-left {
            text-align: left;
        }
        
        .align-center {
            text-align: center;
        }
        /* Buttons ------------------------------ */
        
        .button {
            background-color: #3869D4;
            border-top: 10px solid #3869D4;
            border-right: 18px solid #3869D4;
            border-bottom: 10px solid #3869D4;
            border-left: 18px solid #3869D4;
            display: inline-block;
            color: #FFF;
            text-decoration: none;
            border-radius: 3px;
            box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
            -webkit-text-size-adjust: none;
            box-sizing: border-box;
        }
        
        .button--green {
            background-color: #22BC66;
            border-top: 10px solid #22BC66;
            border-right: 18px solid #22BC66;
            border-bottom: 10px solid #22BC66;
            border-left: 18px solid #22BC66;
        }
        
        .button--red {
            background-color: #FF6136;
            border-top: 10px solid #FF6136;
            border-right: 18px solid #FF6136;
            border-bottom: 10px solid #FF6136;
            border-left: 18px solid #FF6136;
        }
        
        @media only screen and (max-width: 500px) {
            .button {
                width: 100% !important;
                text-align: center !important;
            }
        }
        /* Attribute list ------------------------------ */
        
        .attributes {
            margin: 0 0 21px;
        }
        
        .attributes_content {
            background-color: #F4F4F7;
            padding: 16px;
        }
        
        .attributes_item {
            padding: 0;
        }
        /* Related Items ------------------------------ */
        
        .related {
            width: 100%;
            margin: 0;
            padding: 25px 0 0 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
        }
        
        .related_item {
            padding: 10px 0;
            color: #CBCCCF;
            font-size: 15px;
            line-height: 18px;
        }
        
        .related_item-title {
            display: block;
            margin: .5em 0 0;
        }
        
        .related_item-thumb {
            display: block;
            padding-bottom: 10px;
        }
        
        .related_heading {
            border-top: 1px solid #CBCCCF;
            text-align: center;
            padding: 25px 0 10px;
        }
        /* Discount Code ------------------------------ */
        
        .discount {
            width: 100%;
            margin: 0;
            padding: 24px;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            background-color: #F4F4F7;
            border: 2px dashed #CBCCCF;
        }
        
        .discount_heading {
            text-align: center;
        }
        
        .discount_body {
            text-align: center;
            font-size: 15px;
        }
        /* Social Icons ------------------------------ */
        
        .social {
            width: auto;
        }
        
        .social td {
            padding: 0;
            width: auto;
        }
        
        .social_icon {
            height: 20px;
            margin: 0 8px 10px 8px;
            padding: 0;
        }
        /* Data table ------------------------------ */
        
        .purchase {
            width: 100%;
            margin: 0;
            padding: 35px 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
        }
        
        .purchase_content {
            width: 100%;
            margin: 0;
            padding: 25px 0 0 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
        }
        
        .purchase_item {
            padding: 10px 0;
            color: #51545E;
            font-size: 15px;
            line-height: 18px;
        }
        
        .purchase_heading {
            padding-bottom: 8px;
            border-bottom: 1px solid #EAEAEC;
        }
        
        .purchase_heading p {
            margin: 0;
            color: #85878E;
            font-size: 12px;
        }
        
        .purchase_footer {
            padding-top: 15px;
            border-top: 1px solid #EAEAEC;
        }
        
        .purchase_total {
            margin: 0;
            text-align: right;
            font-weight: bold;
            color: #333333;
        }
        
        .purchase_total--label {
            padding: 0 15px 0 0;
        }
        
        body {
            background-color: #F2F4F6;
            color: #51545E;
        }
        
        p {
            color: #51545E;
        }
        
        .email-wrapper {
            width: 100%;
            margin: 0;
            padding: 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            background-color: #F2F4F6;
        }
        
        .email-content {
            width: 100%;
            margin: 0;
            padding: 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
        }
        /* Masthead ----------------------- */
        
        .email-masthead {
            padding: 25px 0;
            text-align: center;
        }
        
        .email-masthead_logo {
            width: 94px;
        }
        
        .email-masthead_name {
            font-size: 16px;
            font-weight: bold;
            color: #A8AAAF;
            text-decoration: none;
            text-shadow: 0 1px 0 white;
        }
        /* Body ------------------------------ */
        
        .email-body {
            width: 100%;
            margin: 0;
            padding: 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
        }
        
        .email-body_inner {
            width: 570px;
            margin: 0 auto;
            padding: 0;
            -premailer-width: 570px;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            background-color: #FFFFFF;
        }
        
        .email-footer {
            width: 570px;
            margin: 0 auto;
            padding: 0;
            -premailer-width: 570px;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            text-align: center;
        }
        
        .email-footer p {
            color: #A8AAAF;
        }
        
        .body-action {
            width: 100%;
            margin: 30px auto;
            padding: 0;
            -premailer-width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            text-align: center;
        }
        
        .body-sub {
            margin-top: 25px;
            padding-top: 25px;
            border-top: 1px solid #EAEAEC;
        }
        
        .content-cell {
            padding: 45px;
        }
        /*Media Queries ------------------------------ */
        
        @media only screen and (max-width: 600px) {
            .email-body_inner,
            .email-footer {
                width: 100% !important;
            }
        }
        
        @media (prefers-color-scheme: dark) {
            body,
            .email-body,
            .email-body_inner,
            .email-content,
            .email-wrapper,
            .email-masthead,
            .email-footer {
                background-color: #333333 !important;
                color: #FFF !important;
            }
            p,
            ul,
            ol,
            blockquote,
            h1,
            h2,
            h3,
            span,
            .purchase_item {
                color: #FFF !important;
            }
            .attributes_content,
            .discount {
                background-color: #222 !important;
            }
            .email-masthead_name {
                text-shadow: none !important;
            }
        }
        
         :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }
    </style>
    <!--[if mso]>
    <style type="text/css">
      .f-fallback  {
        font-family: Arial, sans-serif;
      }
    </style>
  <![endif]-->
</head>

<body>
    <span class="preheader">Have new correct Insurance</span>
    <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center">
                <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td class="email-masthead">
                            <a href="https://aiphoenix.tech" class="f-fallback email-masthead_name">
                                <img style="width:100px;height:100px;" src="https://i.ibb.co/LkC73xV/Microsoft-Teams-image-7.png" alt="Microsoft-Teams-image-7" border="0">
                            </a>
                        </td>
                    </tr>
                    <!-- Email Body -->
                    <tr>
                        <td class="email-body" width="570" cellpadding="0" cellspacing="0">
                            <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                                <!-- Body content -->
                                <tr>
                                    <td class="content-cell">
                                        <div class="f-fallback">
                                            <p>Check insurance here: <a href="#">Click here</a></p>
                                            <table class="purchase" width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td>
                                                        <h3>
                                                            <%=INV_ID%>
                                                        </h3>
                                                    </td>
                                                    <td>
                                                        <h3 class="align-right">
                                                            <%=NOW%>
                                                        </h3>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2">
                                                        <table class="purchase_content" width="100%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <th class="purchase_heading" align="left">
                                                                </th>
                                                                <th class="purchase_heading" align="right">
                                                                </th>
                                                            </tr>
                                                            <tr>
                                                                <td align="left">Register Email</td>
                                                                <td align="right">
                                                                    <%=REGISTER_EMAIL%>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left">Username Bot</td>
                                                                <td align="right">
                                                                    <%=USERNAME_BOT%>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left">presenter </td>
                                                                <td align="right">
                                                                    <%=PRESENTER%>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left">Insurance Capital Limit</td>
                                                                <td align="right">
                                                                    <%=INSURANCE_CAPITAL_LIMIT%> ERU
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left">Telegram User</td>
                                                                <td align="right">
                                                                    <%=TELEGRAM_USER%>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left">Wallet Receive</td>
                                                                <td align="right">
                                                                    <%=WALLET_RECEIVE%>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left">Phone Number</td>
                                                                <td align="right">
                                                                    <%=PHONE_NUMBER%>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="left">Img History Game</td>
                                                                <td align="right">
                                                                    <%=IMG_HISTORY_GAME%>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            <p>If you have any questions about this invoice, simply reply to this email or reach out to our <a href="#">support@aiphoenix.tech</a> for help.</p>
                                            <p>Cheers,
                                                <br>The AIPhoenix Team</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td class="content-cell" align="center">
                                        <p class="f-fallback sub align-center">&copy; 2021 AIPhoenix.tech. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>`;
}
