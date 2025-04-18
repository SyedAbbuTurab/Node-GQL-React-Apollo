const server = require("express");
const { graphqlHTTP } = require('express-graphql');
const bodyParser = require("body-parser");
const { buildSchema } = require("graphql");
const dotEnv = require("dotenv").config();
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const Event = require("./models/events.js")
const User = require("./models/user.js")

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
        
        type User {
            _id: ID!
            email: String!
            password: String
        }

        
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        input UserInput {
            email: String!
            password: String!
        }
        type RootQuery {
            events: [Event!]!
        }
        
        type RootMutation {
            createEvent(eventInput: EventInput): Event   
            createUser(userInput: UserInput): User 
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
        },
        createUser: async ({ userInput }) => {
            try {
                const existingUser = await User.findOne({ email: userInput.email });
                if (existingUser) {
                    throw new Error('User Already Exists!');
                }

                const hashedPassword = await bcrypt.hash(userInput.password, 12);

                const user = new User({
                    email: userInput.email,
                    password: hashedPassword
                });

                const result = await user.save();

                return {
                    ...result._doc,
                    password: null,
                    _id: result.id
                };
            } catch (err) {
                throw new Error(`User creation failed: ${err.message}`);
            }
        }

    },
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


