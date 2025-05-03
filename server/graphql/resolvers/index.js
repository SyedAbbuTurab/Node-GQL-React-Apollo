const bcrypt = require("bcryptjs")
const Event = require("../../models/events.js")
const User = require("../../models/user.js")
const Booking = require("../../models/bookings.js")

const events = async (eventIds) => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } })
        return events.map(event => {
            return {
                ...event._doc, _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            }
        })
    } catch (err) {
        throw err
    }
}

const singleEvent = async (eventId) => {
    try {
        const event = await Event.findById(eventId);
        return {
            ...event._doc, _id: event.id, creator: user.bind(
                this, event.creator
            )
        }
    } catch (error) {
        throw error
    }
}

const user = async (userId) => {
    try {
        const user = await User.findById(userId)
        return { ...user._doc, _id: user.id, createdEvents: events.bind(this, user._doc.createdEvents) }
    } catch (err) {
        throw err
    }
}

module.exports = {
    events: async () => {
        try {
            const events = await Event.find().populate('creator');
            return events.map((row) => ({
                ...row._doc,
                _id: row.id,
                date: new Date(row._doc.date).toISOString(),
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
                _id: result.id,
                date: new Date(row._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            };
        } catch (err) {
            console.error('Failed to create event:', err);
            throw new Error(`Event creation failed: ${err.message}`);
        }
    },
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    _id: booking.id,
                    user: user.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking.createdAt).toISOString(),
                    updatedAt: new Date(booking.updatedAt).toISOString(),
                }
            })
        } catch (error) {
            throw error;
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
    },
    bookEvent: async (args) => {
        const fetchedEvent = await Event.findOne({ _id: args.eventId })
        const booking = new Booking({
            user: '6801e6b9848eb3f90ae2a76c',
            event: fetchedEvent
        });
        const result = await booking.save();
        return {
            ...result._doc,
            _id: result.id,
            user: user.bind(this, booking._doc.user),
            event: singleEvent.bind(this, booking._doc.event),
            createdAt: new Date(result.createdAt).toISOString(),
            updatedAt: new Date(result.updatedAt).toISOString(),
        }
    }

}
