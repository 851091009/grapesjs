import Promise from 'promise-polyfill';

window.Promise = window.Promise || Promise;

export default typeof fetch == 'function' ? fetch.bind() : (url, options) => {
  return new Promise((res, rej) => {
    const req = new XMLHttpRequest();
    req.open(options.method || 'get', url);
    req.withCredentials = options.credentials == 'include';

    for (let k in options.headers || {}) {
      req.setRequestHeader(k, options.headers[k]);
    }

    req.onload = e => res({
      status: req.status,
      statusText: req.statusText,
      text: () => Promise.resolve(req.responseText)
    });
    req.onerror = rej;

    // Actually, fetch doesn't support onProgress feature
    // 其实，取不支持进步的特征
    if (req.upload && options.onProgress) {
      req.upload.onprogress = options.onProgress;
    }

    req.send(options.body);
  });
}
