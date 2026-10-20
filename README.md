# FSD

Workshop exercises and a small Express product API.

To run the product API from a fresh checkout, install the versions recorded in its lockfile:

```sh
cd Productrestapi
npm ci
npm test
npm start
```

Installed dependencies in `node_modules` are generated locally and are not tracked in Git. Keep `package.json` and `package-lock.json` committed when changing dependencies.
