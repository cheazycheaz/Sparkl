"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// client/PrivyWrapper.tsx
var react_1 = __importDefault(require("react"));
var react_auth_1 = require("@privy-io/react-auth");
var PrivyWrapper = function (_a) {
    var children = _a.children;
    return (react_1.default.createElement(react_auth_1.PrivyProvider, { appId: "clx9jtfgm08in7t5z52xwr2oy" }, children));
};
exports.default = PrivyWrapper;
