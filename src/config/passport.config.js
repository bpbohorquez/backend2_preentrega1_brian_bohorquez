import passport from "passport";
import local from "passport-local";
import userModel from "../models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";
import { generateToken, authToken } from "../utils.js";
import jwt from "passport-jwt";

const LocalStrategy = local.Strategy;

const JMTStrategy = jwt.Strategy;

const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, username, password, done) => {
        // const { first_name, last_name, email, age } = req.body;
        const { first_name, last_name, email, age, cart, role } = req.body;

        try {
          let user = await userModel.findOne({ email: username });
          if (user) {
            console.log("El usuario ya está registrado");
            return done(null, false);
          }

          const newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            cart,
            role,
          };

          let result = await userModel.create(newUser);

          const access_token = generateToken(newUser);

          console.log("Usuario creado" + access_token);
          return done(null, access_token);
        } catch (error) {
          return done("Error al obtener el usuario" + error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    let user = await userModel.findById(id);
    done(null, user);
  });

  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          const user = await userModel.findOne({ email: username });
          if (!user) {
            console.log("El usuario no existe");
            return done(null, false);
          }
          if (!isValidPassword(user, password)) return done(null, false);

          const access_token = generateToken(user);

          return done(null, access_token);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

export default initializePassport;
