const server = require("express");
const { graphqlHTTP } = require('express-graphql');
const bodyParser = require("body-parser");
const dotEnv = require("dotenv").config();
const mongoose = require("mongoose")
const graphQlSchema = require("./graphql/schema/index")
const graphQlResolvers = require("./graphql/resolvers/index")


const app = server();

app.use(bodyParser.json());


app.use('/graphql', graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
}));

mongoose.connect(`mongodb+srv://syedabbuturab786:${process.env.MONGO_PASSWORD}@cluster0.a0vziuw.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Express GraphQl running on PORT:${process.env.PORT}`);
        })
    }).catch((err) => {
        console.log(err);

    })


