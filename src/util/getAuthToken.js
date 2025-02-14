import axios from "axios";

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;

const getAuthToken = async () => {
    const response = await axios.post(
      "https://accept.paymobsolutions.com/api/auth/tokens",
      {
        api_key: PAYMOB_API_KEY,
      }
    );
    
    return response.data.token;
  };
  
  export default getAuthToken;