import { Feature } from "./structures/Feature";
import express from "express";
import path from "path";
import session from "express-session";
import passport from "passport";
import MemoryStore from "memorystore";
import * as passportDiscord from "passport-discord";
import { DashboardConfig } from "./typings/Config";
import bodyParser from "body-parser";
import url from "url";
import fetch from "node-fetch";

export default new Feature((client) => {
  const settings: DashboardConfig = require("../site/settings.json");

  const app = new express();
  const memory = MemoryStore(session);
  const Strategy = passportDiscord.Strategy;

  app.set("view engine", "ejs");
  app.set("views", path.join(process.cwd(), "site/pages"));
  app.use(express.static(path.join(process.cwd(), "site/styles")));

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));
  passport.use(
    new Strategy(
      {
        clientID: settings.clientId,
        clientSecret: process.env.secret,
        callbackURL: settings.callback,
        scope: ["identify", "guilds"],
      },
      (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
      }
    )
  );

  app.use(
    session({
      store: new memory({ checkPeriod: 86400 }),
      secret: `#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n`,
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // For verification
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
  };

  app.get(
    "/login",
    (req, res, next) => {
      if (req.session.backURL) {
        req.session.backURL = req.session.backURL;
      } else if (req.headers.referer) {
        const parsed = url.parse(req.headers.referer);
        if (parsed.hostname === app.locals.domain) {
          req.session.backURL = parsed.path;
        }
      } else {
        req.session.backURL = `/`;
      }
      next();
    },
    passport.authenticate(`discord`, { prompt: `none` })
  );

  app.get(`/logout`, function (req, res) {
    req.session.destroy(() => {
      req.logout();
      res.redirect(`/`);
    });
  });

  app.get(
    `/callback`,
    passport.authenticate("discord", { failureRedirect: "/error" }),
    async (req, res) => {
      let banned = settings.banned;
      if (banned.includes(req.user.id)) {
        req.session.destroy(() => {
          res.json({
            error: true,
            logout: true,
            message: `You are banned from accessing the verification system.`,
          });
          req.logout();
        });
      } else {
        res.redirect("/verify");
      }
    }
  );

  app.get("/", (_, res) => {
    res.redirect("https://dsc.gg/graphify");
  });

  app.get("/success", (_, res) => {
    res.render("success", {
      bot: client,
      title: "Successful Verification",
    });
  });

  app.get("/error", (_, res) => {
    res.render("error", {
      bot: client,
      title: "Error",
    });
  });

  app.get("/verify", async (req, res) => {
    if (!req.isAuthenticated() || !req.user)
      return res.render("login", {
        bot: client,
        title: "Verification",
      });

    const guild = client.guilds.cache.get(client.config.guildId);
    if (!req.user?.guilds.find((v) => v.id === client.config.guildId))
      return res.redirect(
        `/error?${encodeURIComponent(
          `You are not in the ${guild.name} server.`
        )}`
      );

    let user = guild.members.cache.get(req.user.id);
    if (!user) {
      try {
        user = await guild.members.fetch(req.user.id);
      } catch (err) {
        console.error(err);
      }
    }
    if (!user)
      return res.redirect(
        `/error?${encodeURIComponent("User information could not be found.")}`
      );

    const role = guild.roles.cache.get(client.config.roles.member);

    if (user.roles.cache.has(role.id))
      return res.redirect(
        `/error?${encodeURIComponent("You're already verified.")}`
      );

    res.render("verify", {
      bot: client,
      title: "Verification",
    });
  });

  app.post("/verify", async (req, res) => {
    const response_key = req.body["g-recaptcha-response"];
    const secret_key = process.env.googleKey;

    const guild = client.guilds.cache.get(client.config.guildId);

    if (!req.user) return res.redirect("/verify");

    let user = guild.members.cache.get(req.user.id);
    if (!user) {
      try {
        user = await guild.members.fetch(req.user.id);
      } catch (err) {
        console.error(err);
      }
    }
    if (!user)
      return res.redirect(
        `/error?${encodeURIComponent("User information could not be found.")}`
      );

    const role = guild.roles.cache.get(client.config.roles.member);

    fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`,
      {
        method: "post",
      }
    )
      .then((res) => res.json())
      .then((data: any) => {
        // google_response is the object return by
        // google as a response
        if (data.success == true) {
          //   if captcha is verified
          user.roles.add(role);
          res.redirect("/success");
        } else {
          // if captcha is not verified
          return res.redirect(
            `/verify?alert=${encodeURIComponent("Invalid captcha. Try again.")}`
          );
        }
      })
      .catch((err) => {
        // Some error while verify captcha
        return res.redirect(`/error?${encodeURIComponent(err)}`);
      });
  });

  app.listen(settings.port, () => {
    console.log(`Listening on port ${settings.port}`);
  });
});
