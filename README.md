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

and you get that:

```json
[ { id: '5964356',
    gpuCoreFrequencies: [ 1145, 1145, 1145, 1145, 1167, 1145 ],
    gpuMemoryFrequencies: [ 2100, 2100, 2100, 2100, 2100, 2000 ],
    group: 'ether_dwarfpool',
    uptime: '1 week, 14 hours, 6 minutes',
    programStartDate: 2018-02-11T08:06:46.000Z,
    serverTime: 2018-02-18T22:14:07.000Z,
    lastSeenDate: 2018-02-18T22:13:18.000Z,
    totalRestarts: 282,
    kernel: '4.11.0-kfd-compute-rocm-rel-1.6-148',
    ip: '192.168.1.128',
    osVersion: 'RX 1146',
    hashRates: [ 29.01, 29.01, 29.03, 29.04, 28.94, 22.22 ],
    hashRate: 167.25,
    temperatures: [ 59, 60, 59, 59, 60, 61 ],
    fansSpeed: [ 32, 36, 37, 34, 100, 27 ] } ]
```