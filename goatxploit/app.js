import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import dotenv from 'dotenv';
import expressLayouts from 'express-ejs-layouts';
import connectPgSimple from 'connect-pg-simple';
import db from './models/index.js';
import flashMiddleware from './middleware/flash.js';
import { attachCsrfToken, verifyCsrf } from './middleware/csrf.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import depositRoutes from './routes/deposit.js';
import orderRoutes from './routes/orders.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PgStore = connectPgSimple(session);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.tailwindcss.com', 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:']
    }
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
};

if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  sessionConfig.store = new PgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ssl: { rejectUnauthorized: false }
  });
}

app.use(session(sessionConfig));
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});
app.use(flashMiddleware);
app.use(attachCsrfToken);
app.use(verifyCsrf);

app.get('/', (req, res) => res.redirect('/products'));
app.use(authRoutes);
app.use(productRoutes);
app.use(depositRoutes);
app.use(orderRoutes);
app.use(profileRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Not Found' });
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  req.session.flash = { type: 'error', message: 'Terjadi kesalahan server.' };
  res.status(500).render('errors/500', { title: 'Server Error' });
});

const port = process.env.PORT || 3000;

db.sequelize.authenticate()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`GoatXploit running on port ${port}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Database connection error:', error.message);
  });
