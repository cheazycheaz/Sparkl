"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// client/MyComponent.tsx
var react_1 = __importDefault(require("react"));
var react_auth_1 = require("@privy-io/react-auth");
var PrivyWrapper_1 = __importDefault(require("./PrivyWrapper"));
var MyComponent = function () {
    var login = (0, react_auth_1.usePrivy)().login;
    var handleButtonClick = function () {
        login();
    };
    return (react_1.default.createElement(PrivyWrapper_1.default, null,
        react_1.default.createElement("button", { onClick: handleButtonClick }, "Spark my curiosity")));
};
exports.default = MyComponent;
