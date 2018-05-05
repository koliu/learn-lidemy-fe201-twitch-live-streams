export default (url, method, headers = {}, data = null) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'text';
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          reject(new Error(`${xhr.status}: ${xhr.statusText}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network Error'));

    xhr.open(method, url, true);
    if (headers) {
      Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));
    }
    xhr.send(data);
  });
