# Indico Check-In App

This is a Progressive Web App (PWA) that allows organizers to check in attendees to their event. It is intended to be used by mobile devices.

<p align="center">
    <img src="images/app1.png" width="33%" />
    <img src="images/app2.png" width="33%" />
    <img src="images/app3.png" width="33%" />
</p>

## Getting started with development

1. Clone the repository
2. Install dependencies with `npm ci`
3. Setup pre-commit hooks with `npm run prepare`
4. Run `npm start` to start the development server

## Deployed version

The app is deployed for production usage on https://checkin.getindico.io (hosted at CERN's datacenter in Switzerland) and may be freely used by anyone.
We do not collect any data from the app. All data are stored locally on your phone and the app only communicates with the Indico server(s) that you configure in the app.

## Self-hosting

If you would like to self-host the app, you can have a look at our [Dockerfile](./Dockerfile). The app is client-only so after building the app, you can use any static site hosting solution.

If you are self-hosting the app, you will also need to modify the Check-in app URL and the authorization callback URL in your Indico instance. See [here](https://docs.getindico.io/en/latest/config/settings/#CHECKIN_APP_URL) for more information.

We also recommend changing the name of the app in the [app manifest](public/manifest.json).

## Note

In applying the MIT license, CERN does not waive the privileges and immunities granted to it
by virtue of its status as an Intergovernmental Organization or submit itself to any jurisdiction.
