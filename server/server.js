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

const events = (eventIds) => {
    return Event.find({ _id: { $in: eventIds } }).then(events => {
        return events.map(event => {
            return { ...event._doc, _id: event.id, creator: user.bind(this, event.creator) }
        })
    }).catch(err => {
        throw err
    })
}

const user = (userId) => {
    return User.findById(userId).then(user => {
        return { ...user._doc, _id: user.id, createdEvents: events.bind(this, user._doc.createdEvents) }
    }).catch(err => { throw err })
}
app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }
        
        type User {
            _id: ID!
            email: String!
            password: String
            createdEvents: [Event!]
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
        events: async () => {
            try {
                const events = await Event.find().populate('creator');
                return events.map((row) => ({
                    ...row._doc,
                    _id: row.id,
                    creator: user.bind(this, row._doc.creator)
                }))
            } catch (err) {
                throw new Error(`Fetching events failed: ${err.message}`)
            }
        },
        createEvent: async ({ eventInput }) => {
            try {
                const event = new Event({
                    title: eventInput.title,
                    description: eventInput.description,
                    price: parseFloat(eventInput.price),
                    date: new Date(eventInput.date),
                    creator: '6801e6b9848eb3f90ae2a76c'
                });

                const result = await event.save();

                const creatorUser = await User.findById('6801e6b9848eb3f90ae2a76c');
                if (!creatorUser) {
                    throw new error("User not found!")
                };

                creatorUser.createdEvents.push(event);
                await creatorUser.save()

                return {
                    ...result._doc,
                    _id: result.id
                };
            } catch (err) {
                console.error('Failed to create event:', err);
                throw new Error(`Event creation failed: ${err.message}`);
            }
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


