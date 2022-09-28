const {User} = require('../models');
const {AuthenticationError} = require('apollo-server-express');
const {signToken} = require('../utils/auth');

const resolvers = {
    Query: {
        // context = req
        me: async (_, args, context) => {
            if (context.user) {
                const {email} = context.user;

                const data = await User.findOne({email})
                .select('-__v -password');
                // populate book list later

                return data;
            };

            throw new AuthenticationError('You need to be logged in to view this page.');
        }
    },
    Mutation: {
        login: async (_, args) => {
            console.log('mutation: login');

            const {email, password} = args;

            const user = await User.findOne({email});
            if (!user) {
                throw new AuthenticationError('Something went wrong. Check your inputs and try again.');
            }

            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Something went wrong. Check your inputs and try again.');
            }

            const token = signToken(user);
            return {token, user};
        },

        addUser: async (_, args) => {
            console.log('mutation: addUser');

            const user = await User.create(args);
            
            const token = signToken(user);
            return {token, user};
        }
    }
};

module.exports = resolvers;