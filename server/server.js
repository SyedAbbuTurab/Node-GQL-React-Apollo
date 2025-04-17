const server = require("express");
const { graphqlHTTP } = require('express-graphql');
const bodyParser = require("body-parser");
const { buildSchema } = require("graphql");
const dotEnv = require("dotenv").config();
const mongoose = require("mongoose")
const Event = require("./models/events.js")

const app = server();

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
            return Event.find().then(events => {
                return events.map((row) => {
                    return { ...row._doc }
                })
            }).catch(err => {
                console.log(err)
            })
        },
        createEvent: ({ eventInput }) => {
            const event = new Event({
                title: eventInput.title,
                description: eventInput.description,
                price: +eventInput.price,
                date: new Date(eventInput.date)
            })
            return event.save().then(result => {
                console.log(result)
                return { ...result._doc };

            }).catch((err) => {
                console.log(err);
                throw err;
            })
        }
    },
    graphiql: true
}));

mongoose.connect(`mongodb+srv://syedabbuturab786:${process.env.MONGO_PASSWORD}@cluster0.a0vziuw.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority&appName=Cluster0`).then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Express GraphQl running on PORT:${process.env.PORT}`);
    })
}).catch((err) => {
    console.log(err);

})


