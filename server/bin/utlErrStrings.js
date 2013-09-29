/*!
 * utlErrStrings-node
 * Error Strings
*/

var strings = {
    // database Errors
    100: "Data access error.",

    // application errors
    200: "Something went wrong",
    201: "Account does not exist",
    202: "Wrong password",
    203: "Wrong username or password",
    204: "That email is already being used",
    205: "Could not create an account ID",
    206: "That email is being used with a difference license",
    207: "Could not send a password reset code",
    208: "Your password could not be reset",
    209: "You have been signed out. Please login again.",
    210: "We could not log you in. Please try again.",
    211: "We could not log you out. Your session is still active.",
    212: "There was a problem setting your language preference. Please try again.",
    213: "Your settings could not be retrieved.",
    214: "A password reset email could not be sent. Please try again later.",

    //Licensing Errors

    // Purchasing errors
    300:            "We could not process your payment. Your credit card was not charged. Please check your details and try again.",
    301:            "Your payment was not successful. There may be something wrong with the credit card information you provided. Please double check it, correct any errors, and try again.",
    302:            "Your credit card has expired and was not charged. Please use another card.",
    303:            "The transaction has exceeded the limit on your credit card. Your credit card was not charged. Either reduce the number of licenses you are purchasing, or use another card with a higher limit.",
    304:            "This refund cannot be completed as the time limit for the refund has been exceeded.",
    305:            "A full refund cannot be completed as a partial refund was already issued.",
    306:            "This transaction was already refunded.",
    307:            "Your credit card was refused (no reason was given) Please try another card.",
    308:            "The security code you entered (CVC) is invalid. Please check your CVC on the back of your credit card and try again.",
    309:            "The credit card number you entered invalid. Please enter a valid Visa, MasterCard, American Express or a Discover card.",
    310:            "There is a payment in progress. Please wait for it to complete.",
    311:            "The credit card number is incorrect.",
    312:            "The credit card number is not a valid credit card number.",
    313:            "The credit card's expiration month is invalid.",
    314:            "The credit card's expiration year is invalid.",
    315:            "The card's zip code (postal code) failed validation.",
    316:            "You have not stored any credit cards or it couldn't be found.",
    317:            "Please check the box to agree to the Upgrade Terms and Conditions.",

    400:            "Please enter a valid username.",
    401:            "Please enter a password.",
    402:            "Please enter a valid email address.",
    403:            "Please enter a stronger password.",
    404:            "Passwords do not match.",
    405:            "Please enter a valid first name.",
    406:            "Please enter a valid last name.",
    407:            "Please enter a valid email address.",
    408:            "Email addresses do not match",
    409:            "Please enter a valid company name.",
    410:            "Please select some licenses to purchase.",
    411:            "Please enter a valid Visa, American Express, MasterCard or Discover credit card Number.",
    412:            "Please enter a valid month of expiry.",
    413:            "Please enter a valid year of expiry.",
    414:            "Please enter a valid month and year of expiry.",
    415:            "Please enter your first and last name.",
    416:            "Please enter a valid cvc (a 3 or 4 digit number, usually found on the back of your card, next to the signature box).",
    417:            "Please enter your street address.",
    418:            "Please enter your city.",
    419:            "Please enter your state or province.",
    420:            "Please enter your country.",
    421:            "Please enter your postal code.",
    422:            "Please enter a different email address to change to.",
    423:            "Please enter your current password.",
    424:            "Please enter your new password.",
    425:            "Your new password is not strong enough.",
    426:            "Please enter an upgrade quantity between 0 and 1,000,000.",
    427:            "You can only buy a maximum of 1,000,000 licenses at a time.",
    428:            "Password changed successfully.",
    429:            "You have been sent an email with instructions to reset your password.",
    430:            "Password reset successful.",
    431:            "There was a problem connecting to CryptoMill. Try refreshing your browser.",
    432:            "Language set to English.",
    433:            "E-mail changed successfully."
}

exports.str = strings;