import simplify
import sys

arg = sys.argv

if len (arg) < 8:
    print "Not enough arguments"
    sys.exit()

number = arg[1]
expMonth = arg[2]
expYear = arg[3]
cvc = arg[4]
amount = arg[5]
description = arg[6]
currency = arg[7]

simplify.public_key = "sbpb_MzAzYmFmYWEtZjI5Ni00NTZjLWI0YzItMTJjOGE4Y2ZkMjVm"
simplify.private_key = "AbufnnVwSye1vh0ShCcsAkkXRSFMdAQ7jwGsgEn5AGZ5YFFQL0ODSXAOkNtXTToq"

payment = simplify.Payment.create({
       "card" : {
            "number": number, #5555555555554444
            "expMonth":expMonth, #11
            "expYear": expYear, #15
            "cvc": cvc #123
        },

        "amount" : amount,
        "description" : description,
        "currency" : currency
})


if payment.paymentStatus == 'APPROVED':
    print "Approved"
else:
    print "Declined"