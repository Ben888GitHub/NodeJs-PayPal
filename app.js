const express = require("express");
const ejs = require("ejs")
const paypal = require("paypal-rest-sdk")

paypal.configure({
    "mode": "sandbox",
    "client_id": "AR6wqwxGvNNwdfb0OVsCYHkI19Ee0fbCglGgkV0ruO4JzJ3Grjfq-x1jFustgRRZSqvaow4YEITd4hv8",
    "client_secret": "EOI7WJpdwHbtiAA9Nk-4f6iLX7iAxjHOYauyqFOUKC6NgKrsUp57hJAdT6_d2zO2CAgJKSPqlv0Hqz-j"
})

const app = express()

// Setting view engine to ejs
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
})

app.post("/pay", (req, res) => {

    // Create all payment details in JSON format
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Red Sox Hat",
                    "sku": "001",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "Hat for the best team ever."
        }]
    };

    // Let's create the payment
    paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
            throw error
        }
        else {
            // console.log("Create Payment Response")
            // console.log(payment)
            // res.send("test")

            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href); // redirect the user to that link
                }
            }
        }
    })

})


// http://localhost:3000/success?paymentId=PAYID-L5FKHVA82J68573L4426463S&token=EC-2N488539UP056662D&PayerID=KXKLJN7GZ6YBC
app.get("/success", (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    // Create an execute object
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    }

    paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
        if (error) {
            console.log(error.response);
            throw error
        }
        else {
            // console.log("Get Payment Response")
            console.log(JSON.stringify(payment))
            res.send("Payment Success")
        }
    })
})

app.get("/cancel", (req, res) => {
    res.send("Cancelled")
})

app.listen(3000, () => {
    console.log('Server Started')
})