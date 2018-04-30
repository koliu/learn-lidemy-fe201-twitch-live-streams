let _game = "League of Legends",
    _limit = 20,
    _offset = 0,
    _lan = "zh-TW",
    _loading = false;

const twitchAPI = {
    headers: {
        "client-id": "2ptsb12qaqxechb7k5u7332ranqezr"

    },
    getURI: (game, limit, offset, lan) => {
        let baseURL = "https://api.twitch.tv/kraken/streams/";
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

let game = "League of Legends",
    limit = 20,
    offset = 0,
    lan = "zh-TW"

function getTwitchData(cb) {
    ajax(twitchAPI.getURI(_game, _limit, _offset, _lan), "GET", twitchAPI.headers)
        .then(result => {
            cb(null, JSON.parse(result));
        })
        .catch(err => cb(err));
}

function loadTwitchData() {
    getTwitchData((err, data) => {
        if (err) {
            return console.log(err);
        }

        const { streams } = data;
        const lists = document.querySelector(".list");
        for (let stream of streams) {
            lists.innerHTML += genItem(stream);
            _offset++;
        }
        _loading = false;
    });
}

function genItem(data) {
    return `
    <div class="item">
        <div class="preview">
            <img src="${data.preview.medium}" onload="this.style.opacity=1" />
        </div>
        <div class="content">
            <div class="avatar">
                <img src="${data.channel.logo}" onload="this.style.opacity=1" />
            </div>
            <div class="desc">
                <p>${data.channel.status}</p>
                <p>${data.channel.display_name}</p>
            </div>
        </div>
    </div>
    `;
}

function isReachBottom(prefix = 0) {
    let scrollHeight = window.pageYOffset;
    let windowInnerHeight = window.innerHeight;
    let bodyHeight = document.body.offsetHeight;
    console.log(`scrollHeight=${scrollHeight}, windowInnerHeight=${windowInnerHeight}, bodyHeight=${bodyHeight}, return=${(bodyHeight - (windowInnerHeight + scrollHeight))<=prefix}`);
    return bodyHeight - (windowInnerHeight + scrollHeight) <= prefix;
}

window.addEventListener("load", loadTwitchData());
window.addEventListener("scroll", () => {
    if (!_loading && isReachBottom(300)) {
        _loading = true;
        console.log(`offset=${_offset}`)
        loadTwitchData();
    }
});