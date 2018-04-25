const twitchAPI = {
    headers: {
        "client-id": "2ptsb12qaqxechb7k5u7332ranqezr"

    },
    getURI: (game = "League of Legends", limit = 20, offset = 0, lan = "zh-TW") => {
        var baseURL = "https://api.twitch.tv/kraken/streams/";
        let clientId = "2ptsb12qaqxechb7k5u7332ranqezr";
        return `${baseURL}?game=${game}&limit=${limit}&offset=${offset}&language=${lan}`;
    }
}

const ajax = (url, method, headers = {}, data = null) => {
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

function getTwitchData(cb) {
    ajax(twitchAPI.getURI(), "GET", twitchAPI.headers)
        .then(result => cb(null, JSON.parse(result)))
        .catch(err => cb(err));
}

getTwitchData((err, data) => {
    if (err) {
        return console.log(err);
    }

    const { streams } = data;
    const lists = document.querySelector(".list");
    for (let stream of streams) {
        lists.innerHTML += genItem(stream);
    }
});

function genItem(data) {
    return `
    <div class="item">
        <div class="img" style="background-image: url(${data.preview.medium})"></div>
        <div class="content">
            <div class="avatar">
                <img src="${data.channel.logo}" />
            </div>
            <div class="desc">
                <p>${data.channel.status}</p>
                <p>${data.channel.display_name}</p>
            </div>
        </div>
    </div>
    `;
}