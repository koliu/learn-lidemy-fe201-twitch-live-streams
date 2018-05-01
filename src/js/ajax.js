export default function ajax(url, method, headers = {}, data = null) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = "text";
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject(new Error(`${xhr.status}: ${xhr.statusText}`));
                }
            }
        };

        xhr.onerror = () => reject(new Error("Network Error"));

        xhr.open(method, url, true);
        if (headers) {
            for (let k in headers) {
                xhr.setRequestHeader(k, headers[k]);
            }
        }
        xhr.send(data);
    });
};