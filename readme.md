# BLOG APP BACKEND REST APIs

## _SETUP_

## DB DIAGRAM

- [DBDIAGRAM]

## POSTMAN COLLECTION

- [POSTMAN]

## Running Express Epplication

- Clone the backend application.
- Enter into application and run the command
- `npm install or npm i`
- Setup the environment variables.
- Create a .env file in root structure of project and setup below environment variables
- `DATABASE_URL="postgresql://<DB_USERNAME>:<DB_PASSWORD>@<DB_HOST>:<DB_PORT>/<DATABASE_NAME>?schema=public"`
- `JWT_SECRET=<YOUR_JWT_SECRET_KEY>`
- `ACCESS_TOKEN_EXPIRE="30m"` Or any time you want to set
- `REFRESH_TOKEN_EXPIRE="7d"` Or any time you want to set
- Run `npm start` and your APIs are up and running.

[//]: # "Links"
[DBDIAGRAM]: https://dbdiagram.io/d/Mini-Blog-App-66547e16b65d933879c55815
[POSTMAN]: https://git.geekyants.com/farhan/mini_blog_app_nodejs/-/blob/main/Mini%20Blog%20App%20Node%20js.postman_collection.json?ref_type=heads
