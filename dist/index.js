"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validRule = exports.isPattern = exports.checkLength = exports.isNull = exports.asyncFilterData = exports.filterData = void 0;
var util_1 = require("util");
var lodash_1 = require("lodash");
exports.filterData = function (filters, options, done) {
    var e_1, _a, e_2, _b;
    var info = {};
    try {
        for (var filters_1 = __values(filters), filters_1_1 = filters_1.next(); !filters_1_1.done; filters_1_1 = filters_1.next()) {
            var filter = filters_1_1.value;
            if (filter.ignore && util_1.isUndefined(filter.value))
                continue;
            info[filter.key] = filter.value;
            if (lodash_1.isObject(filter.value)) {
                for (var key in filter.value) {
                    var itemValid = exports.validRule(filter.value[key], filter.rules);
                    if (itemValid) {
                        if (itemValid.message) {
                            itemValid = __assign(__assign({}, itemValid), { message: util_1.format(itemValid.message, util_1.format(filter.label || '', key)) });
                        }
                        return done(null, itemValid);
                    }
                }
            }
            else {
                var itemValid = exports.validRule(filter.value, filter.rules);
                if (itemValid) {
                    if (itemValid.message) {
                        itemValid = __assign(__assign({}, itemValid), { message: util_1.format(itemValid.message, filter.label || '') });
                    }
                    return done(null, itemValid);
                }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (filters_1_1 && !filters_1_1.done && (_a = filters_1.return)) _a.call(filters_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (options && options.picks) {
        try {
            for (var _c = __values(options.picks), _d = _c.next(); !_d.done; _d = _c.next()) {
                var item = _d.value;
                var pick_1 = chooseOne(item.data);
                if (pick_1) {
                    return done(null, validMessage(item));
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    return done(info);
};
exports.asyncFilterData = function (filters, options) {
    return new Promise(function (resolve, reject) {
        exports.filterData(filters, options, function (data, error) {
            if (error) {
                reject(error);
            }
            else {
                resolve(data);
            }
        });
    });
};
exports.isNull = function (value) { return String(value || '').length === 0 && value !== 0; };
exports.checkLength = function (str) {
    var e_3, _a;
    var size = 0;
    if (exports.isNull(str))
        return size;
    var arr = str.split('');
    try {
        for (var arr_1 = __values(arr), arr_1_1 = arr_1.next(); !arr_1_1.done; arr_1_1 = arr_1.next()) {
            var word = arr_1_1.value;
            size++;
            (/[^\x00-\xff]/g.test(word)) && size++;
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (arr_1_1 && !arr_1_1.done && (_a = arr_1.return)) _a.call(arr_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return size;
};
exports.isPattern = function (value, rule) {
    if (rule.validator) {
        return rule.validator(value);
    }
    var regExp = util_1.isRegExp(rule.pattern) ? rule.pattern : new RegExp(rule.pattern || '');
    var valid = regExp.test(value);
    if (valid) {
        valid = isLength(value, rule);
    }
    return valid;
};
exports.validRule = function (value, rules) {
    var e_4, _a;
    try {
        for (var rules_1 = __values(rules), rules_1_1 = rules_1.next(); !rules_1_1.done; rules_1_1 = rules_1.next()) {
            var rule = rules_1_1.value;
            if (rule.required && exports.isNull(value)) {
                return validMessage(rule, 'Value cannot be empty.');
            }
            if ((rule.pattern || rule.validator) && !exports.isPattern(value, rule)) {
                return validMessage(rule, 'Wrong value format.');
            }
            else if (!isLength(value, rule)) {
                return validMessage(rule, 'Wrong value format of length.');
            }
            else if (isMaskWord(value, rule)) {
                return validMessage(rule, 'Wrong value of mask word.');
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (rules_1_1 && !rules_1_1.done && (_a = rules_1.return)) _a.call(rules_1);
        }
        finally { if (e_4) throw e_4.error; }
    }
    return null;
};
var isMaskWord = function (value, rule) {
    var valid = false;
    if (rule.maskWord) {
        var reg = void 0;
        if (util_1.isRegExp(rule.maskWord)) {
            reg = rule.maskWord;
        }
        else {
            var words = rule.maskWord.join('|');
            reg = new RegExp(words, 'gi');
        }
        valid = value.search(reg) > -1;
    }
    return valid;
};
var isLength = function (value, rule) {
    var valid = true;
    var size = exports.checkLength(value);
    if (rule.min && size < rule.min) {
        valid = false;
    }
    if (rule.max && size > rule.max) {
        valid = false;
    }
    return valid;
};
var validMessage = function (rule, message) {
    if (message === void 0) { message = ''; }
    return Object.assign({ message: message }, lodash_1.pick(rule, ['message', 'code']));
};
var chooseOne = function (data) {
    var e_5, _a;
    var result = true;
    try {
        for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
            var item = data_1_1.value;
            result = util_1.isUndefined(item);
            if (!result)
                break;
        }
    }
    catch (e_5_1) { e_5 = { error: e_5_1 }; }
    finally {
        try {
            if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
        }
        finally { if (e_5) throw e_5.error; }
    }
    return result;
};
