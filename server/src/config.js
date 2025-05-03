import "dotenv/config";

const config = {
  port: process.env.PORT || 5000,
  secret: process.env.JWT_SECRET || "tajni_kljuc_za_jwt_token_aviokompanija",
  mongo: process.env.MONGO || `mongodb://127.0.0.1:27017/avio-sistem`,
};

export default config;
