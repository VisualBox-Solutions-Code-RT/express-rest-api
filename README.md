# Express API

This is an example of running Express.js with Node.js using a few npm modules to get you started.

This is still a work in progress and will be updated when possible. Any suggestions/corrections are welcome. :D


**Out of the box support**
- JWT (`jsonwebtoken`)
- SQL Server (`mssql`) includes script (`data/sql/seed/create-objects.sql`)
- Emails with Nodemailer (`nodemailer` & `nodemailer-express-handlebars`) & SendGrid (Requires account)
- Two-Factor Authentication (`speakeasy`)
- ESLint configured (`eslint`)
- .env (`dotenv`)
- File Upload (`express-fileupload`)
- Docker
- Error Handling Middleware
- CORS
- Azure Storage Blob


**Notes**
- Send email for Email Confirmation separately (maybe)
- Comment out all TEST res.json() responses in auth controller
- Remove console.log() lines for product



**TODOs**
- Password REGEX
- Azure Storage Queue 
- Add MongoDB Access
- Add CosmosDB Access


**Getting Started**
1. run `npm install`
2. update `.env` file with SQL and SendGrid credentials
3. apply `data/sql/seed/create-objects.sql` script to your SQL DB
4. run `npm run dev`
5. import `Express API.postman_collection.json` into Postman
6. test API