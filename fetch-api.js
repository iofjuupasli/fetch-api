'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ServerError = exports.ApiError = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ApiError = exports.ApiError = function (_Error) {
  _inherits(ApiError, _Error);

  function ApiError(payload) {
    _classCallCheck(this, ApiError);

    var _this = _possibleConstructorReturn(this, (ApiError.__proto__ || Object.getPrototypeOf(ApiError)).call(this, 'Can\'t load data'));

    _this.payload = payload;
    return _this;
  }

  return ApiError;
}(Error);

var ServerError = exports.ServerError = function (_ApiError) {
  _inherits(ServerError, _ApiError);

  function ServerError() {
    _classCallCheck(this, ServerError);

    return _possibleConstructorReturn(this, (ServerError.__proto__ || Object.getPrototypeOf(ServerError)).apply(this, arguments));
  }

  return ServerError;
}(ApiError);

exports.default = function (_ref) {
  var baseApiUrl = _ref.baseApiUrl;
  var apiPrefix = _ref.apiPrefix;
  var defaultQueryStringObject = _ref.defaultQueryStringObject;

  var buildUrl = function buildUrl(path) {
    var queryStringObject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return baseApiUrl + '/' + apiPrefix + '/' + path + '?' + _querystring2.default.stringify(_extends({}, defaultQueryStringObject, queryStringObject));
  };

  var responseHandler = function responseHandler(response) {
    if (response.status >= 500) {
      return response.text().then(function (text) {
        throw new ServerError(text);
      });
    }
    if (response.status >= 400) {
      return response.json().catch(function () {
        return response.text();
      }).then(function (obj) {
        throw new ApiError(obj);
      });
    }
    return response.json().then(function (obj) {
      return obj.results || obj;
    });
  };

  var getJsonHeaders = {
    Accept: 'application/json'
  };

  var postJsonHeaders = _extends({}, getJsonHeaders, {
    'Content-Type': 'application/json'
  });

  var get = function get(path, queryStringObject) {
    return (0, _isomorphicFetch2.default)(buildUrl(path, queryStringObject), { headers: getJsonHeaders }).then(responseHandler);
  };

  var post = function post(path, queryStringObject, body) {
    return (0, _isomorphicFetch2.default)(buildUrl(path, queryStringObject), {
      method: 'POST',
      headers: postJsonHeaders,
      body: JSON.stringify(body)
    }).then(responseHandler);
  };

  var put = function put(path, queryStringObject, body) {
    return (0, _isomorphicFetch2.default)(buildUrl(path, queryStringObject), {
      method: 'PUT',
      headers: postJsonHeaders,
      body: JSON.stringify(body)
    }).then(responseHandler);
  };

  var del = function del(path, queryStringObject, body) {
    return (0, _isomorphicFetch2.default)(buildUrl(path, queryStringObject), {
      method: 'DELETE',
      headers: postJsonHeaders,
      body: JSON.stringify(body)
    }).then(responseHandler);
  };

  var postRaw = function postRaw(path, queryStringObject, files) {
    var body = new window.FormData();
    files.forEach(function (file, i) {
      body.append('file' + i, file);
    });
    return (0, _isomorphicFetch2.default)(buildUrl(path, queryStringObject), {
      method: 'POST',
      body: body
    }).then(responseHandler);
  };

  return {
    get: get,
    post: post,
    put: put,
    del: del,
    postRaw: postRaw
  };
};
