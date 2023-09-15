# Indico Check-In App
This is a Progressive Web App (PWA) that allows organizers to check in attendees to their event. It is intended to be used by mobile devices.

## Getting started with development
1. Clone the repository
2. Install dependencies with `npm ci`
3. Setup pre-commit hooks with `npm run prepare`
4. Setup the environment variables in the `.env` file. For development, you probably want to add `ESLINT_NO_DEV_ERRORS=true`
and `TSC_COMPILE_ON_ERROR=true`
5. Run `npm start` to start the development server

## Deployed Version
A test app is currently deployed on [Openshift](https://indico-checkin-test.app.cern.ch/).
