const server = require("express");
const { graphqlHTTP } = require('express-graphql');
const bodyParser = require("body-parser");
const { buildSchema } = require("graphql");
const dotEnv = require("dotenv").config();

const app = server();

let events = [];

app.use(bodyParser.json());
app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        type RootQuery {
            events: [Event!]!
        }
        
        type RootMutation {
            createEvent(eventInput: EventInput): Event    
        }
        
        schema {
            query: RootQuery
            mutation: RootMutation
        }
        
    `),
    rootValue: {
        events: () => {
            return events;
        },
        createEvent: ({ eventInput }) => {
            const event = {
                _id: Math.random().toString(),
                title: eventInput.title,
                description: eventInput.description,
                price: +eventInput.price,
                date: eventInput.date
            }
            events.push(event);
            return event;
        }
    },
    graphiql: true
}));

app.listen(process.env.PORT, () => {
    console.log(`Express GraphQl running on PORT:${process.env.PORT}`);

})

