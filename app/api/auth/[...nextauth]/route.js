import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google';

import User from "@models/user";
import { connectToDB } from "@utils/database";

console.log({
    clientId: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
})
const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    async session({ session }){
        const sessionUser = await User.findOne({
            email: session.user.email
        })

        session.user.id = sessionUser._id.toString();

        return session;
        
    },
    async signIn({ profile }){
        try {
            await connectToDB();

            //revisa si existe usuario
                const userExists = await User.findOne({
                    email: profile.email
                });
            //crear uno nuevo si no existe
            if(!userExists) {
                await User.create({
                    email: profile.email,
                    username: profile.name.replace(" ", " ").toLoweCase(),
                    image: profile.picture
                })
            }

            return true;
        } catch (error) {
            console.log(error);
            return false;

        }
    },
})

export {handler as GET, handler as POST};