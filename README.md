# smos_api
Reverse engineered API for Simple Mining OS

## Getting Started

To use this library in your project, run:
```bash
npm i smos_api
```

You can use TypeScript:

```typescript
import {API} from "smos_api";

const api = new API("qwe@qwe.com", "qwerty");
api.getListRigs().then((rigs) => {
    console.log(rigs);
});
```

or JavaScript:

```javascript
var smos_api = require("smos_api");
var api = new smos_api.API("qwe@qwe.com", "qwerty");
api.getListRigs().then(function (rigs) {
    console.log(rigs);
});
```