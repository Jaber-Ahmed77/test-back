import axios from "axios";
import getAuthToken from "../util/getAuthToken.js";
import crypto from "crypto";

const PAYMOB_API_URL = "https://accept.paymob.com/api";
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
  
  // Step 2: Create a payment request
  export const createPayment = async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const authToken = await getAuthToken();
    
        if (!amount || !currency) {
          return res.status(400).json({ error: "Amount and currency are required" });
        }

        if (!authToken) {
          return res.status(500).json({ error: "Failed to get auth token" });
        }

        // Create Order
        const orderResponse = await axios.post(`${PAYMOB_API_URL}/ecommerce/orders`, {
          auth_token: authToken,
          delivery_needed: false,
          amount_cents: amount * 100,
          currency,
          items: [],
        });
    
        const paymobOrderId = orderResponse.data.id;

        const billingData = {
            first_name: "John",
            last_name: "Doe",
            email: "john@example.com",
            phone_number: "+201234567890",
            country: "EG",
            city: "Cairo",
            state: "Cairo",
            street: "123 Street Name",
            building: "1",       // ✅ Required
            floor: "2",          // ✅ Required
            apartment: "5",      // ✅ Required
            postal_code: "12345", // ✅ Recommended
          };      
    
        // Generate Payment Key
        const paymentKeyResponse = await axios.post(`${PAYMOB_API_URL}/acceptance/payment_keys`, {
          auth_token: authToken,
          amount_cents: amount * 100,
          expiration: 3600,
          order_id: paymobOrderId,
          billing_data: billingData,
          currency,
          integration_id: PAYMOB_INTEGRATION_ID,
        });
    
        res.status(200).json({
          success: true,
          paymentToken: paymentKeyResponse.data.token,
        });
          
    } catch (error) {
      console.error("Error creating payment request:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to create payment request" });
    }
  };
  
  
  export const handlePaymentCallback = async (req, res) => {

    const { hmac, ...payload } = req.body;

    // Verify the HMAC signature
    const generatedHmac = crypto
      .createHash("sha512")
      .update(JSON.stringify(payload))
      .digest("hex");
  
    if (hmac === generatedHmac) {
      // HMAC is valid
      const { success, amount_cents, order, payment_key_claims } = payload;
  
      if (success === "true") {
        console.log(`Payment successful for order ${order.id}. Amount: ${amount_cents / 100}`);
        // Update your database or trigger other actions
      } else {
        console.log(`Payment failed for order ${order.id}`);
      }
    } else {
      // HMAC is invalid
      console.error("Invalid HMAC signature");
    }
  
    res.sendStatus(200);
    
  }