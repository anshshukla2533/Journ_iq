# Backend setup

This backend expects environment variables defined in a `.env` file at the project root of the `backend` folder.

Copy the example:

```bash
cp .env.example .env
```

Then edit `.env` and set `MONGODB_URI` to your MongoDB connection string. For MongoDB Atlas, use a string like:

```
MONGODB_URI=mongodb+srv://anshshuklavg_db_user:<db_password>@journ.mce79xe.mongodb.net/?retryWrites=true&w=majority&appName=journ
```

Replace `<db_password>` with the actual password for the user.

Start the backend:

```bash
npm install
npm run dev
```

If you want me to write the password into `.env` for you I can, but I won't save secrets into repo files without explicit confirmation. You can set the value locally in your `.env` instead.
