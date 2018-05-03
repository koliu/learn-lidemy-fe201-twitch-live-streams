import AJAX from "./ajax";
import { REGIONS } from "./i18n";
import getLocaleString from "./i18n";
import CONSTANTS from "./constants";

//使用 import 導入 css 檔，再由 style-loader 注入到 html.head
import style from '../sass/main.scss';

let _game = "League of Legends",
    _limit = 20,
    _offset = 0,
    _lan = getLocaleString(CONSTANTS.LOCALE.ID, REGIONS[CONSTANTS.REGION_ID.EN]),
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
    AJAX(twitchAPI.getURI(_game, _limit, _offset, _lan), "GET", twitchAPI.headers)
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
    return { x, y };
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
    for (let key in REGIONS) {
        let div = document.createElement("div");
        let text = document.createTextNode(getLocaleString(CONSTANTS.LOCALE.LANG, REGIONS[key]));
        div.appendChild(text);
        lang.appendChild(div);
        div.addEventListener("click", () => changeLanguage(key));
        div.classList.add(`btn-${key}`);
    }
}

function changeLanguage(region_id) {
    const region = REGIONS[region_id];
    if (_loading || (region === _lan)) {
        event.preventDefault();
        return false;
    }
    _loading = true;
    title.textContent = getLocaleString(CONSTANTS.LOCALE.TITLE, region);

    // reset items & props of Twitch
    _lan = region;
    _offset = 0;
    document.querySelector(".list").innerHTML = "";
    updateLangBtns(region_id);
    setTimeout(loadTwitchData, 50);
}

function updateLangBtns(region_id) {
    lang.childNodes.forEach(child => {
        const childClasses = child.classList;
        if (childClasses.contains(`btn-${region_id}`)) {
            childClasses.add('lang-selected');
        } else {
            childClasses.remove('lang-selected');
        }
    });
}

window.addEventListener("load", () => {
    initI18N();
    changeLanguage();
});
window.addEventListener("scroll", () => {
    if (!_loading && isReachBottom(300)) {
        _loading = true;
        console.log(`offset=${_offset}`)
        loadTwitchData();
    }
});