"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const serialport_1 = tslib_1.__importDefault(require("serialport"));
const port5 = new serialport_1.default('COM5', () => {
    setInterval(() => port5.write('teste'), 500);
});
const port6 = new serialport_1.default('COM6', () => {
    port6.addListener('data', (data) => console.log(data.toString()));
});
//# sourceMappingURL=testing.js.map