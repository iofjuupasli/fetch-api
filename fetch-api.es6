import fetch from 'isomorphic-fetch';
import qs from 'querystring';

export class ApiError extends Error {
  constructor(payload) {
    super('Can\'t load data');
    this.payload = payload;
  }
}

export class ServerError extends ApiError {}

export default ({
  baseApiUrl,
  apiPrefix,
  defaultQueryStringObject,
}) => {
  const buildUrl = (path, queryStringObject = {}) =>
    `${baseApiUrl}/${apiPrefix}/${path}?${qs.stringify({ ...defaultQueryStringObject, ...queryStringObject })}`;

  const responseHandler = (response) => {
    if (response.status >= 500) {
      return response.text()
        .then((text) => { throw new ServerError(text); });
    }
    if (response.status >= 400) {
      return response.json()
        .catch(() => response.text())
        .then((obj) => { throw new ApiError(obj); });
    }
    return response.json()
      .then(obj => obj.results || obj);
  };

  const getJsonHeaders = {
    Accept: 'application/json',
  };

  const postJsonHeaders = {
    ...getJsonHeaders,
    'Content-Type': 'application/json',
  };

  const get = (path, queryStringObject) =>
    fetch(buildUrl(path, queryStringObject), { headers: getJsonHeaders })
      .then(responseHandler);

  const post = (path, queryStringObject, body) =>
    fetch(buildUrl(path, queryStringObject), {
      method: 'POST',
      headers: postJsonHeaders,
      body: JSON.stringify(body),
    })
      .then(responseHandler);

  const put = (path, queryStringObject, body) =>
    fetch(buildUrl(path, queryStringObject), {
      method: 'PUT',
      headers: postJsonHeaders,
      body: JSON.stringify(body),
    })
      .then(responseHandler);

  const del = (path, queryStringObject, body) =>
    fetch(buildUrl(path, queryStringObject), {
      method: 'DELETE',
      headers: postJsonHeaders,
      body: JSON.stringify(body),
    })
      .then(responseHandler);

  const postRaw = (path, queryStringObject, files) => {
    const body = new window.FormData();
    files.forEach((file, i) => {
      body.append(`file${i}`, file);
    });
    return fetch(buildUrl(path, queryStringObject), {
      method: 'POST',
      body,
    })
      .then(responseHandler);
  };

  return {
    get,
    post,
    put,
    del,
    postRaw,
  };
}
