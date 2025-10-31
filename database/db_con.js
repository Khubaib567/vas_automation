
const {neon} = require('@neondatabase/serverless')
const Sequelize = require("sequelize");

// IMPORT THE .ENV VARIABLES IN DEVELOPMENT ENVIRONMENT.
if(process.env.NODE !=="production"){
  require('dotenv').config({path: '../.secrets/.env'})
}


module.exports = postgreSQLConnector = async () =>{
    try {
        const DATABASE_URL = process.env.POSTGRES_DB_URL
        // CHECK THE DB CONNECTION.
        const db = neon(DATABASE_URL);
      
        return db
        
    } catch (error) {
        throw new Error(error.message)
    }


}