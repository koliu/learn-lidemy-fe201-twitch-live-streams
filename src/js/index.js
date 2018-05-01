import ajax from "./ajax.js";

let _game = "League of Legends",
    _limit = 20,
    _offset = 0,
    _lan = "zh-TW",
    _loading = false;

const twitchAPI = {
    baseURL: "https://api.twitch.tv/kraken/streams/",
    headers: {
        "client-id": "2ptsb12qaqxechb7k5u7332ranqezr"
    },
    getURI(game, limit, offset, lan) {
        return `${this.baseURL}?game=${game}&limit=${limit}&offset=${offset}&language=${lan}`;
    }
}

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

        const {
            streams
        } = data;
        const lists = document.querySelector(".list");
        for (const stream of streams) {
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

function getScrollXY() {
    let x = 0,
        y = 0;

    if (typeof(window.pageYOffset) == 'number') {
        //Netscape compliant
        y = window.pageYOffset;
        x = window.pageXOffset;
    } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
        //DOM compliant
        y = document.body.scrollTop;
        x = document.body.scrollLeft;
    } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
        //IE6 standards compliant mode
        y = document.documentElement.scrollTop;
        x = document.documentElement.scrollLeft;
    }
    return {
        x,
        y
    };
}

function getDocHeight() {
    return Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.body.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight,
    );
}

function isReachBottom(prefix = 0) {
    const scrollHeight = getScrollXY().y;
    const windowInnerHeight = window.innerHeight;
    const bodyHeight = getDocHeight();
    return bodyHeight - (windowInnerHeight + scrollHeight) <= prefix;
}

const title = document.querySelector(".title");
const lang = document.querySelector(".lang");

function initI18N() {
    lang.innerHTML = "";
    Object.keys(window.I18N).forEach(key => {
        lang.innerHTML += `<div class="btn-${key}" onclick="changeLanguage('${key}')">${window.I18N[key].LANG}</div>`;
    });
}

function updateLangBtns(selectedLang) {
    lang.childNodes.forEach(child => {
        const childClasses = child.classList;
        if (childClasses.contains(`btn-${selectedLang}`)) {
            childClasses.add('lang-selected');
        } else {
            childClasses.remove('lang-selected');
        }
    });
}

function changeLanguage(lang) {
    if (_loading || (lang === _lan)) {
        event.preventDefault();
        return false;
    }
    _loading = true;
    title.textContent = window.I18N[lang].TITLE;

    // reset items & props of Twitch
    _lan = lang;
    _offset = 0;
    document.querySelector(".list").innerHTML = "";
    updateLangBtns(_lan);
    setTimeout(loadTwitchData, 50);
}

window.addEventListener("load", () => {
    initI18N();
    changeLanguage("en");
});
window.addEventListener("scroll", () => {
    if (!_loading && isReachBottom(300)) {
        _loading = true;
        console.log(`offset=${_offset}`)
        loadTwitchData();
    }
});