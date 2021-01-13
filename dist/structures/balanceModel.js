"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceModel = void 0;
const serialport_1 = __importDefault(require("serialport"));
const balanceEventEmitter_1 = require("./balanceEventEmitter");
/**
 * Model designed to work with a specific balance.
 * @example
 * const balanceModel = new BalanceModel(BalanceId, BalanceOptions);
 * balanceModel.connect()
 *   .then((balanceModel) => balanceModel)
 *   .catch((error) => error);
 */
class BalanceModel extends balanceEventEmitter_1.BalanceEventEmitter {
    constructor(balanceId, options) {
        super();
        this.balanceId = balanceId;
        const { path } = options !== null && options !== void 0 ? options : {};
        this.portPath = path;
    }
    /**
     * Execute the sanitization of the data in string format.
     */
    sanitize(data) {
        return data;
    }
    /**
     * Initiate connection with the serialPort and attach the listeners with the parser with it.
     * @example
     * balanceModel.connect()
     *   .then((balanceModel) => balanceModel)
     *   .catch((error) => error);
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.serialPort = new serialport_1.default(this.portPath, Object.assign(Object.assign({}, this.portOpenOptions), { autoOpen: false }));
            yield new Promise((resolve, reject) => this.serialPort.open((err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            }));
            this.serialPort.pipe(this.parser);
            this.parser.addListener('data', (data) => {
                const dataSanitized = this.sanitize(typeof data === 'string' ? data : data.toString());
                if (dataSanitized === this.lastReading || !this.verify(dataSanitized))
                    return;
                this.lastReading = dataSanitized;
                try {
                    const convertedData = this.convert(dataSanitized);
                    this.emit('reading', convertedData);
                }
                catch (err) {
                    this.emit('error', err);
                    this.serialPort.close();
                }
            });
            this.serialPort.addListener('error', (err) => {
                this.emit('error', err);
            });
            this.serialPort.addListener('close', (err) => {
                this.emit('disconnect', this);
                this.disconnect(err);
            });
            this._readInterval = setInterval(() => {
                try {
                    this.requireData();
                }
                catch (err) {
                    this.emit('error', err);
                }
            }, 200);
        });
    }
    /**
    * If an error is provided it'll emit the serialPort error event,
    * remove all serialPort listeners,
    * clearInterval of the requisition of data,
    * and nullifies the current serialPort.
    * @example
    * balanceModel.disconnect()
    *   .then((balanceModel) => balanceModel)
    *   .catch((error) => error);
    */
    disconnect(err) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            if (err)
                this.emit('error', err);
            if ((_b = !((_a = this.serialPort) === null || _a === void 0 ? void 0 : _a.destroyed)) !== null && _b !== void 0 ? _b : false) {
                (_c = this.serialPort) === null || _c === void 0 ? void 0 : _c.removeAllListeners();
                (_d = this.serialPort) === null || _d === void 0 ? void 0 : _d.destroy(err);
            }
            if (!this.parser.destroyed)
                this.parser.removeAllListeners();
            if (this._readInterval)
                clearInterval(this._readInterval);
            this.serialPort = null;
            return this;
        });
    }
    /**
     * Await a disconnect and then execute a connect.
     */
    reconnect(err) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.disconnect(err);
            return this.connect();
        });
    }
}
exports.BalanceModel = BalanceModel;
exports.default = BalanceModel;
//# sourceMappingURL=balanceModel.js.map