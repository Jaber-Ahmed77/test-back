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
  
      // 🔹 Secret key from your payment provider dashboard
      const secret = "your-secret-key"; 
  
      // 🔹 Exclude 'hmac' and sort the remaining payload alphabetically
      const sortedPayload = Object.keys(payload)
          .sort()
          .map((key) => `${key}=${payload[key]}`)
          .join("&");
  
      // 🔹 Generate the expected HMAC using SHA512
      const expectedHmac = crypto
          .createHmac("sha512", secret)
          .update(sortedPayload)
          .digest("hex");
  
      // 🔹 Compare the received HMAC with the expected one
      if (hmac !== expectedHmac) {
          console.error("❌ Invalid HMAC signature - Possible fraud attempt!");
          return res.status(400).json({ message: "Invalid HMAC, request rejected!" });
      }
  
      // 🔹 Extract relevant payment details
      const { success, amount_cents, order, payment_key_claims } = payload;
  
      if (success) {
          console.log(`✅ Payment successful for order ${order}. Amount: ${amount_cents / 100} EGP`);
          // 🟢 Update your database: Mark the order as "Paid"
          // await updateOrderStatus(order, "paid", amount_cents);
          res.redirect("http://localhost:3000/analytics");
      } else {
          console.log(`❌ Payment failed for order ${order}`);
          // 🔴 Update your database: Mark the order as "Failed"
          // await updateOrderStatus(order, "failed", amount_cents);
          res.redirect("http://localhost:3000/account");
      }
  
      res.sendStatus(200);
  };
  
  // Mock function to simulate updating order status in the database
  // async function updateOrderStatus(orderId, status, amount) {
  //     console.log(`🔄 Updating Order ${orderId}: Status = ${status}, Amount = ${amount / 100} EGP`);
  //     // Database update logic goes here...
  // }
  
