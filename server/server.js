const server = require("express");
const graphQlHttp = require("express-graphql");
const bodyParser = require("body-parser");
const dotEnv = require("dotenv").config();

const app = server();

app.use(bodyParser.json());
app.use('/graphql', graphQlHttp({}));

app.listen(process.env.PORT, ()=>{
    console.log(`Express GraphQl running on PORT:${process.env.PORT}`);
    
})

