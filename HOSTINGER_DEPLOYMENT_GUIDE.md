# Hostinger Manual Deployment Guide for Marwar Event

This package contains the complete production-ready source code for **Marwar Event**. Follow these steps to manually deploy on Hostinger:

---

## Step 1: Upload and Extract Files

1. Log in to your **Hostinger hPanel**.
2. Go to **Websites** > choose your domain > click **Manage**.
3. Open **File Manager** (Files > File Manager).
4. Navigate to your website's root folder (usually `public_html`).
   - If there are default files like `default.php`, delete or back them up.
5. Click **Upload** (top right) and upload `marwar_event_deploy.zip`.
6. Right-click `marwar_event_deploy.zip` in File Manager and select **Extract**.
   - Extract directly into `public_html` so that `package.json`, `server.js`, `app`, etc. are in the root directory.

---

## Step 2: Create a MySQL Database on Hostinger

1. In hPanel, go to **Databases** > **Management** (or MySQL Databases).
2. Create a new MySQL database:
   - **Database Name**: e.g., `marwar_events` (Hostinger will prefix it, e.g., `u123456789_marwar_events`)
   - **Username**: e.g., `admin` (Hostinger will prefix it, e.g., `u123456789_admin`)
   - **Password**: Generate or set a strong password.
3. Save the full database name, full username, and password.

---

## Step 3: Configure Environment Variables (`.env`)

1. In File Manager inside `public_html`:
2. Find `.env.production.example` and rename/copy it to `.env` (or create a new `.env` file).
3. Set your connection string using `127.0.0.1` (Hostinger MySQL standard):
   ```env
   DATABASE_URL="mysql://u123456789_admin:YOUR_DB_PASSWORD@127.0.0.1:3306/u123456789_marwar_events"
   NODE_ENV="production"
   PORT=3000
   ```

---

## Step 4: Configure Node.js in Hostinger hPanel

1. In hPanel, go to **Advanced** > **Node.js** (or search "Node.js" in the top bar).
2. Click **Create Application** (or Edit existing):
   - **Node.js version**: Select **Node.js 20.x** (or 22.x).
   - **Application mode**: `Production`
   - **Application root**: `public_html` (or the folder where files were extracted)
   - **Application startup file**: `server.js`
3. Click **Save** or **Create**.

---

## Step 5: Install Dependencies & Build

### Option A: Via Hostinger hPanel (GUI)

1. In the Node.js application page, click **Run NPM Install** (or "Install Dependencies").
2. Once installed, if hPanel provides an "NPM Run" tool:
   - Run `build` script (which generates Prisma client and builds Next.js).
   - Run `db:push` script (`npx prisma db push`) to create all tables in your MySQL database.

### Option B: Via SSH Terminal (Recommended for quick 1-click execution)

1. In hPanel, go to **Advanced** > **SSH Access** and enable SSH.
2. Connect using your terminal:
   ```bash
   ssh -p 65002 u123456789@your-hostinger-ip
   ```
3. Navigate to your app directory:
   ```bash
   cd public_html
   ```
4. Run the setup commands:
   ```bash
   npm install
   npx prisma db push
   npm run build
   ```

---

## Step 6: Start / Restart the Application

1. In hPanel > **Node.js**, click **Restart Application** (or **Start Application**).
2. Visit your domain in the browser (e.g., `https://yourdomain.com`).
3. Your Marwar Event application is now live!

u476326650_marwar_event

4TyO~JtF^a

mysql://u476326650_marwar_event:4TyO~JtF^a@127.0.0.1:3306/u476326650_marwar_event
